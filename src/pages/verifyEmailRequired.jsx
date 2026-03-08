import { useLocation } from "react-router-dom";
import { useState } from "react";
import { resendVerificationApi } from "../api/auth.api";

export default function VerifyEmailRequired() {
  const location = useLocation();
  const email = location.state?.email;

  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(false);

  const handleResend = async () => {
    try {
      setCooldown(true);
      const res = await resendVerificationApi(email);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMessage("Verification email sent again!");

      // 15 min cooldown
      setTimeout(() => setCooldown(false), 15 * 60 * 1000);
    } catch (err) {
      setMessage(err.message);
      setCooldown(false);
    }
  };

  return (
    <div>
      <h2>Email Not Verified</h2>
      <p>We have sent a verification email to:</p>
      <strong>{email}</strong>

      <button onClick={handleResend} disabled={cooldown}>
        {cooldown
          ? "Resend available after 15 min"
          : "Resend Verification Email"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
