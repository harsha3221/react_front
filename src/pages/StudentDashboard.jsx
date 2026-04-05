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

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your registered courses...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar role="student" />

      <div className="teacher-dashboard">
        {" "}
        {/* Reusing the layout container */}
        {/* Hero Section */}
        <section className="teacher-welcome">
          <h1>Welcome, {student?.roll_number || "Student"}</h1>
          <p>
            You are currently enrolled in{" "}
            <strong>{joinedSubjects.length}</strong> courses for Year{" "}
            {student?.year || "N/A"}.
          </p>
        </section>
        {error && <div className="error-message">{error}</div>}
        {/* Header Area */}
        <div className="dashboard-header">
          <h3>My Registered Courses</h3>
          <button
            className="btn-create"
            onClick={() => navigate("/student/available-courses")}
          >
            + Enroll in New Course
          </button>
        </div>
        {/* Subjects Grid */}
        <div className="subjects-list">
          {joinedSubjects.length > 0 ? (
            joinedSubjects.map((sub) => (
              <div
                key={sub.id}
                className="subject-card"
                onClick={() => navigate(`/student/subject/${sub.id}/quizzes`)}
                style={{ cursor: "pointer" }}
              >
                <div>
                  <div className="subject-badge">Semester {sub.semester}</div>
                  <h4>{sub.name}</h4>

                  <div className="subject-info">
                    <p>
                      <strong>Code:</strong> {sub.code}
                    </p>
                    <p>
                      <strong>Instructor:</strong> {sub.teacher_name}
                    </p>
                  </div>
                </div>

                <div className="subject-actions">
                  <button className="quiz-btn-filled">View Quizzes</button>
                  <button className="quiz-btn-outline">Subject Details</button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>You haven't registered for any courses yet.</p>
              <button
                className="toggle-btn"
                onClick={() => navigate("/student/available-courses")}
              >
                Browse Available Courses
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
