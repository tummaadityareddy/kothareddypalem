import { useEffect } from "react";
import {
    useNavigate,
    useSearchParams,
} from "react-router-dom";

function OAuth2SuccessPage() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        
        const token = searchParams.get("token");
        if (!token) {
            navigate("/login", {
                replace: true,
            });
            return;
        }

        localStorage.setItem(
            "token",
            token
        );

        navigate("/dashboard", {
            replace: true,
        });

    }, [searchParams, navigate]);

    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
            }}>
            Signing you in...
        </div>
    );
}

export default OAuth2SuccessPage;