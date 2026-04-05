import React, { useEffect, useState } from "react";
import "../css/student-dashboard.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";

export default function AvailableCourses() {
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [joinedIds, setJoinedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const { csrfToken } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/student/available-courses`, {
      method: "GET",
      credentials: "include",
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
        setJoinedIds(new Set(data.joinedSubjects.map((sub) => sub.id)));
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

    fetch(`${API_BASE}/student/join-course`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({ subjectId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setJoinedIds((prev) => new Set(prev).add(subjectId));
        setSuccess(`Successfully joined ${subjectName}!`);
      })
      .catch((err) => setError(err.message));
  };

  const filteredSubjects = availableSubjects.filter(
    (sub) =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Fetching available courses...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar role="student" />
      <div className="teacher-dashboard">
        {" "}
        {/* Consistent layout container */}
        <section className="teacher-welcome">
          <h1>Course Catalog</h1>
          <p>Explore and enroll in new subjects for the current semester.</p>
        </section>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <div className="dashboard-header">
          <h3>All Available Courses</h3>

          {/* PREMIUM SEARCH BAR */}
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="course-search-input"
              placeholder="Search by name or course code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="subjects-list">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((sub) => {
              const isJoined = joinedIds.has(sub.id);
              return (
                <div
                  key={sub.id}
                  className={`subject-card ${isJoined ? "card-joined" : ""}`}
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
                    <button
                      className={
                        isJoined ? "quiz-btn-outline" : "quiz-btn-filled"
                      }
                      onClick={() => !isJoined && handleJoin(sub.id, sub.name)}
                      disabled={isJoined}
                      style={{ width: "100%", gridColumn: "1 / -1" }}
                    >
                      {isJoined ? "✓ Enrolled" : "Enroll Now"}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <p>No courses found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
