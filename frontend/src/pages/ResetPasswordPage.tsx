import { type FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/api";
import "./ResetPasswordPage.css";

function ResetPasswordPage() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: FormEvent) => {e.preventDefault();
        setMessage("");
        setError("");
        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }

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
            const response = await resetPassword({token, password,});
            setMessage(response || "Password reset successfully");
            setPassword("");
            setConfirmPassword("");
            setTimeout(() => {navigate("/login");}, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-page">

            {/* LEFT IMAGE */}
            <div className="reset-password-image-section">
                <img
                    src="/images/login-flower.jpg"
                    alt=""
                    className="reset-password-image"
                />
            </div>

            {/* RIGHT FORM */}
            <div className="reset-password-form-section">
                <div className="reset-password-container">
                    <div className="reset-password-header">
                        <span className="reset-password-brand">Kothareddypalem</span>
                        <h1>Reset password</h1>
                        <p>
                            Enter your new password below to
                            secure your account.
                        </p>
                    </div>
                    <form className="reset-password-form" onSubmit={handleSubmit}>
                        <div className="reset-password-form-group">
                            <label htmlFor="password">New password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                            />
                        </div>
                        <div className="reset-password-form-group">
                            <label htmlFor="confirmPassword">Confirm password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                            />
                        </div>
                        {error && (<div className="reset-password-error">{error}</div>)}
                        {message && (<div className="reset-password-success">{message}</div>)}
                        <button
                            type="submit"
                            className="reset-password-button"
                            disabled={loading}>
                            {loading ? "Resetting..." : "Reset password"}
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
export default ResetPasswordPage;