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
            callback(null, filename + "-" + Date.now() + extension);
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
                const { error, stdout, stderr } = await exec(`g++ -o ./uploads/${executableFilename} ./uploads/${serverFilename}`)
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return;
                }
                // TODO - Remove this log before production
                // console.log(`Successfully generated '${executableFilename}' executable file`);
                
                res.download(path.join(__dirname, `../uploads/${executableFilename}`), executableFilename.replace(/-\d+$/, ""), {
                    headers: {
                        "filename": executableFilename.replace(/-\d+$/, ""),
                        "success": "true"
                    }
                })

                // TODO - Execute the file in a sandbox env here!

                await exec(`rm ./uploads/${executableFilename} ./uploads/${serverFilename}`)
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
