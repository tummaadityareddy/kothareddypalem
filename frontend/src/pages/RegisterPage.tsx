import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/api";
import "../pages/RegisterPage.css";

const RegisterPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setLoading(true);
        try {
            const response =
                await register({
                    name,
                    email,
                    password,
                });
            localStorage.setItem("token", response.token);
            navigate("/dashboard");
        } catch (err) {
            console.error("Registration failed:", err);
            setError(err instanceof Error ? err.message : "Unable to create account.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-image-section">
                <img
                    src="/images/login-flower.jpg"
                    alt=""
                    className="register-image"
                />
            </div>
            <div className="register-form-section">
                <div className="register-container">
                    <div className="register-header">
                        <span className="register-brand">Kothareddypalem</span>
                        <h1>Create your account</h1>
                        <p>Start managing your festival finances.</p>
                    </div>
                    <form onSubmit={handleSubmit}>

                        {/* NAME */}
                        <div className="register-form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) =>setName(e.target.value)}
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        {/* EMAIL */}
                        <div className="register-form-group">
                            <label htmlFor="register-email">Email</label>
                            <input
                                id="register-email"
                                type="email"
                                value={email}
                                onChange={(e) =>setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        {/* PASSWORD */}
                        <div className="register-form-group">
                            <label htmlFor="register-password">Password</label>
                            <input
                                id="register-password"
                                type="password"
                                value={password}
                                onChange={(e) =>setPassword(e.target.value)}
                                placeholder="Create a password"
                                minLength={6}
                                required
                            />
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="register-form-group">
                            <label htmlFor="confirm-password">Confirm password</label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                minLength={6}
                                required
                            />
                        </div>

                        {/* ERROR */}
                        {error && (<div className="register-error">{error}</div>)}

                        {/* CREATE ACCOUNT */}
                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}>
                            {loading ? "Creating account..." : "Create account"}
                        </button>
                    </form>
                    <div className="login-section">
                        <span>Already have an account?</span>
                        <button
                            type="button"
                            className="back-to-login"
                            onClick={() => navigate("/login")}>Sign in
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default RegisterPage;