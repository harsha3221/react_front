import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../css/student-quiz.css";
import { useAuth } from "../context/AuthContext";

import {
  startStudentQuizApi,
  saveStudentAnswerApi,
  submitStudentQuizApi,
  reportCheatingApi,
} from "../api/studentQuizStart.api";
import { API_BASE } from "../config";

// Initialize Socket with credentials to pick up the Express Session cookie
const socket = io(`${API_BASE}`, {
  transports: ["websocket"],
  withCredentials: true,
});

export default function StudentStartQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { csrfToken, user } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const intervalRef = useRef(null);
  const warnedOnceRef = useRef(false);
  const isSubmittingRef = useRef(false);

  /* -------------------------------------------------- */
  /* AUTH & ROLE GUARD                                  */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (!loading && user && user.role !== "student") {
      alert("Access Denied: This area is for students only.");
      navigate("/");
    }
  }, [user, loading, navigate]);

  /* -------------------------------------------------- */
  /* SUBMIT LOGIC                                       */
  /* -------------------------------------------------- */
  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      await submitStudentQuizApi(quizId, csrfToken);
      navigate(`/student/quiz/${quizId}/submitted`, { replace: true });
    } catch (err) {
      alert("Submit failed. Please contact your instructor immediately.");
      isSubmittingRef.current = false;
    }
  }, [quizId, csrfToken, navigate]);

  /* -------------------------------------------------- */
  /* DATA FETCHING & TIMER INITIALIZATION               */
  /* -------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await startStudentQuizApi(quizId, csrfToken);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);
        if (data.attempt?.submitted) {
          navigate(`/student/quiz/${quizId}/submitted`, { replace: true });
          return;
        }

        setQuiz(data.quiz);
        setQuestions(data.questions || []);

        // Sync answers
        const savedAnswersMap = {};
        if (data.existingAnswers && Array.isArray(data.existingAnswers)) {
          data.existingAnswers.forEach((ans) => {
            if (!savedAnswersMap[ans.question_id])
              savedAnswersMap[ans.question_id] = [];
            if (!savedAnswersMap[ans.question_id].includes(ans.option_id)) {
              savedAnswersMap[ans.question_id].push(ans.option_id);
            }
          });
        }
        setAnswers(savedAnswersMap);

        // TIMER LOGIC: Personal Start Time + Duration
        if (data.attempt?.started_at && data.quiz?.duration_minutes) {
          const startedAt = new Date(data.attempt.started_at).getTime();
          const durationMs = data.quiz.duration_minutes * 60 * 1000;
          const personalEndTime = startedAt + durationMs;

          const remaining = personalEndTime - Date.now();
          setTimeLeft(Math.max(0, remaining));
        }
      } catch (err) {
        setError(err.message || "Failed to initialize quiz environment.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [quizId, csrfToken, navigate]);

  /* -------------------------------------------------- */
  /* TIMER ENGINE                                       */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(intervalRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [timeLeft, handleSubmit]);

  /* -------------------------------------------------- */
  /* PROCTORING & SOCKET COMMANDS                       */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (!user || user.role !== "student") return;

    const reportIncident = (type) => {
      console.warn(`[Proctor] Incident Logged: ${type}`);
      reportCheatingApi(quizId, type, csrfToken);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        reportIncident("tab_switch");
        if (!warnedOnceRef.current) {
          warnedOnceRef.current = true;
          alert("SECURITY WARNING: Tab switching is monitored.");
        }
      }
    };

    const handleBlur = () => reportIncident("window_blur");
    const handleContextMenu = (e) => {
      e.preventDefault();
      reportIncident("right_click_attempt");
    };

    // Teacher Command: Regular Force Submit
    socket.on("force_submit", (data) => {
      if (String(data.quizId) === String(quizId)) {
        alert("Your session has been terminated by the instructor.");
        handleSubmit();
      }
    });

    // Teacher Command: Disqualification (Assign Zero)
    socket.on("force_logout_zero", (data) => {
      isSubmittingRef.current = true;
      alert(
        data.message ||
          "Disqualified: You have been assigned zero for this quiz.",
      );
      navigate("/student/dashboard", { replace: true });
    });

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("contextmenu", handleContextMenu);
      socket.off("force_submit");
      socket.off("force_logout_zero");
    };
  }, [quizId, csrfToken, handleSubmit, user, navigate]);

  /* -------------------------------------------------- */
  /* ANSWER INTERACTION                                 */
  /* -------------------------------------------------- */
  const toggleOption = (qid, oid) => {
    if (isSubmittingRef.current) return;

    setAnswers((prev) => {
      const cur = prev[qid] || [];
      const updated = cur.includes(oid)
        ? cur.filter((x) => x !== oid)
        : [...cur, oid];

      saveStudentAnswerApi(quizId, qid, updated, csrfToken).catch(() => {
        console.error("Auto-save failed.");
      });

      return { ...prev, [qid]: updated };
    });
  };

  /* -------------------------------------------------- */
  /* RENDERING HELPERS                                  */
  /* -------------------------------------------------- */
  if (loading)
    return <div className="loading-screen">Encrypting Quiz Session...</div>;
  if (error) return <div className="error-screen">Error: {error}</div>;

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000);
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
  };

  return (
    <div className="student-quiz-page neon-bg">
      <header className="quiz-header">
        <div className="quiz-meta">
          <h2>{quiz?.title}</h2>
          <span className="student-tag">User: {user?.name}</span>
        </div>
        <div
          className={`quiz-timer ${timeLeft < 60000 ? "timer-critical" : ""}`}
        >
          ⏱ {formatTime(timeLeft)}
        </div>
      </header>

      <main className="questions-container">
        {questions.map((q, i) => (
          <section key={q.id} className="question-card">
            <h4 className="question-text">
              <span className="q-number">Q{i + 1}.</span> {q.question_text}
            </h4>

            {q.image_url && (
              <div className="question-image-wrapper">
                <img
                  src={q.image_url}
                  alt="Context"
                  className="question-image"
                  loading="lazy"
                />
              </div>
            )}

            <div className="options-grid">
              {q.options.map((opt) => (
                <label
                  key={opt.id}
                  className={`option-label ${(answers[q.id] || []).includes(opt.id) ? "selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="hidden-checkbox"
                    checked={(answers[q.id] || []).includes(opt.id)}
                    onChange={() => toggleOption(q.id, opt.id)}
                  />
                  <div className="option-content">
                    <span className="option-text">{opt.option_text}</span>
                    {opt.image_url && (
                      <img
                        src={opt.image_url}
                        alt="Visual"
                        className="option-image"
                      />
                    )}
                  </div>
                </label>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="quiz-footer">
        <button
          className="btn-submit"
          onClick={handleSubmit}
          disabled={isSubmittingRef.current}
        >
          {isSubmittingRef.current ? "Finalizing..." : "Submit Quiz"}
        </button>
      </footer>
    </div>
  );
}
