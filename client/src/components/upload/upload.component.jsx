import React from "react";

import { Upload, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCode } from "@fortawesome/free-solid-svg-icons";

import "./upload.styles.scss";

const UploadArea = () => {
    const { Dragger } = Upload;
    const props = {
        name: "file",
        multiple: false,
        accept: ".cpp,.cc",
        maxCount: 1,
        action: "http://localhost:3001/upload",
        onChange(info) {
            const { status } = info.file;
            if (status !== "uploading") {
                // TODO - Remove this log before production
                console.log(info.file, info.fileList);
            }
            if (status === "done") {
                message.success(
                    `${info.file.name} file uploaded successfully.`
                );
            } else if (status === "error") {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        onDrop(e) {
            console.log("Dropped files", e.dataTransfer.files);
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
                    Supports only CPP and CC files
                </p>
            </Dragger>
        </>
    );
};

export default UploadArea;
