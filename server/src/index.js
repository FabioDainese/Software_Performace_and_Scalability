const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const util = require('util');
const exec = util.promisify(require("child_process").exec);

const main = async () => {
    const app = express();
    const port = process.env.PORT || 3001;
    const storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, path.join(__dirname, "../uploads/"));
        },
        filename: (req, file, callback) => {
            let extension = path.extname(file.originalname);
            let filename = path.basename(file.originalname, extension);
            callback(null, filename + "_" + Date.now() + extension);
        },
    });
    const upload = multer({
        storage: storage,
        fileFilter: (req, file, callback) => {
            let extension = path.extname(file.originalname)
            if (![".cpp", ".cc"].includes(extension)) {
                let error = new Error(`INVALID FILE EXTENSION: Uploaded ${extension.substring(1).toUpperCase()} file instead of CPP or CC`, false)
                error.status = 1000
                return callback(error)
            }
            callback(null, true);
        },
        // File size expressed in bytes (in this case 2MB)
        limits: { fileSize: 2 * 1024 * 1024 }
    });
    const fileUpload = upload.fields([{ name: "upload-area", maxCount: 1 }]);
 
    app.use(cors({exposedHeaders: ["filename","success"]}));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    function clean_unused_files(executable, executableFilename) {
        let cc_ext = path.join(__dirname, `..\\uploads\\${executableFilename}.cc`);
        let cp_ext = path.join(__dirname, `..\\uploads\\${executableFilename}.cp`);
        let txt_ext = path.join(__dirname, `..\\uploads\\${executableFilename}.txt`) 
        
        exec(`del ${executable} && del ${cc_ext} && del ${cp_ext} && del ${txt_ext}`, (err) => {
            if (err) {
                //error handling 
                console.log(`failed deleting compiled or/and source files: `, err);
            }    
        })
    }
    app.route("/upload").post((req, res) => {
        fileUpload(req, res, async (error) => {
            if (error) {
                let status = error.status
                if(!status) {
                    switch (error.code) {
                        case "LIMIT_FILE_SIZE":
                            status = 1001
                            break
                        default:
                            status = 0
                    }
                }

                // TODO - Remove this log before production
                // console.log(error.message)
                return res.send({ error: status })
            } else {
                let serverFilename = req.files["upload-area"][0].filename
                let executableFilename = path.basename(serverFilename, path.extname(serverFilename));
                // Absolutes path: req.files["upload-area"][0].path
                let { error, stdout, stderr } = await exec(`g++ -o .\\uploads\\${executableFilename} .\\uploads\\${serverFilename}`)
                if (error) {
                    console.log(`error: ${error.message}`);
                    return res.send({ error: message });
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return  res.send({ error: "Server error: 500" });
                }
                // TODO - Remove this log before production
                // console.log(`Successfully generated '${executableFilename}' executable file`);
                
                // Checking in sandbox before downloading the file
                try {
                    let executable = path.join(__dirname, `..\\uploads\\${executableFilename}.exe`)
                     
                    exec(`wt "C:\\Program Files\\Sandboxie\\Start.exe" /nosbiectrl ${executable}`) 
                    exec(`waitfor SomethingThatIsNeverHappening /t 10 2>NUL || tasklist | grep ${executableFilename}.exe > .\\uploads\\${executableFilename}.txt`, (error, stdout, stderr) => {
                        // error handling
                        if (error) {
                            console.log(`error: ${error.message}`);
                            // TODO: capire perché se andiamo a scrivere un file vuoto ritorna errore
                            //return res.send({ status: 'error', error: 500 });    
                        }

                        if (stderr) {
                            console.error(`stderr: ${stderr}`);
                            return res.send({ status: 'error', error: 500 });
                        }
                        // batch script to check program execution into sandbox
                        exec(`for %I in (".\\uploads\\${executableFilename}.txt") do @echo %~zI`, (error, size, stderr) => {
                            
                            // error handling
                            let executable_description = 'while trying to get executable size'
                            if (error) {
                                console.log(`error` + executable_description + `: ${error.message}`);
                                return res.send({ status: 'error', error: 500 });    
                            }

                            if (stderr) {
                                console.error(`stderr` + executable_description + `: ${stderr}`);
                                return res.send({ status: 'error', error: 500 });
                            }

                            if (parseInt(size) === 0) {
                                res.download(`${executable}`, executableFilename.replace(/-\d+$/, ""), {
                                        headers: {
                                            "filename": executableFilename.replace(/-\d+$/, "").concat(".exe"),
                                            "success": "true"
                                        }
                                    }, 
                                    (err) => {
                                        if (err) {
                                            //error handling 
                                            console.log(`error while downloading executable: `, err);
                                        }     
                                    }   
                                )     
                            } else {
                                let cc_ext = path.join(__dirname, `..\\uploads\\${executableFilename}.cc`);
                                let cp_ext = path.join(__dirname, `..\\uploads\\${executableFilename}.cp`);
                                let txt_ext = path.join(__dirname, `..\\uploads\\${executableFilename}.txt`) 
                                
                                exec(`del ${executable} && del ${cc_ext} && del ${cp_ext} && del ${txt_ext}`, (err) => {
                                    if (err) {
                                        //error handling 
                                        console.log(`failed deleting compiled or/and source files: `, err);
                                    }    
                                })

                                exec(`"C:\\Program Files\\Sandboxie\\Start.exe" /terminate`, (err) => {
                                    if (err) {
                                        //error handling 
                                        console.log(`failed terminating sandbox: `, err);
                                    }    
                                })
                                res.send({ status: 'error', error: 1002 });
                            }

                            let cc_ext = path.join(__dirname, `..\\uploads\\${executableFilename}.cc`);
                            let cp_ext = path.join(__dirname, `..\\uploads\\${executableFilename}.cp`);
                            let txt_ext = path.join(__dirname, `..\\uploads\\${executableFilename}.txt`) 
                            
                            exec(`del ${executable} && del ${cc_ext} && del ${cp_ext} && del ${txt_ext}`, (err) => {
                                if (err) {
                                    //error handling 
                                    console.log(`failed deleting compiled or/and source files: `, err);
                                }    
                            })

                            return res;
                        })
                    })
                } catch (e) {
                    console.error(`error:`, e);
                    return res.send({ status: 'error', error: 500 });
                }
            }
        })
    });

    app.listen(port, () => {
        console.log(`Server running locally on port ${port}`);
    });
};

main().catch((err) => {
    console.log(err);
});
