import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import "./VerifyBanner.css";

const VerifyBanner = () => {
  const { user } = useAuth();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user || user.is_verified) return null;

  const resend = async () => {
    setLoading(true);
    try {
      await api.post("/api/auth/resend-verification");
      setSent(true);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to resend. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-banner">
      <span className="verify-banner-icon">📧</span>
      <p>
        {sent
          ? "Verification email sent! Check your inbox."
          : "Please verify your email to post questions and answers."}
      </p>
      {!sent && (
        <button className="verify-resend-btn" onClick={resend} disabled={loading}>
          {loading ? "Sending..." : "Resend email"}
        </button>
      )}
    </div>
  );
};

export default VerifyBanner;
