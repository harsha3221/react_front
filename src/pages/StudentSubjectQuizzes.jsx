// src/pages/StudentSubjectQuizzes.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/student-dashboard.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
export default function StudentSubjectQuizzes() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { csrfToken } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(new Date());

  /* -------------------------------------------------- */
  /* FETCH QUIZZES                                      */
  /* -------------------------------------------------- */
  useEffect(() => {
    fetch(`http://localhost:3000/student/subject/${subjectId}/quizzes`, {
      method: "GET",
      credentials: "include",
      headers: { "CSRF-Token": csrfToken },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to fetch quizzes");
        return data;
      })
      .then((data) => {
        setQuizzes(data.quizzes || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [subjectId, csrfToken]);

  /* -------------------------------------------------- */
  /* REALTIME CLOCK                                     */
  /* -------------------------------------------------- */
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return <div className="student-dashboard">Loading quizzes...</div>;
  if (error) return <div className="student-dashboard error">{error}</div>;
  if (quizzes.length === 0)
    return (
      <div className="student-dashboard">
        <h1>No quizzes found for this course</h1>
      </div>
    );

  /* -------------------------------------------------- */
  /* CATEGORIZE QUIZZES                                 */
  /* -------------------------------------------------- */
  const activeQuizzes = [];
  const upcomingQuizzes = [];
  const expiredQuizzes = [];

  quizzes.forEach((q) => {
    const start = new Date(q.start_time);
    const end = new Date(q.end_time);

    if (start <= now && end >= now) activeQuizzes.push(q);
    else if (start > now) upcomingQuizzes.push(q);
    else expiredQuizzes.push(q);
  });

  activeQuizzes.sort((a, b) => new Date(a.end_time) - new Date(b.end_time));
  upcomingQuizzes.sort(
    (a, b) => new Date(a.start_time) - new Date(b.start_time)
  );
  expiredQuizzes.sort((a, b) => new Date(b.end_time) - new Date(a.end_time));

  /* -------------------------------------------------- */
  /* ACTION HANDLER                                     */
  /* -------------------------------------------------- */
  const onQuizAction = (quiz) => {
    const start = new Date(quiz.start_time);
    const end = new Date(quiz.end_time);

    // ✅ RESULTS PUBLISHED
    if (quiz.results_published && quiz.submitted) {
      return navigate(`/student/quiz/${quiz.id}/result`);
    }

    // Submitted but result not published
    if (quiz.submitted) {
      return navigate(`/student/quiz/${quiz.id}/submitted`);
    }

    // Expired but attempted
    if (end < now && quiz.attempted && !quiz.submitted) {
      return navigate(`/student/quiz/${quiz.id}/submitted`);
    }

    // Active quiz
    if (start <= now && end >= now) {
      return navigate(`/student/quiz/${quiz.id}/start`);
    }

    alert("Quiz expired and not attempted.");
  };

  const formatCountdown = (startTime) => {
    const diff = new Date(startTime) - now;
    if (diff <= 0) return "Starting...";
    let sec = Math.floor(diff / 1000);
    const hrs = Math.floor(sec / 3600);
    sec %= 3600;
    const mins = Math.floor(sec / 60);
    const seconds = sec % 60;
    if (hrs > 0)
      return `${hrs}h ${mins}m ${seconds < 10 ? "0" : ""}${seconds}s`;
    return `${mins}m ${seconds < 10 ? "0" : ""}${seconds}s`;
  };

  /* -------------------------------------------------- */
  /* RENDER                                             */
  /* -------------------------------------------------- */
  return (
    <>
      <Navbar role="student" />
      <div className="student-dashboard">
        <h1>Quizzes for Subject #{subjectId}</h1>

        <div className="joined-courses">
          {/* ACTIVE */}
          {activeQuizzes.length > 0 && <h2>🟢 Active Quizzes</h2>}
          {activeQuizzes.map((q) => (
            <div key={q.id} className="course-card active">
              <h4>{q.title}</h4>
              <p>{q.description}</p>
              <p>
                <strong>Ends:</strong> {new Date(q.end_time).toLocaleString()}
              </p>
              <button className="join-btn" onClick={() => onQuizAction(q)}>
                {q.attempted ? "Continue Quiz" : "Start Quiz"}
              </button>
            </div>
          ))}

          {/* UPCOMING */}
          {upcomingQuizzes.length > 0 && <h2>🔵 Upcoming Quizzes</h2>}
          {upcomingQuizzes.map((q) => (
            <div key={q.id} className="course-card upcoming">
              <h4>{q.title}</h4>
              <p>{q.description}</p>
              <p>
                <strong>Starts:</strong>{" "}
                {new Date(q.start_time).toLocaleString()}
              </p>
              <p className="countdown">⏳ {formatCountdown(q.start_time)}</p>
              <button className="join-btn" disabled>
                Starts Soon
              </button>
            </div>
          ))}

          {/* EXPIRED */}
          {expiredQuizzes.length > 0 && <h2>🔴 Expired Quizzes</h2>}
          {expiredQuizzes.map((q) => (
            <div key={q.id} className="course-card expired">
              <h4>{q.title}</h4>
              <p>{q.description}</p>
              <p>
                <strong>Ended:</strong> {new Date(q.end_time).toLocaleString()}
              </p>

              {q.results_published && q.submitted ? (
                <button className="join-btn" onClick={() => onQuizAction(q)}>
                  View Result
                </button>
              ) : q.submitted ? (
                <button className="join-btn" onClick={() => onQuizAction(q)}>
                  Submitted (Awaiting Result)
                </button>
              ) : q.attempted ? (
                <button className="join-btn" onClick={() => onQuizAction(q)}>
                  Submitted (Pending)
                </button>
              ) : (
                <button className="join-btn" disabled>
                  Expired
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
