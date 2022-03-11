import React from "react";
import { Layout } from "antd";

import { Homepage } from "./pages";

import "antd/dist/antd.min.css"
import "./app.styles.scss"

const App = () => {
    const { Content } = Layout;
    return (
        <div>
            <Layout>
                <Content className="main-content">
                    <Homepage />
                </Content>
            </Layout>
        </div>
    );
};

export default App;
