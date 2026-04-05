// src/pages/StudentSubjectQuizzes.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/student-dashboard.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { fetchStudentSubjectQuizzesApi } from "../api/studentSubjectQuizzes.api";

export default function StudentSubjectQuizzes() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { csrfToken } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(new Date());

  /* ⏱️ LIVE CLOCK UPDATE */
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  /* 🛰️ FETCH DATA */
  useEffect(() => {
    setLoading(true);
    fetchStudentSubjectQuizzesApi(subjectId, csrfToken)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to fetch quizzes");
        setQuizzes(data.quizzes || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [subjectId, csrfToken]);

  /* 🛠️ ACTION HANDLER */
  const onQuizAction = (quiz) => {
    const start = new Date(quiz.start_time);
    const end = new Date(quiz.end_time);

    if (quiz.results_published && quiz.submitted) {
      return navigate(`/student/quiz/${quiz.id}/result`);
    }
    if (quiz.submitted) {
      return navigate(`/student/quiz/${quiz.id}/submitted`);
    }
    if (end < now && quiz.attempted && !quiz.submitted) {
      return navigate(`/student/quiz/${quiz.id}/submitted`);
    }
    if (start <= now && end >= now) {
      return navigate(`/student/quiz/${quiz.id}/start`);
    }
    alert("Quiz expired and not attempted.");
  };

  /* ⏳ COUNTDOWN FORMATTER */
  const formatCountdown = (startTime) => {
    const diff = new Date(startTime) - now;
    if (diff <= 0) return "Starting...";
    let sec = Math.floor(diff / 1000);
    const hrs = Math.floor(sec / 3600);
    sec %= 3600;
    const mins = Math.floor(sec / 60);
    const seconds = sec % 60;
    return hrs > 0
      ? `${hrs}h ${mins}m ${seconds.toString().padStart(2, "0")}s`
      : `${mins}m ${seconds.toString().padStart(2, "0")}s`;
  };

  /* 🏗️ CATEGORIZATION LOGIC */
  const activeQuizzes = quizzes.filter(
    (q) => new Date(q.start_time) <= now && new Date(q.end_time) >= now,
  );
  const upcomingQuizzes = quizzes.filter((q) => new Date(q.start_time) > now);
  const expiredQuizzes = quizzes.filter((q) => new Date(q.end_time) < now);

  // Sorting
  activeQuizzes.sort((a, b) => new Date(a.end_time) - new Date(b.end_time));
  upcomingQuizzes.sort(
    (a, b) => new Date(a.start_time) - new Date(b.start_time),
  );
  expiredQuizzes.sort((a, b) => new Date(b.end_time) - new Date(a.end_time));

  /* 🟡 LOADING STATE */
  if (loading)
    return (
      <>
        <Navbar role="student" />
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading assessments...</p>
        </div>
      </>
    );

  /* 🔴 ERROR/EMPTY STATE */
  if (error || quizzes.length === 0)
    return (
      <>
        <Navbar role="student" />
        <div className="teacher-dashboard">
          <section className="teacher-welcome">
            <h1>Assessments</h1>
            <p>
              {error
                ? error
                : "No quizzes have been posted for this course yet."}
            </p>
          </section>
        </div>
      </>
    );

  return (
    <>
      <Navbar role="student" />
      <div className="teacher-dashboard">
        {/* HERO SECTION */}
        <section className="teacher-welcome">
          <h1>Subject Quizzes</h1>
          <p>
            Manage your assessments for <strong>Subject #{subjectId}</strong>.
            Stay on top of your deadlines!
          </p>
        </section>

        <div className="joined-courses">
          {/* 🟢 ACTIVE SECTION */}
          {activeQuizzes.length > 0 && (
            <>
              <h2>🟢 Active Quizzes</h2>
              {activeQuizzes.map((q) => (
                <div key={q.id} className="course-card active">
                  <div>
                    <h4>{q.title}</h4>
                    <p>{q.description}</p>
                    <p>
                      <strong>Deadline:</strong>{" "}
                      {new Date(q.end_time).toLocaleString()}
                    </p>
                  </div>
                  <button className="join-btn" onClick={() => onQuizAction(q)}>
                    {q.attempted ? "Continue Quiz" : "Start Quiz"}
                  </button>
                </div>
              ))}
            </>
          )}

          {/* 🔵 UPCOMING SECTION */}
          {upcomingQuizzes.length > 0 && (
            <>
              <h2>🔵 Upcoming Quizzes</h2>
              {upcomingQuizzes.map((q) => (
                <div key={q.id} className="course-card upcoming">
                  <div>
                    <h4>{q.title}</h4>
                    <p>{q.description}</p>
                    <p>
                      <strong>Available:</strong>{" "}
                      {new Date(q.start_time).toLocaleString()}
                    </p>
                    <div className="countdown">
                      ⏳ {formatCountdown(q.start_time)}
                    </div>
                  </div>
                  <button className="join-btn" disabled>
                    Starts Soon
                  </button>
                </div>
              ))}
            </>
          )}

          {/* 🔴 EXPIRED SECTION */}
          {expiredQuizzes.length > 0 && (
            <>
              <h2>⚪ Past Quizzes</h2>
              {expiredQuizzes.map((q) => (
                <div key={q.id} className="course-card expired">
                  <div>
                    <h4>{q.title}</h4>
                    <p>{q.description}</p>
                    <p>
                      <strong>Ended:</strong>{" "}
                      {new Date(q.end_time).toLocaleString()}
                    </p>
                  </div>
                  {q.results_published && q.submitted ? (
                    <button
                      className="join-btn"
                      onClick={() => onQuizAction(q)}
                    >
                      View Result
                    </button>
                  ) : q.submitted ? (
                    <button
                      className="join-btn"
                      onClick={() => onQuizAction(q)}
                    >
                      Awaiting Result
                    </button>
                  ) : (
                    <button className="join-btn" disabled>
                      Expired
                    </button>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}
