import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../utils/api";
import "./Auth.css";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }
    verifyEmail(token);
  }, []);

  const verifyEmail = async (token) => {
    try {
      const res = await api.get(`/api/auth/verify-email?token=${token}`);
      setStatus("success");
      setMessage(res.data.message);
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.error || "Verification failed. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card fade-in">
        {status === "verifying" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div className="verify-spinner" />
            <p style={{ color: "var(--text-muted)", marginTop: 16 }}>Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: "Syne, sans-serif", marginBottom: 8 }}>Email Verified!</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: "0.9rem" }}>{message}</p>
            <Link to="/" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              Start using SL_Hub →
            </Link>
          </div>
        )}

        {status === "error" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>❌</div>
            <h2 style={{ fontFamily: "Syne, sans-serif", marginBottom: 8 }}>Verification Failed</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: "0.9rem" }}>{message}</p>
            <Link to="/login" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
