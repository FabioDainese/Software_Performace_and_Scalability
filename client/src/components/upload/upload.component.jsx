import React from "react";
import axios from "axios";
import fileDownload from "js-file-download";

import { Upload, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCode } from "@fortawesome/free-solid-svg-icons";

import "./upload.styles.scss";

const UploadArea = () => {
    const { Dragger } = Upload;

    const props = {
        name: "upload-area",
        multiple: false,
        accept: ".cpp,.cc",
        maxCount: 1,
        customRequest: async ({ onSuccess, onError, file, onProgress }) => {
            const fmData = new FormData();
            const config = {
                headers: { 
                    "content-type": "multipart/form-data",
                },
                onUploadProgress: event => {
                    message.loading(`Checking the file..`);
                },
                responseType:'arraybuffer', 
            };
            fmData.append("upload-area",file);
            try {
                const res = await axios.post("http://localhost:3001/upload",fmData,config);
                if (!res.headers['success']) {
                    let error = JSON.parse(new TextDecoder("utf-8").decode(res.data)).error
                    onError(error);
                } else {
                    fileDownload(res.data, res.headers['filename']);
                    onSuccess();
                }
            } catch (err) {
                onError({ err });
            }
        },
        onChange(info) {
            const { status, error } = info.file;
            if (status !== "uploading") {
                // TODO - Remove this log before production
                // console.log(info.file, info.fileList);
            }
            if (status === "done") {
                message.success(`${info.file.name} file uploaded successfully.`);
            } else if (status === "error") {
                switch(error) {
                    case 1000:
                        message.error(`File extesion not supported.`);
                        break
                    case 1001:
                        message.error(`The file exceeds the maximum allowed size.`);
                        break
                    case 1002:
                        message.error(`The file is not considered to be safe from the server.`)
                        break
                    case 500:
                        message.error(`Internal server error.`)
                        break 
                    default:
                        message.error("Unknown error :/");
                } 
            }
        },
        onDrop(e) {
            // TODO - Remove this log before production
            //console.log("Dropped files", e.dataTransfer.files);
        },
    };

    return (
        <>
            <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                    <FontAwesomeIcon icon={faFileCode} size="3x" />
                </p>
                <p className="ant-upload-text">
                    Click or drag the file here to upload it
                </p>
                <p className="ant-upload-hint">
                    Supports only CPP and CC files (max 2MB)
                </p>
            </Dragger>
        </>
    );
};

export default UploadArea;
