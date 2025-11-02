import React, { useEffect, useState } from "react";
import "../css/student-dashboard.css"; 

export default function AvailableCourses({ csrfToken }) {
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [joinedIds, setJoinedIds] = useState(new Set()); // Store IDs for quick lookup
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch all courses and joined course IDs
  useEffect(() => {
    fetch("http://localhost:3000/student/available-courses", { // ⬅️ Hitting the new endpoint
      method: "GET",
      headers: { "CSRF-Token": csrfToken },
      credentials: "include"
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to fetch courses");
        }
        return res.json();
      })
      .then((data) => {
        setAvailableSubjects(data.availableSubjects);
        // Map the array of joined subjects to a Set of IDs
        setJoinedIds(new Set(data.joinedSubjects.map(sub => sub.id)));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [csrfToken]);

  const handleJoin = (subjectId, subjectName) => {
    setError("");
    setSuccess("");

    fetch("http://localhost:3000/student/join-course", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken
      },
      credentials: "include",
      body: JSON.stringify({ subjectId })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        
        // Optimistically update the joinedIds Set
        setJoinedIds(prevIds => new Set(prevIds).add(subjectId));
        setSuccess(`Successfully joined ${subjectName}!`);
      })
      .catch((err) => setError(err.message));
  };

  if (loading) {
    return <div className="student-dashboard">Loading available courses...</div>;
  }

  return (
    <div className="student-dashboard">
      <h1>Available Courses Enrollment</h1>
      <p>Select a course to join.</p>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <section className="all-courses">
        {availableSubjects.length > 0 ? (
          availableSubjects.map((sub) => {
            const isJoined = joinedIds.has(sub.id);
            return (
              <div key={sub.id} className={`course-card ${isJoined ? 'joined' : 'available'}`}>
                <h4>{sub.name}</h4>
                <p><strong>Code:</strong> {sub.code}</p>
                <p><strong>Teacher:</strong> {sub.teacher_name}</p>
                <p><strong>Semester:</strong> {sub.semester}</p>
                
                <button 
                  className={isJoined ? "joined-btn" : "join-btn"} 
                  onClick={() => !isJoined && handleJoin(sub.id, sub.name)}
                  disabled={isJoined}
                >
                  {isJoined ? "✅ Already Joined" : "➕ Join Course"}
                </button>
              </div>
            );
          })
        ) : (
          <p>No courses are currently available.</p>
        )}
      </section>
    </div>
  );
}