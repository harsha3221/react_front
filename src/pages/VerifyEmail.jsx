import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setCsrfToken } = useAuth();
  const token = searchParams.get("token");
  const hasCalled = useRef(false);
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    const performVerification = async () => {
      if (!token) {
        setStatus("failed");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/verify?token=${token}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          localStorage.removeItem("pending_verify_email");

          if (data.user) {
            setUser(data.user);
            if (data.csrfToken) setCsrfToken(data.csrfToken);
          }

          // ✅ FIX: Correct state object shapes matching VerificationSuccess.jsx property expectations
          navigate("/verification-success", {
            replace: true,
            state: {
              autoLogged: true,
              role: data.user?.role || "student",
              fromTokenLink: true,
            },
          });
        } else {
          setStatus("failed");
        }
      } catch (err) {
        console.error("Verification connection error:", err);
        setStatus("failed");
      }
    };

    performVerification();
  }, [token, navigate, setUser, setCsrfToken]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        fontFamily: "system-ui",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {status === "verifying" && (
          <>
            <div
              className="spinner"
              style={{
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #0070f3",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                transform: "rotate(360deg)",
                margin: "0 auto 20px auto",
              }}
            />
            <h2>🔄 Verifying Link...</h2>
            <p style={{ color: "#666" }}>
              Confirming identity tokens with secure server lines...
            </p>
          </>
        )}
        {status === "failed" && (
          <>
            <h2 style={{ color: "#d32f2f" }}>❌ Token Verification Failed</h2>
            <p style={{ color: "#666" }}>
              This validation link has expired, turned bad, or was already
              consumed.
            </p>
            <button
              style={{
                marginTop: "15px",
                padding: "10px 20px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/login", { replace: true })}
            >
              Back to Login Portal
            </button>
          </>
        )}
        {status === "success" && (
          <>
            <h2 style={{ color: "#2e7d32" }}>✅ Authenticated!</h2>
            <p style={{ color: "#666" }}>
              Preparing safe redirection pipelines...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
