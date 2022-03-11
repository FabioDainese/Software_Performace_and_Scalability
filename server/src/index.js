const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path")

const main = async () => {
    const app = express();
    const port = process.env.PORT || 3001;
    const storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, path.join(__dirname, "../uploads/"))
        },
        filename: (req, file, callback) => {
            callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
        },
        fileFilter: (req, file, callback) => {
            var extension = path.extname(file.originalname)
            if(extension !== ".cpp" && extension !== ".cc") {
                return callback(new Error("Only CPP and CC files are allowed!"))
            }
            callback(null, true) 
        },
    })
    const upload = multer({ storage: storage })
    const fileUpload = upload.fields([{ name: "file", maxCount: 1 }])

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.route("/upload")
        .post(fileUpload, (req, res) => {
            res.send({message: "File received correctly"})
        })

    app.listen(port, () => {
        console.log(`Server running locally on port ${port}`);
    });
};

main().catch((err) => {
    console.log(err);
});