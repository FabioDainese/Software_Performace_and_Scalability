import React from "react";

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
        action: "http://localhost:3001/upload",
        onChange(info) {
            const { status } = info.file;
            if (status !== "uploading") {
                // TODO - Remove this log before production
                //console.log(info.file, info.fileList);
            }
            if (status === "done") {
                if (info.file.response.error) {
                    info.file.status = "error"
                    switch(info.file.response.error) {
                        case 1000:
                            message.error(`${info.file.name} file extesion not supported.`);
                            break
                        case 1001:
                            message.error(`${info.file.name} file exceeds the maximum allowed size.`);
                            break
                        default:
                            message.error("Unknown error :/");
                    }
                } else {
                    message.success(`${info.file.name} file uploaded successfully.`);
                }
            } else if (status === "error") {
                message.error(`${info.file.name} file upload failed.`);
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
