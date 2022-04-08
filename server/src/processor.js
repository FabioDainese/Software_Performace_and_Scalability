const util = require("util");
const exec = util.promisify(require("child_process").exec);

module.exports = async function (job) {
    const { serverFilename, executableFilename } = job.data
    try {
        let { error, stdout, stderr } = await exec(`g++ -o ./uploads/${executableFilename} ./uploads/${serverFilename}`);
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
            `timeout 5 sb -- ./uploads/${executableFilename}`,
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
