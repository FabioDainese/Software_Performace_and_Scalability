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
        url: 'redis://redis:6379'
    });

    redisClient.on('error', (err) => console.log('Redis Client Error', err));

    await redisClient.connect();    

    try {    
        ({error, stdout, stderr} = await exec(`g++ -o ./uploads/${executableFilename} ./uploads/${serverFilename}`));
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
        let { error, stdout, stderr } = await exec(
            `timeout 5 firejail -- ./uploads/"${executableFilename}"`,
            { maxBuffer: 200 * 1024 }
        );
        
        // We use grep -v to exclude in the counting processs source files
        // Must need this since at this point source exists in the fs
        await exec(`ls ./uploads | grep -v .cc | grep -v .cpp | wc -l `);
        // if max element of executable is reached
        let executableNumber = stdout.replace(/\s/g, '');
        
        if (executableNumber == MAXCACHEDELEMENTS ) {
            // getting older executable
            ({ error, stdout, stderr } = await exec(`ls -t ./uploads | grep -v .cc | grep -v .cpp | tail -1`));
           
            let filePos = path.join(__dirname, `../uploads/${stdout}`);
            // once we delete the excutable we need to remove the hash associated in redis
            fs.readFile(filePos.slice(0,-1), (err, data) => {
                programHash = crypto.createHash('sha512').update(data.toString()).digest('hex');
                redisClient.HDEL(programHash, 'program_name');
                redisClient.HDEL(programHash, 'program_content');
                console.log(programHash + " : content successfully deleted from the cache");
                exec(`rm ${filePos}`); // removing source since we don't need the file anymore
            });
        }
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
            cached: "false",
            filename: executableFilename.replace(/-\d+$/, ""),
            success: "true",
            output: stdout.replace(/\n/g, "\\n"),
        },
    })

};
