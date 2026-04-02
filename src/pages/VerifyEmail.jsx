import React, { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const hasCalled = useRef(false); // Prevents React 18 double-call in StrictMode

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    const performVerification = async () => {
      if (!token) {
        navigate("/verification-failed");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/verify?token=${token}`);

        if (res.ok) {
          navigate("/verification-success");
        } else {
          navigate("/verification-failed");
        }
      } catch (err) {
        navigate("/verification-failed");
      }
    };

    performVerification();
  }, [token, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "120px" }}>
      <div className="spinner"></div> {/* Add a CSS spinner here */}
      <h2>🔄 Verifying your email...</h2>
      <p>Just a second while we activate your account.</p>
    </div>
  );
}
