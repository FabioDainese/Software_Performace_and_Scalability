const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const redis = require('redis');
const Queue = require('bull');
const fs = require('fs');
const crypto = require('crypto');

const main = async () => {
    const app = express();
    const port = process.env.PORT || 3001;

    const waitingQueue = new Queue('waiting queue',{
        redis: {
            host: '127.0.0.1',
            port: 3002,
        }
    });
    
    const redisClient = redis.createClient({
        url: 'redis://localhost:3002'
    });

    redisClient.on('error', (err) => console.log('Redis Client Error', err));

    await redisClient.connect();

    const numWorkers = 4;
    waitingQueue.process(numWorkers, __dirname + "/processor.js");
    waitingQueue.on('failed', (job, result) => {
        console.log("The jobs failed unexpectedly :(")
    });

    const storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, path.join(__dirname, "../uploads/"));
        },
        filename: (req, file, callback) => {
            let extension = path.extname(file.originalname);
            let filename = path.basename(file.originalname, extension);
            callback(null, filename + "-" + Date.now() + extension);
        },
    });
    const upload = multer({
        storage: storage,
        fileFilter: (req, file, callback) => {
            let extension = path.extname(file.originalname);
            if (![".cpp", ".cc"].includes(extension)) {
                let error = new Error(
                    `INVALID FILE EXTENSION: Uploaded ${extension
                        .substring(1)
                        .toUpperCase()} file instead of CPP or CC`,
                    false
                );
                error.status = 1000;
                return callback(error);
            }
            callback(null, true);
        },
        // File size expressed in bytes (in this case 2MB)
        limits: { fileSize: 2 * 1024 * 1024 },
    });
    const fileUpload = upload.fields([{ name: "upload-area", maxCount: 1 }]);

    app.use(cors({ exposedHeaders: ["filename", "success", "output"] }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.route("/upload").post((req, res) => {
        fileUpload(req, res, async (error) => {
            if (error) {
                let status = error.status;
                if (!status) {
                    switch (error.code) {
                        case "LIMIT_FILE_SIZE":
                            status = 1001;
                            break;
                        default:
                            status = 0;
                    }
                }
                
                return res.send({ error: status });
            } else {
                serverFilename = req.files["upload-area"][0].filename;
                executableFilename = path.basename(serverFilename,path.extname(serverFilename));
                async function takeFromCache() {
                    fs.readFile(req.files["upload-area"][0].path, (err, data) => {
                        programHash = crypto.createHash('sha512').update(data.toString()).digest('hex');
                        cachedProgram = redisClient.hGetAll(programHash).then(
                            (content) => {
                                if (content.program_name !== undefined) {   
                                    exec(`rm ./uploads/${serverFilename}`);
                                    res.download(
                                        path.join(__dirname, `../uploads/${content.program_name}`),
                                        content.program_name.replace(/-\d+$/, ""), {
                                            headers: {
                                                filename: content.program_name.replace(/-\d+$/, ""),
                                                success: "true",
                                            }, 
                                        }
                                        
                                    );
                                } else {
                                    compileProgram();
                                }
                            }
                        );
                    })
                };

                async function compileProgram() {
                    // Absolutes path: req.files["upload-area"][0].path
                    const job = await waitingQueue.add({
                        serverFilename: serverFilename,
                        executableFilename: executableFilename
                    })
                    
                    const result = await job.finished();
                    if(result.error) {
                        res.send(result)
                    } else {

                        fs.readFile(req.files["upload-area"][0].path, (err, data) => {
                            if (data) {
                                programHash = crypto.createHash('sha512').update(data.toString()).digest('hex');
                                redisClient.hSet(programHash, "program_name", executableFilename).then(
                                    (content) => {
                                        res.download(
                                            path.join(__dirname, `../uploads/${executableFilename}`),
                                            executableFilename.replace(/-\d+$/, ""),
                                            result
                                        );
                                    }
                                );
                            }
                        });

                    }
                };

                const downloadPromise = new Promise(function(downloadCallback) {
                    downloadCallback();
                });
                
                downloadPromise.then(() => {
                    takeFromCache();
                });
                
                //await exec(`rm ./uploads/${serverFilename}`);
                //${result.error === 1002 ? "" : `./uploads/"${executableFilename}"`}`);
            }
        });
    });

    app.listen(port, () => {
        console.log(`Server running locally on port ${port}`);
    });
};

main().catch((err) => {
    console.log(err);
});