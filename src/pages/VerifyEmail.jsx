import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        navigate("/verification-failed");
        return;
      }

      try {
        // Send the token to your Render backend
        const res = await fetch(`${API_BASE}/verify?token=${token}`, {
          method: "GET",
        });

        if (res.ok) {
          navigate("/verification-success");
        } else {
          navigate("/verification-failed");
        }
      } catch (err) {
        console.error("Verification Error:", err);
        navigate("/verification-failed");
      }
    };

    performVerification();
  }, [token, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "120px" }}>
      <h2>🔄 Verifying your email...</h2>
      <p>Please wait a moment while we activate your account.</p>
    </div>
  );
}
