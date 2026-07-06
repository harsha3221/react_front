import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resendVerificationApi, meApi } from "../api/auth.api";
import { API_BASE } from "../config"; // 👈 REGISTERED CENTRAL API URL LAYER
import { useAuth } from "../context/AuthContext";

export default function VerifyEmailRequired() {
  const location = useLocation();
  const navigate = useNavigate();
  const { csrfToken, setUser, setCsrfToken } = useAuth();

  const [email, setEmail] = useState(() => {
    if (location.state?.email) {
      localStorage.setItem("pending_verify_email", location.state.email);
      return location.state.email;
    }
    return localStorage.getItem("pending_verify_email") || "";
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const pollingInterval = useRef(null);

  // 1. Active Status Polling: Detects verification from an external tab click
  useEffect(() => {
    if (!email) return;

    pollingInterval.current = setInterval(async () => {
      try {
        // ✅ Uses your exact app configuration domain & route setup
        const res = await fetch(
          `${API_BASE}/verification-status?email=${encodeURIComponent(email)}`,
          {
            method: "GET",
            credentials: "include", // Cross-tab cookie authorization sharing
          },
        );

        if (res.ok) {
          const data = await res.json();

          if (data.isVerified && data.user) {
            clearInterval(pollingInterval.current);

            // Sync up AuthContext global states
            setUser(data.user);
            if (data.csrfToken) setCsrfToken(data.csrfToken);

            localStorage.removeItem("pending_verify_email");

            // Clean redirect straight to target view dashboard
            navigate(
              data.user.role === "teacher"
                ? "/teacher/dashboard"
                : "/student/dashboard",
              { replace: true },
            );
          }
        }
      } catch (err) {
        console.error("Status polling connection breakdown:", err);
      }
    }, 3000);

    return () => clearInterval(pollingInterval.current);
  }, [email, navigate, setUser, setCsrfToken]);

  // 2. Cooldown Timer Management
  useEffect(() => {
    const expiry = localStorage.getItem("email_cooldown_expiry");
    if (expiry) {
      const remaining = Math.ceil((parseInt(expiry, 10) - Date.now()) / 1000);
      if (remaining > 0) setCooldown(remaining);
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("email_cooldown_expiry");
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    setIsResending(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await resendVerificationApi(email, csrfToken);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to send.");

      setMessage({
        text: "📩 A fresh activation secure link has arrived in your inbox.",
        type: "success",
      });
      const expiryTime = Date.now() + 60 * 1000;
      localStorage.setItem("email_cooldown_expiry", expiryTime.toString());
      setCooldown(60);
    } catch (err) {
      setMessage({ text: `❌ ${err.message}`, type: "error" });
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Session Missing</h2>
          <button style={styles.btnPrimary} onClick={() => navigate("/login")}>
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <span style={styles.pulseIcon}>✉️</span>
        </div>
        <h2 style={styles.title}>Verify Your Email</h2>
        <p style={styles.subtitle}>
          We sent an activation link to your institutional account:
        </p>
        <div style={styles.emailBadge}>{email}</div>

        <p style={styles.statusText}>
          <span style={styles.spinnerInline}>🔄</span> Waiting for you to click
          the link...
        </p>

        <div style={styles.divider} />

        <p style={styles.footerText}>
          Didn't receive it? Check your spam folder or trigger a new link below.
        </p>

        <button
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          style={
            cooldown > 0 || isResending
              ? styles.btnDisabled
              : styles.btnSecondary
          }
        >
          {isResending
            ? "Sending..."
            : cooldown > 0
              ? `Resend available in ${cooldown}s`
              : "Resend Verification Link"}
        </button>

        {message.text && (
          <div
            style={
              message.type === "success"
                ? styles.successAlert
                : styles.errorAlert
            }
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
    fontFamily: "system-ui, sans-serif",
    padding: "20px",
  },
  card: {
    background: "#fff",
    maxWidth: "450px",
    width: "100%",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  iconContainer: { marginBottom: "20px" },
  pulseIcon: { fontSize: "48px", display: "inline-block" },
  title: {
    fontSize: "24px",
    color: "#1a1a1a",
    margin: "0 0 10px 0",
    fontWeight: "700",
  },
  subtitle: {
    color: "#666",
    fontSize: "15px",
    margin: "0 0 15px 0",
    lineHeight: "1.5",
  },
  emailBadge: {
    background: "#f0f4f8",
    color: "#1a4f7c",
    padding: "10px 16px",
    borderRadius: "30px",
    fontWeight: "600",
    display: "inline-block",
    fontSize: "14px",
    marginBottom: "25px",
  },
  statusText: {
    color: "#888",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinnerInline: { display: "inline-block" },
  divider: { height: "1px", background: "#eaeaea", margin: "25px 0" },
  footerText: {
    color: "#666",
    fontSize: "13px",
    marginBottom: "15px",
    lineHeight: "1.4",
  },
  btnSecondary: {
    background: "#fff",
    border: "1px solid #dcdcdc",
    color: "#333",
    padding: "11px 22px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    width: "100%",
  },
  btnDisabled: {
    background: "#f5f5f5",
    border: "1px solid #e2e2e2",
    color: "#aaa",
    padding: "11px 22px",
    borderRadius: "8px",
    fontWeight: "600",
    width: "100%",
    cursor: "not-allowed",
  },
  btnPrimary: {
    background: "#0070f3",
    color: "#fff",
    border: "none",
    padding: "11px 22px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  },
  successAlert: {
    marginTop: "15px",
    background: "#ecfdf5",
    color: "#065f46",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "13px",
    textAlign: "left",
    border: "1px solid #a7f3d0",
  },
  errorAlert: {
    marginTop: "15px",
    background: "#fef2f2",
    color: "#991b1b",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "13px",
    textAlign: "left",
    border: "1px solid #fecaca",
  },
};
