const util = require("util");
const exec = util.promisify(require("child_process").exec);
const path = require("path");
const redis = require('redis');
const crypto = require('crypto');
const fs = require('fs');

const MAXCACHEDELEMENTS = 2; 

module.exports = async function (job) {
    const { serverFilename, executableFilename } = job.data

    const redisClient = redis.createClient({
        url: 'redis://localhost:3002'
    });

    redisClient.on('error', (err) => console.log('Redis Client Error', err));

    await redisClient.connect();    

    try {
        let { error, stdout, stderr } = await exec(`ls ./uploads | grep -v .cc | grep -v .cpp | wc -l `);
        // if max element of executable is reached
        let executableNumber = stdout.replace(/\s/g, '');
        
        if (executableNumber == MAXCACHEDELEMENTS ) {
            // getting older executable
            ({ error, stdout, stderr } = await exec(`ls -t ./uploads | grep -v .cc | grep -v .cpp | tail -1`));
           
            // removing older executable 
            await exec(`rm ./uploads/${stdout}`);
            ({error, stdout, stderr} = await exec(`ls ./uploads | grep ${stdout}`)); // return source of the older exec 
            let filePos = path.join(__dirname, `../uploads/${stdout}`);

            // once we delete the excutable we need to remove the hash associated in redis
            fs.readFile(filePos.slice(0,-1), (err, data) => {
                programHash = crypto.createHash('sha512').update(data.toString()).digest('hex');
                exec(`docker ps -q -f "name=redis-waiting-queue" | xargs -o -I'{}' docker exec -it {} redis-cli HDEL ${programHash} program_name`);
                console.log(programHash + " :content deleted from the cache");
                exec(`rm ${filePos}`); // removing source since we don't need the file anymore
            });
        }

        ({error, stdout, stderr} = await exec(`g++ -o ./uploads/"${executableFilename}" ./uploads/"${serverFilename}"`));
        
        
        // If the file compiled without any error, stout|stderr|error should be empty
    } catch (error) {
        return Promise.resolve({
            error: 1002,
            description: error.stderr.replace(
                `./uploads/${serverFilename}`,
                `${executableFilename.replace(/-\d+$/, "")}.cpp`
            )
        });
    }

    try {
        // Executing the file in a sandbox env (macOS version - sandbox-exec) - Stdout max buffer size 200KB
        ({ error, stdout, stderr } = await exec(
            `timeout 5 sb -- ./uploads/"${executableFilename}"`,
            { maxBuffer: 200 * 1024 }
        ));
        // If the execution terminated on time, error|stderr should be empty, meanwhile stout should contain the output of the progam
    } catch (error) {
        let status = 1003;
        if (error.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER") {
            status = 1004;
        }
        return Promise.resolve({ error: status })
    }
    
    return Promise.resolve({
        headers: {
            filename: executableFilename.replace(/-\d+$/, ""),
            success: "true",
            output: stdout.replace(/\n/g, "\\n"),
        },
    })

};
