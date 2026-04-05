import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { API_BASE } from "../config";
import { useAuth } from "../context/AuthContext";

const socket = io(`${API_BASE}`, {
  transports: ["websocket"],
  withCredentials: true,
});

export default function TeacherMonitoring() {
  const [alerts, setAlerts] = useState([]);
  const [penalizedStudents, setPenalizedStudents] = useState(new Set()); // Track who got a zero
  const [activeTab, setActiveTab] = useState("live"); // "live" or "analyze"
  const { quizId } = useParams();
  const { csrfToken } = useAuth();

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/cheating/logs/${quizId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (Array.isArray(data)) setAlerts(data);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    loadLogs();

    const onAlert = (data) => {
      if (String(data.quizId) === String(quizId)) {
        setAlerts((prev) => [data, ...prev]);
      }
    };

    socket.on("cheating_alert", onAlert);
    return () => socket.off("cheating_alert", onAlert);
  }, [quizId]);

  // --- ANALYTICS LOGIC ---
  // Group alerts by student to calculate frequency and risk
  const studentStats = useMemo(() => {
    const stats = {};
    alerts.forEach((a) => {
      const id = a.student_id || a.studentId;
      if (!stats[id]) {
        stats[id] = {
          id,
          name: a.studentName,
          email: a.studentEmail,
          count: 0,
          lastSeen: a.time || a.created_at,
        };
      }
      stats[id].count += 1;
    });
    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [alerts]);

  const getRiskLevel = (count) => {
    if (count > 5) return { label: "High", color: "#d9534f" };
    if (count > 2) return { label: "Medium", color: "#f0ad4e" };
    return { label: "Low", color: "#5bc0de" };
  };

  const handlePenalize = async (studentId = null, allAtOnce = false) => {
    const confirmMessage = allAtOnce
      ? "Assign ZERO to ALL flagged students?"
      : "Assign zero and disqualify this student?";

    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await fetch(`${API_BASE}/api/cheating/assign-zero`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ studentId, quizId, allAtOnce }),
        credentials: "include",
      });

      if (response.ok) {
        if (allAtOnce) {
          const allIds = studentStats.map((s) => s.id);
          setPenalizedStudents(new Set([...penalizedStudents, ...allIds]));
        } else {
          setPenalizedStudents(new Set([...penalizedStudents, studentId]));
        }
        alert("Penalty applied successfully.");
      }
    } catch (err) {
      console.error(err);
      alert("Action failed.");
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h2 style={{ margin: 0 }}>🛡️ Proctoring Control</h2>
          <p style={{ color: "#666" }}>Quiz Session: {quizId}</p>
        </div>
        <div style={tabGroupStyle}>
          <button
            onClick={() => setActiveTab("live")}
            style={activeTab === "live" ? activeTabBtn : inactiveTabBtn}
          >
            Live Monitor
          </button>
          <button
            onClick={() => setActiveTab("analyze")}
            style={activeTab === "analyze" ? activeTabBtn : inactiveTabBtn}
          >
            Analyse & Action
          </button>
        </div>
      </header>

      {activeTab === "live" ? (
        /* --- LIVE FEED VIEW --- */
        <div className="fade-in">
          <h3 style={{ borderLeft: "4px solid red", paddingLeft: "10px" }}>
            Incident Stream
          </h3>
          {alerts.length === 0 ? (
            <p style={emptyStyle}>Waiting for student activity...</p>
          ) : (
            alerts.map((a, i) => (
              <div key={i} style={alertCardStyle}>
                <div>
                  <strong>{a.studentName}</strong>
                  <span style={eventBadgeStyle}>
                    {a.event_type.replace("_", " ")}
                  </span>
                </div>
                <small style={{ color: "#999" }}>
                  {new Date(a.time || a.created_at).toLocaleTimeString()}
                </small>
              </div>
            ))
          )}
        </div>
      ) : (
        /* --- ANALYZE / DISCIPLINARY VIEW --- */
        <div className="fade-in">
          <div style={analyzeHeader}>
            <h3>Student Risk Assessment</h3>
            {studentStats.length > 0 && (
              <button
                onClick={() => handlePenalize(null, true)}
                style={bulkBtnStyle}
              >
                Assign Zero to All Flagged
              </button>
            )}
          </div>

          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRow}>
                <th style={thStyle}>Student</th>
                <th style={thStyle}>Total Violations</th>
                <th style={thStyle}>Risk Level</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {studentStats.map((s) => {
                const risk = getRiskLevel(s.count);
                const isDone = penalizedStudents.has(s.id);
                return (
                  <tr key={s.id} style={trStyle}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: "600" }}>{s.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "#888" }}>
                        {s.email}
                      </div>
                    </td>
                    <td style={tdStyle}>{s.count} Attempts</td>
                    <td style={tdStyle}>
                      <span
                        style={{ ...riskBadge, backgroundColor: risk.color }}
                      >
                        {risk.label}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {isDone ? (
                        <span style={assignedStatus}>✓ Assigned</span>
                      ) : (
                        <button
                          onClick={() => handlePenalize(s.id)}
                          style={actionBtnStyle}
                        >
                          Assign Zero
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {studentStats.length === 0 && (
            <p style={emptyStyle}>No data to analyze yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

// --- STYLES (Professional Theme) ---
const containerStyle = {
  maxWidth: "1000px",
  margin: "40px auto",
  padding: "20px",
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
};
const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "2px solid #f0f0f0",
  paddingBottom: "20px",
  marginBottom: "20px",
};
const tabGroupStyle = {
  backgroundColor: "#f5f5f5",
  padding: "5px",
  borderRadius: "8px",
};
const activeTabBtn = {
  padding: "8px 20px",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
};
const inactiveTabBtn = {
  padding: "8px 20px",
  border: "none",
  backgroundColor: "transparent",
  cursor: "pointer",
  color: "#666",
};
const alertCardStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px",
  borderBottom: "1px solid #eee",
  fontSize: "0.95rem",
};
const eventBadgeStyle = {
  marginLeft: "10px",
  padding: "2px 8px",
  backgroundColor: "#fff0f0",
  color: "#d9534f",
  borderRadius: "4px",
  fontSize: "0.75rem",
  fontWeight: "bold",
  textTransform: "uppercase",
};
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px",
};
const tableHeaderRow = { backgroundColor: "#fafafa", textAlign: "left" };
const thStyle = {
  padding: "15px",
  fontSize: "0.85rem",
  color: "#888",
  textTransform: "uppercase",
};
const trStyle = { borderBottom: "1px solid #f0f0f0" };
const tdStyle = { padding: "15px" };
const riskBadge = {
  padding: "4px 10px",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "0.75rem",
  fontWeight: "bold",
};
const actionBtnStyle = {
  padding: "6px 12px",
  backgroundColor: "#fff",
  border: "1px solid #d9534f",
  color: "#d9534f",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "600",
};
const assignedStatus = {
  color: "#28a745",
  fontWeight: "bold",
  fontSize: "0.9rem",
};
const bulkBtnStyle = {
  backgroundColor: "#111",
  color: "#fff",
  padding: "8px 16px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
};
const analyzeHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
const emptyStyle = { textAlign: "center", color: "#aaa", padding: "40px" };
