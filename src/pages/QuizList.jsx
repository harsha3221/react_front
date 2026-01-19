import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../css/quiz-list.css";
import { useAuth } from "../context/AuthContext";
export default function QuizList() {
  const { subjectId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [subjectName, setSubjectName] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState(new Date()); // ⏱ live clock
  const { csrfToken } = useAuth();
  /* ⏱ Update time every minute */
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  /* Decide quiz state based on live time */
  const getQuizState = (quiz) => {
    const start = quiz.start_time ? new Date(quiz.start_time) : null;
    const end = quiz.end_time ? new Date(quiz.end_time) : null;

    if (end && now > end) return "completed";
    if (start && now >= start && (!end || now <= end)) return "active";
    return "draft";
  };

  useEffect(() => {
    setError("");

    fetch(`http://localhost:3000/quiz/subject/${subjectId}`, {
      credentials: "include",
      // headers: { "CSRF-Token": csrfToken },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to fetch quizzes");
        }
        return res.json();
      })
      .then((data) => {
        setQuizzes(data.quizzes || []);
        setSubjectName(data.subjectName || "Subject");
      })
      .catch((err) => {
        console.error("Error loading quizzes:", err);
        setError(err.message);
      });
  }, [subjectId]);

  return (
    <>
      <Navbar role="teacher"></Navbar>
      <div className="quiz-list-container">
        <h2>Quizzes for {subjectName}</h2>

        {error && <p className="error">{error}</p>}

        <Link
          to={`/teacher/subjects/${subjectId}/quizzes/new`}
          className="btn-create"
        >
          ➕ Create New Quiz
        </Link>

        {quizzes.length === 0 ? (
          <p>No quizzes created yet.</p>
        ) : (
          <ul className="quiz-list">
            {quizzes.map((quiz) => {
              const state = getQuizState(quiz);

              return (
                <li key={quiz.id} className="quiz-item">
                  <div>
                    <strong>{quiz.title}</strong> <br />
                    {new Date(quiz.start_time).toLocaleString()} →{" "}
                    {new Date(quiz.end_time).toLocaleString()}
                    <br />
                    <span className={`quiz-status quiz-status-${state}`}>
                      {state === "draft"
                        ? "Draft (Upcoming)"
                        : state === "active"
                        ? "Active (Running)"
                        : "Completed"}
                    </span>
                  </div>

                  <div className="quiz-actions">
                    {/* Draft → editable */}
                    {state === "draft" && (
                      <Link
                        to={`/teacher/quiz/${quiz.id}/questions`}
                        className="btn-view"
                      >
                        View / Add Questions
                      </Link>
                    )}

                    {/* Active → view-only */}
                    {state === "active" && (
                      <Link
                        to={`/teacher/quiz/${quiz.id}/questions`}
                        className="btn-view"
                      >
                        View Questions
                      </Link>
                    )}

                    {/* Completed → results */}
                    {state === "completed" && (
                      <Link
                        to={`/teacher/quiz/${quiz.id}/results`}
                        className="btn-view"
                      >
                        View Results
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
