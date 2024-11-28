import React from "react";
import { Layout, Button } from "@pankod/refine";

const Login: React.FC = () => {
    const handleLogin = () => {
        window.location.href = "/auth/google";
    };

    return (
        <Layout>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Button type="primary" onClick={handleLogin}>
                    Login with Google
                </Button>
            </div>
        </Layout>
    );
};

export default Login;
