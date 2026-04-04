import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { API_BASE } from "../config";

// Initialize Socket outside to prevent multiple connections on re-render
const socket = io(`${API_BASE}`, {
  transports: ["websocket"],
  withCredentials: true,
});

export default function TeacherMonitoring() {
  const [alerts, setAlerts] = useState([]);
  const { quizId } = useParams();

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
      // Consistent string comparison for IDs
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

    // Log connection status for debugging
    socket.on("connect", () => console.log("✅ Teacher Socket Connected"));

    return () => {
      socket.off("cheating_alert", onAlert);
      socket.off("connect");
    };
  }, [quizId]);

  return (
    <div className="monitoring-container">
      <header
        className="mon-header"
        style={{ padding: "20px", borderBottom: "1px solid #ccc" }}
      >
        <h2>🔴 Live Proctoring Dashboard</h2>
        <p>
          Monitoring Quiz ID: <strong>{quizId}</strong>
        </p>
      </header>

      <div className="alerts-list" style={{ padding: "20px" }}>
        {alerts.length === 0 ? (
          <div className="no-alerts">
            No incidents recorded for this session.
          </div>
        ) : (
          alerts.map((a, i) => (
            <div
              key={i}
              className="alert-card"
              style={{
                border: "1px solid red",
                margin: "10px 0",
                padding: "15px",
                borderRadius: "8px",
                backgroundColor: i === 0 ? "#fff0f0" : "#fff",
              }}
            >
              <div className="alert-user">
                <strong style={{ display: "block" }}>{a.studentName}</strong>
                <small>{a.studentEmail}</small>
              </div>
              <div className="alert-details" style={{ marginTop: "10px" }}>
                <span
                  className="event-badge"
                  style={{ color: "red", fontWeight: "bold" }}
                >
                  ⚠️ {a.event_type.toUpperCase().replace("_", " ")}
                </span>
                <span
                  className="event-time"
                  style={{ marginLeft: "15px", color: "#666" }}
                >
                  {new Date(a.time).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
