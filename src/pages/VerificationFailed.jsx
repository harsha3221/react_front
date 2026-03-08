import React from "react";
import { useNavigate } from "react-router-dom";

export default function VerificationFailed() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "120px" }}>
      <h2 style={{ color: "red" }}>❌ Verification Failed</h2>
      <p>The link is invalid or expired.</p>

      <button
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          cursor: "pointer",
        }}
        onClick={() => navigate("/login")}
      >
        Back to Login
      </button>
    </div>
  );
}
