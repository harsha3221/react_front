import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/teacher-dashboard.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

import {
  fetchTeacherDashboardApi,
  createSubjectApi,
} from "../api/teacherDashboard.api";

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    semester: "",
    description: "",
  });
  const [error, setError] = useState("");

  const { csrfToken } = useAuth();
  const navigate = useNavigate();

  /* -------------------------------------------------- */
  /* LOAD DASHBOARD                                     */
  /* -------------------------------------------------- */
  useEffect(() => {
    fetchTeacherDashboardApi()
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to fetch dashboard");
        }
        return res.json();
      })
      .then((data) => {
        setTeacher(data.teacher);
        setSubjects(data.subjects);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err.message);
        setError(err.message);
      });
  }, []);

  /* -------------------------------------------------- */
  /* FORM HANDLERS                                      */
  /* -------------------------------------------------- */
  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      semester: "",
      description: "",
    });
    setShowForm(false);
  };

  const handleCreateSubject = (e) => {
    e.preventDefault();
    setError("");

    createSubjectApi(formData, csrfToken)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to create subject");
        }
        return res.json();
      })
      .then((data) => {
        setSubjects((prev) => [...prev, data.subject]);
        resetForm();
      })
      .catch((err) => {
        console.error("Error creating subject:", err.message);
        setError(err.message);
      });
  };

  /* -------------------------------------------------- */
  /* RENDER                                             */
  /* -------------------------------------------------- */
  return (
    <>
      <Navbar role="teacher" />
      <div className="teacher-dashboard">
        {error && <p className="error-message">{error}</p>}

        {teacher ? (
          <>
            {/* Welcome Section */}
            <div className="teacher-welcome">
              <h1>Welcome, {teacher.name}</h1>
              <p>
                Department of{" "}
                <strong>{teacher.department || "General Sciences"}</strong>
              </p>
            </div>

            {/* Action Header */}
            <div className="dashboard-header">
              <h3>Your Subjects</h3>
              <button
                className="btn-create"
                onClick={() => setShowForm((v) => !v)}
              >
                {showForm ? "✕ Close Form" : "+ Create New Subject"}
              </button>
            </div>

            {/* Form Section */}
            {showForm && (
              <form
                className="create-subject-form"
                onSubmit={handleCreateSubject}
              >
                <div className="input-group">
                  <label>Subject Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Advanced Mathematics"
                    value={formData.name}
                    onChange={handleChange("name")}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Code</label>
                  <input
                    type="text"
                    placeholder="e.g. MATH101"
                    value={formData.code}
                    onChange={handleChange("code")}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Semester</label>
                  <input
                    type="number"
                    placeholder="1-8"
                    value={formData.semester}
                    onChange={handleChange("semester")}
                    required
                  />
                </div>
                <textarea
                  placeholder="Write a brief subject description..."
                  value={formData.description}
                  onChange={handleChange("description")}
                />
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Add Subject
                  </button>
                </div>
              </form>
            )}

            {/* Grid Section */}
            <div className="subjects-list">
              {subjects.length > 0 ? (
                subjects.map((sub) => (
                  <div key={sub.id} className="subject-card">
                    <div>
                      <h4>{sub.name}</h4>
                      <div className="subject-info">
                        <p>
                          <strong>Code:</strong> {sub.code}
                        </p>
                        <p>
                          <strong>Semester:</strong> {sub.semester}
                        </p>
                        <p>{sub.description || "No description provided."}</p>
                      </div>
                    </div>

                    <div className="subject-actions">
                      <button
                        className="quiz-btn-outline"
                        onClick={() =>
                          navigate(`/teacher/subjects/${sub.id}/quizzes`)
                        }
                      >
                        View Quizzes
                      </button>
                      <button
                        className="quiz-btn-filled"
                        onClick={() =>
                          navigate(`/teacher/subjects/${sub.id}/quizzes/new`)
                        }
                      >
                        + New Quiz
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p">
                  No subjects created yet. Click the button above to start.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="center" style={{ height: "50vh" }}>
            <p>Loading dashboard...</p>
          </div>
        )}
      </div>
    </>
  );
}
