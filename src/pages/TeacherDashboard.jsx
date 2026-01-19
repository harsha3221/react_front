import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/teacher-dashboard.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
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

  useEffect(() => {
    fetch("http://localhost:3000/teacher/dashboard", {
      credentials: "include",
    })
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

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleCreateSubject = (e) => {
    e.preventDefault();
    setError("");

    fetch("http://localhost:3000/teacher/create-subject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(formData),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to create subject");
        }
        return res.json();
      })
      .then((data) => {
        setSubjects([...subjects, data.subject]);
        setShowForm(false);
        setFormData({ name: "", code: "", semester: "", description: "" });
      })
      .catch((err) => {
        console.error("Error creating subject:", err.message);
        setError(err.message);
      });
  };

  return (
    <>
      <Navbar role="teacher"></Navbar>
      <div className="teacher-dashboard">
        <h1>Teacher Dashboard</h1>
        {error && <p className="error">{error}</p>}

        {teacher ? (
          <>
            <h2>Welcome, {teacher.name}</h2>
            <p>Department: {teacher.department || "N/A"}</p>

            <div className="dashboard-header">
              <h3>Your Subjects</h3>
              <button
                className="create-btn"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? "Cancel" : "Create Subject"}
              </button>
            </div>

            {showForm && (
              <form
                className="create-subject-form"
                onSubmit={handleCreateSubject}
              >
                <input
                  type="text"
                  placeholder="Subject Name"
                  value={formData.name}
                  onChange={handleChange("name")}
                  required
                />
                <input
                  type="text"
                  placeholder="Subject Code"
                  value={formData.code}
                  onChange={handleChange("code")}
                  required
                />
                <input
                  type="number"
                  placeholder="Semester"
                  value={formData.semester}
                  onChange={handleChange("semester")}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange("description")}
                />

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Add Subject
                  </button>
                </div>
              </form>
            )}

            <div className="subjects-list">
              {subjects.length > 0 ? (
                subjects.map((sub) => (
                  <div key={sub.id} className="subject-card">
                    <h4>{sub.name}</h4>
                    <p>
                      <strong>Code:</strong> {sub.code}
                    </p>
                    <p>
                      <strong>Semester:</strong> {sub.semester}
                    </p>
                    <p>{sub.description}</p>

                    <div className="subject-actions">
                      <button
                        className="quiz-btn"
                        onClick={() =>
                          navigate(`/teacher/subjects/${sub.id}/quizzes`)
                        }
                      >
                        View Quizzes
                      </button>

                      <button
                        className="quiz-btn"
                        onClick={() =>
                          navigate(`/teacher/subjects/${sub.id}/quizzes/new`)
                        }
                      >
                        Create Quiz
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No subjects found.</p>
              )}
            </div>
          </>
        ) : (
          <p>Loading dashboard...</p>
        )}
      </div>
    </>
  );
}
