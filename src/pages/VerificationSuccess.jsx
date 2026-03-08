import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VerificationSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 4000); // 4 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "120px" }}>
      <h2 style={{ color: "green" }}>✅ Email Verified Successfully!</h2>

      <p>Your account has been activated.</p>
      <p>You will be redirected to login shortly...</p>

      <button
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        Go to Login Now
      </button>
    </div>
  );
}
