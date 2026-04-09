import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchStudentQuizResultApi } from "../api/studentQuiz.api";
import "../css/student-dashboard.css";

export default function StudentQuizResult() {
  const { quizId } = useParams();
  const { csrfToken } = useAuth();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStudentQuizResultApi(quizId, csrfToken)
      .then(async (res) => {
        if (!res.ok) throw new Error("Result not available");
        return res.json();
      })
      .then((data) => setResult(data.result))
      .catch((err) => setError(err.message));
  }, [quizId, csrfToken]);

  if (error)
    return (
      <div className="teacher-dashboard">
        <div className="error-message">{error}</div>
      </div>
    );
  if (!result)
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Calculating your score...</p>
      </div>
    );

  const percentage = Math.round(
    (result.obtained_marks / result.total_marks) * 100,
  );

  return (
    <div className="teacher-dashboard">
      <div className="student-result-page">
        <div className="result-card">
          <div className="result-header">
            <span className="confetti">🎉</span>
            <h2>Quiz Completed</h2>
            <p>Excellent effort! Here is your performance summary.</p>
          </div>

          <div className="score-container">
            <div className="score-circle">
              <span className="obtained-marks">{result.obtained_marks}</span>
              <span className="total-marks">/ {result.total_marks}</span>
            </div>
            <div className="percentage-badge">{percentage}% Score</div>
          </div>

          <div className="result-meta">
            <div className="meta-item">
              <span className="label">Evaluated on:</span>
              <span className="value">
                {new Date(result.evaluated_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="meta-item">
              <span className="label">Status:</span>
              <span
                className={`value status-pill ${percentage >= 50 ? "pass" : "fail"}`}
              >
                {percentage >= 50 ? "Passed" : "Needs Review"}
              </span>
            </div>
          </div>

          <button
            className="btn-create"
            style={{ width: "100%", marginTop: "10px" }}
            onClick={() => navigate("/student/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
