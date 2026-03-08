import React, { useEffect, useState } from "react";
import "../css/student-dashboard.css";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { fetchStudentDashboardApi } from "../api/student.api";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [joinedSubjects, setJoinedSubjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* ---------------------------------- */
  /* LOAD DASHBOARD                     */
  /* ---------------------------------- */
  useEffect(() => {
    fetchStudentDashboardApi()
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to fetch dashboard");
        }
        return res.json();
      })
      .then((data) => {
        setStudent(data.student);
        setJoinedSubjects(data.joinedSubjects || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  /* ---------------------------------- */
  /* LOADING STATE                      */
  /* ---------------------------------- */
  if (loading) {
    return (
      <div className="student-dashboard">
        Loading your registered courses...
      </div>
    );
  }

  /* ---------------------------------- */
  /* RENDER                             */
  /* ---------------------------------- */
  return (
    <>
      <Navbar role="student" />

      <div className="student-dashboard-page">
        <div className="student-dashboard">
          <h1>Student Dashboard: My Registered Courses</h1>

          {error && <p className="error">{error}</p>}

          {student ? (
            <>
              <h2>Welcome, {student.roll_number}</h2>
              <p>Year: {student.year}</p>

              <section className="joined-courses">
                <h3>
                  Courses You Are Currently Enrolled In ({joinedSubjects.length}
                  )
                </h3>

                {joinedSubjects.length > 0 ? (
                  joinedSubjects.map((sub) => (
                    <div
                      key={sub.id}
                      className="course-card joined"
                      onClick={() =>
                        navigate(`/student/subject/${sub.id}/quizzes`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <h4>{sub.name}</h4>
                      <p>
                        <strong>Code:</strong> {sub.code}
                      </p>
                      <p>
                        <strong>Teacher:</strong> {sub.teacher_name}
                      </p>
                      <p>
                        <strong>Semester:</strong> {sub.semester}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>
                    You haven’t registered for any courses yet. Check the
                    <strong> Available Courses </strong> page to enroll.
                  </p>
                )}
              </section>
            </>
          ) : (
            <p>Could not load student profile.</p>
          )}
        </div>
      </div>
    </>
  );
}
