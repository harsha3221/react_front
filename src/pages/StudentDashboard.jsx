import React, { useEffect, useState } from "react";
import "../css/student-dashboard.css";

export default function StudentDashboard({ csrfToken }) {
  const [student, setStudent] = useState(null);
  // Renamed for clarity: we only fetch joined courses here
  const [joinedSubjects, setJoinedSubjects] = useState([]); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ⬅️ This route now only returns student profile and joined courses
    fetch("http://localhost:3000/student/dashboard", { 
      method: "GET",
      headers: { "CSRF-Token": csrfToken },
      credentials: "include"
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to fetch dashboard");
        }
        return res.json();
      })
      .then((data) => {
        setStudent(data.student);
        setJoinedSubjects(data.joinedSubjects);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [csrfToken]);

  if (loading) {
    return <div className="student-dashboard">Loading your registered courses...</div>;
  }

  return (
    <div className="student-dashboard">
      <h1>Student Dashboard: My Registered Courses</h1>

      {error && <p className="error">{error}</p>}

      {student ? (
        <>
          <h2>Welcome, {student.roll_number}</h2>
          <p>Year: {student.year}</p>

          <section className="joined-courses">
            <h3>Courses You Are Currently Enrolled In ({joinedSubjects.length})</h3>
            {joinedSubjects.length > 0 ? (
              joinedSubjects.map((sub) => (
                <div key={sub.id} className="course-card joined">
                  <h4>{sub.name}</h4>
                  <p><strong>Code:</strong> {sub.code}</p>
                  <p><strong>Teacher:</strong> {sub.teacher_name}</p>
                  <p><strong>Semester:</strong> {sub.semester}</p>
                </div>
              ))
            ) : (
              <p>You haven’t registered for any courses yet. Check the **Available Courses** page to enroll.</p>
            )}
          </section>
        </>
      ) : (
        <p>Could not load student profile.</p>
      )}
    </div>
  );
}