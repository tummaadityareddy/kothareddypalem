import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";
import "../pages/LoginPage.css";

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: FormEvent) => {e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await login({email, password, });
            localStorage.setItem("token", response.token);
            navigate("/dashboard");
        } catch (err) {
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {window.location.href = "http://localhost:8080/oauth2/authorization/google";
};

    return (
        <div className="login-page">

            {/* LEFT SIDE — IMAGE ONLY */}
            <div className="login-image-section">
                <img
                    src="/images/login-flower.jpg"
                    alt=""
                    className="login-image"
                />
            </div>

            {/* RIGHT SIDE — DYNAMIC CSS/HTML */}
            <div className="login-form-section">
                <div className="login-container">
                    <div className="login-header">
                        <span className="login-brand">Kothareddypalem</span>
                        <h1>Welcome back</h1>
                        <p>Sign in to manage your festival finances.</p>
                    </div>
                    <button
                        type="button"
                        className="google-button"
                        onClick={handleGoogleLogin}>
                        <span className="google-icon">G</span>
                        <span>Continue with Google</span>
                    </button>

                    <div className="divider">
                        <span></span>
                        <p>OR</p>
                        <span></span>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <div className="password-label">
                                <label htmlFor="password">Password</label>
                                <button
                                    type="button"
                                    className="forgot-password"
                                    onClick={() => navigate("/forgot-password")}>Forgot password?
                                </button>
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        {error && (<div className="login-error">{error}</div>)}
                        <button
                            type="submit"
                            className="signin-button"
                            disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>
                    <div className="signup-section">
                        <span>Don't have an account?</span>
                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            className="create-account">Create account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;