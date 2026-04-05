import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { API_BASE } from "../config";
import { useAuth } from "../context/AuthContext";

// Initialize Socket outside to prevent multiple connections on re-render
const socket = io(`${API_BASE}`, {
  transports: ["websocket"],
  withCredentials: true,
});

export default function TeacherMonitoring() {
  const [alerts, setAlerts] = useState([]);
  const { quizId } = useParams();
  const { csrfToken } = useAuth();

  useEffect(() => {
    // 1. INITIAL LOAD: Fetch history from DB
    const loadLogs = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/cheating/logs/${quizId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setAlerts(data);
        }
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };

    loadLogs();

    // 2. LIVE LISTEN
    const onAlert = (data) => {
      console.log("📨 Real-time alert received:", data);
      if (String(data.quizId) === String(quizId)) {
        setAlerts((prev) => [data, ...prev]);

        if (Notification.permission === "granted") {
          new Notification(`Cheating Alert: ${data.studentName}`, {
            body: `Action: ${data.event_type.replace("_", " ")}`,
          });
        }
      }
    };

    socket.on("cheating_alert", onAlert);
    socket.on("connect", () => console.log("✅ Teacher Socket Connected"));

    return () => {
      socket.off("cheating_alert", onAlert);
      socket.off("connect");
    };
  }, [quizId]);

  // --- NEW FEATURE: ASSIGN ZERO LOGIC ---
  const handlePenalize = async (studentId = null, allAtOnce = false) => {
    const confirmMessage = allAtOnce
      ? "Are you sure you want to assign ZERO to ALL students flagged for cheating?"
      : "Assign zero marks to this student and disqualify them?";

    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await fetch(`${API_BASE}/api/cheating/assign-zero`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          studentId,
          quizId,
          allAtOnce,
        }),
        credentials: "include",
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message || "Action successful");
      } else {
        alert(result.message || "Failed to penalize.");
      }
    } catch (err) {
      console.error("Error penalizing student:", err);
      alert("Server error occurred.");
    }
  };

  return (
    <div
      className="monitoring-container"
      style={{ maxWidth: "1200px", margin: "0 auto" }}
    >
      <header
        className="mon-header"
        style={{
          padding: "20px",
          borderBottom: "1px solid #ccc",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2>🔴 Live Proctoring Dashboard</h2>
          <p>
            Monitoring Quiz ID: <strong>{quizId}</strong>
          </p>
        </div>

        {/* BUTTON: ASSIGN ALL */}
        {alerts.length > 0 && (
          <button
            onClick={() => handlePenalize(null, true)}
            style={{
              backgroundColor: "#111",
              color: "white",
              padding: "12px 20px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Assign Zero to All Flagged
          </button>
        )}
      </header>

      <div className="alerts-list" style={{ padding: "20px" }}>
        {alerts.length === 0 ? (
          <div
            className="no-alerts"
            style={{ textAlign: "center", color: "#666", marginTop: "50px" }}
          >
            No incidents recorded for this session.
          </div>
        ) : (
          alerts.map((a, i) => (
            <div
              key={i}
              className="alert-card"
              style={{
                border: "1px solid #ffcccc",
                margin: "15px 0",
                padding: "20px",
                borderRadius: "12px",
                backgroundColor: i === 0 ? "#fff5f5" : "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div className="alert-info">
                <div className="alert-user">
                  <strong style={{ display: "block", fontSize: "1.1rem" }}>
                    {a.studentName}
                  </strong>
                  <small style={{ color: "#555" }}>{a.studentEmail}</small>
                </div>
                <div className="alert-details" style={{ marginTop: "10px" }}>
                  <span
                    className="event-badge"
                    style={{ color: "#d9534f", fontWeight: "bold" }}
                  >
                    ⚠️ {a.event_type.toUpperCase().replace("_", " ")}
                  </span>
                  <span
                    className="event-time"
                    style={{
                      marginLeft: "15px",
                      color: "#888",
                      fontSize: "0.85rem",
                    }}
                  >
                    {new Date(a.time).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* BUTTON: INDIVIDUAL ZERO */}
              <button
                onClick={() => handlePenalize(a.studentId, false)}
                style={{
                  backgroundColor: "white",
                  color: "#d9534f",
                  border: "2px solid #d9534f",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#d9534f";
                  e.target.style.color = "white";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "white";
                  e.target.style.color = "#d9534f";
                }}
              >
                Assign Zero
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
