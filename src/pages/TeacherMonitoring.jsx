import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { API_BASE } from "../config";

const socket = io(`${API_BASE}`, {
  transports: ["websocket"],
  withCredentials: true, // Required for session-based room assignment
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
      // Ensure the live alert matches the quiz the teacher is currently viewing
      if (String(data.quizId) === String(quizId)) {
        setAlerts((prev) => [data, ...prev]);

        // Browser notification or Sound alert
        if (Notification.permission === "granted") {
          new Notification(`Cheating Alert: ${data.studentName}`, {
            body: `Action: ${data.event_type}`,
          });
        }
      }
    };

    socket.on("cheating_alert", onAlert);

    return () => {
      socket.off("cheating_alert", onAlert);
    };
  }, [quizId]);

  return (
    <div className="monitoring-container">
      <header className="mon-header">
        <h2>🔴 Live Proctoring Dashboard</h2>
        <p>
          Monitoring Quiz ID: <strong>{quizId}</strong>
        </p>
      </header>

      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="no-alerts">
            No incidents recorded for this session.
          </div>
        ) : (
          alerts.map((a, i) => (
            <div key={i} className={`alert-card ${i === 0 ? "new-anim" : ""}`}>
              <div className="alert-user">
                <span className="user-name">{a.studentName}</span>
                <span className="user-email">{a.studentEmail}</span>
              </div>
              <div className="alert-details">
                <span className={`event-badge ${a.event_type}`}>
                  {a.event_type.replace("_", " ")}
                </span>
                <span className="event-time">
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
