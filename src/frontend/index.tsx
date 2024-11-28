import React from "react";
import ReactDOM from "react-dom";
import { Refine, AuthProvider } from "@pankod/refine";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AuthCallback from "./pages/AuthCallback";

const App: React.FC = () => {
    const authProvider: AuthProvider = {
        login: async ({ providerName }) => {
            if (providerName === "google") {
                window.location.href = "/auth/google";
                return Promise.resolve();
            }
            return Promise.reject();
        },
        logout: async () => {
            window.location.href = "/";
            return Promise.resolve();
        },
        checkError: () => Promise.resolve(),
        checkAuth: () => Promise.resolve(),
        getPermissions: () => Promise.resolve(),
        getUserIdentity: () => Promise.resolve(),
    };

    return (
        <BrowserRouter>
            <Refine authProvider={authProvider}>
                <Routes>
                    <Route path="/" element={<AuthCallback />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </Refine>
        </BrowserRouter>
    );
};

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
);
