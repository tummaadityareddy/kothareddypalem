import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/api";
import "./ForgotPasswordPage.css";

function ForgotPasswordPage() {

    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: FormEvent) => {e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);
        try {
            const response = await forgotPassword({email,});
            setMessage(response || "Password reset link has been sent.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to process request");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="forgot-password-page">
            <div className="forgot-password-image-section">
                <img
                    src="/images/login-flower.jpg"
                    alt=""
                    className="forgot-password-image"
                />
            </div>
            <div className="forgot-password-form-section">
                <div className="forgot-password-container">
                    <div className="forgot-password-header">
                        <span className="forgot-password-brand">Kothareddypalem</span>
                        <h1>Forgot password?</h1>
                        <p>
                            Enter your email address and we'll
                            help you to reset your password.
                        </p>
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
                        {error && (<div className="forgot-password-error">{error}</div>)}
                        {message && (<div className="forgot-password-message">{message}</div>)}
                        <button
                            type="submit"
                            className="forgot-password-button"
                            disabled={loading}>
                            {loading ? "Sending..." : "Send reset link"}
                        </button>
                    </form>
                    <button
                        type="button"
                        className="back-to-login"
                        onClick={() => navigate("/login")}>← Back to login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;