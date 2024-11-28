import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthCallback: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const response = await fetch("/auth/google/callback");
                if (response.ok) {
                    navigate("/dashboard");
                } else {
                    navigate("/error");
                }
            } catch (error) {
                console.error("Error handling auth callback:", error);
                navigate("/error");
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return <div>Loading...</div>;
};

export default AuthCallback;
