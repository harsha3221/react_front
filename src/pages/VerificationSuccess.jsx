import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function VerificationSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(4);

  const isAutoLogged = location.state?.autoLogged || false;
  const userRole = location.state?.role || "student";

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const targetRoute = isAutoLogged
      ? userRole === "teacher"
        ? "/teacher/dashboard"
        : "/student/dashboard"
      : "/login";

    const timer = setTimeout(() => {
      navigate(targetRoute, { replace: true });
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate, isAutoLogged, userRole]);

  return (
    <div style={{ textAlign: "center", marginTop: "120px" }}>
      <h2 style={{ color: "green" }}>✅ Activation Complete!</h2>
      <p>Your institutional access configuration profile has been verified.</p>
      <p>
        {isAutoLogged
          ? `Redirecting straight to your dashboard layout environment in ${countdown}s...`
          : `Redirecting to login portal in ${countdown}s...`}
      </p>
    </div>
  );
}
