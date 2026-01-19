// src/pages/StudentQuizSubmitted.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/student-quiz.css"; // reuse neon theme
import { useAuth } from "../context/AuthContext";
export default function StudentQuizSubmitted() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { csrfToken } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prevent back navigation into quiz
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const onPop = () => {
      window.history.pushState(null, "", window.location.href);
      alert("Quiz is already submitted. You cannot go back.");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Fetch quiz summary
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/student/quiz/${quizId}/summary`,
          {
            credentials: "include",
            headers: { "CSRF-Token": csrfToken },
          }
        );

        const data = await res.json();
        if (res.ok) {
          setQuiz(data.quiz);
        }
      } catch (err) {
        console.error("Error loading quiz summary:", err);
      }
      setLoading(false);
    };

    load();
  }, [quizId, csrfToken]);

  if (loading) return <div className="student-quiz-page">Loading...</div>;

  return (
    <div className="student-quiz-page neon-bg">
      <header className="quiz-header">
        <h2>Quiz Submitted</h2>
      </header>

      <main className="submitted-container">
        <div className="submitted-card">
          <h3>Your responses have been recorded ✔</h3>

          {quiz && (
            <>
              <p className="quiz-title">{quiz.title}</p>
              <p className="quiz-teacher">By: {quiz.teacher_name}</p>
            </>
          )}

          <p className="submitted-note">
            You cannot reopen this quiz. Your teacher will release the results
            later.
          </p>

          <button
            className="btn-submit"
            onClick={() => navigate("/student/dashboard")}
          >
            Return to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
