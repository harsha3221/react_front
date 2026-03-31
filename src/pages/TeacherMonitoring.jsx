import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function TeacherMonitoring({ teacherId }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    socket.emit("joinTeacherRoom", teacherId);

    socket.on("cheating_alert", (data) => {
      console.log("CHEATING:", data);

      setAlerts((prev) => [data, ...prev]);
    });

    return () => socket.disconnect();
  }, [teacherId]);

  return (
    <div>
      <h2>Live Monitoring</h2>

      {alerts.map((a, i) => (
        <div key={i} className="alert-card">
          <strong>{a.studentName}</strong> ({a.studentEmail})
          <p>Event: {a.event_type}</p>
          <p>Time: {new Date(a.time).toLocaleTimeString()}</p>
        </div>
      ))}
    </div>
  );
}
