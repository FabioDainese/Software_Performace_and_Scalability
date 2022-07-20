import React from "react";
import axios from "axios";
import fileDownload from "js-file-download";

import { Upload, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCode } from "@fortawesome/free-solid-svg-icons";

import "./upload.styles.scss";

const UploadArea = ({ setOutput }) => {
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
                responseType:'arraybuffer'
            };
            fmData.append("upload-area",file);
            try {
                const res = await axios.post("http://localhost:3001/upload",fmData,config);
                if (!res.headers['success']) {
                    let { error, description } = JSON.parse(new TextDecoder("utf-8").decode(res.data))
                    onError({ error, description });
                } else {
                    fileDownload(res.data, res.headers['filename']);
                    onSuccess();
                    if(res.headers['cached'] === "true") {
                        message.success(`${file.name} retrieved from cache successfully.`);
                    } else if(res.headers['cached'] === "false") {
                        message.success(`${file.name} compiled and executed successfully.`);
                    } 
                    setOutput(res.headers['output'])
                }
            } catch (err) {
                onError({ err });
            }
        },
        onChange(info) {
            const { status } = info.file;
    
            if (status === "error") {
                const { error, description } = info.file.error
                
                switch(error) {
                    case 1000:
                        message.error(`File extesion not supported.`);
                        setOutput("")
                        break
                    case 1001:
                        message.error(`The file exceeds the maximum allowed size.`);
                        setOutput("")
                        break
                    case 1002:
                        message.error(`Something went wrong during compilation time :(`);
                        setOutput(description)
                        break
                    case 1003:
                        message.error(`Your program didn't terminate on time (max 5 seconds).`);
                        setOutput("")
                        break
                    case 1004:
                        message.error(`Your program exeeded the max stdout buffer size (max 200KB).`);
                        setOutput("")
                        break
                    default:
                        message.error("Unknown error :/");
                        setOutput("")
                } 
            }
        },
        onRemove: file => {
            setOutput("")
            return true
        }
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
