import React from "react";

import { Typography } from "antd";

import "./terminal.styles.scss";

const Terminal = ({ output }) => {
    const { Paragraph } = Typography;

    return (
        <>
            <Paragraph className="terminal">
                {output.replaceAll("\\n","\n")}
            </Paragraph>
        </>
    );
};

export default Terminal;
