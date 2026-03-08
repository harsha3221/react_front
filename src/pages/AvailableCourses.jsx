import React, { useEffect, useState } from "react";
import "../css/student-dashboard.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";
export default function AvailableCourses() {
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [joinedIds, setJoinedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState(""); // ✅ NEW
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
      // headers: { "CSRF-Token": csrfToken },
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

  // ✅ FILTER COURSES BASED ON SEARCH
  const filteredSubjects = availableSubjects.filter((sub) =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="student-dashboard">Loading available courses...</div>
    );
  }

  return (
    <>
      <Navbar role="student" />
      <div className="student-dashboard">
        <h1>Available Courses Enrollment</h1>
        <p>Select a course to join.</p>

        {/* ✅ SEARCH BAR */}
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="course-search"
            placeholder="Search by course name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <section className="all-courses">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((sub) => {
              const isJoined = joinedIds.has(sub.id);
              return (
                <div
                  key={sub.id}
                  className={`course-card ${isJoined ? "joined" : "available"}`}
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
            <p>No matching courses found.</p>
          )}
        </section>
      </div>
    </>
  );
}
