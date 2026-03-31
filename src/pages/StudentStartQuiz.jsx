import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/student-quiz.css";
import { useAuth } from "../context/AuthContext";

import {
  startStudentQuizApi,
  saveStudentAnswerApi,
  submitStudentQuizApi,
  reportCheatingApi,
} from "../api/studentQuizStart.api";

/* -------------------------------------------------- */
/* HELPERS                                            */
/* -------------------------------------------------- */

export default function StudentStartQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { csrfToken } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const intervalRef = useRef(null);
  const warnedOnceRef = useRef(false);
  const hiddenTimerRef = useRef(null);
  const isSubmittingRef = useRef(false);

  /* -------------------------------------------------- */
  /* SUBMIT (SAFE AGAINST DOUBLE CALLS)                  */
  /* -------------------------------------------------- */
  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      await submitStudentQuizApi(quizId, csrfToken);
      navigate(`/student/quiz/${quizId}/submitted`, { replace: true });
    } catch {
      alert("Submit failed. Please contact instructor.");
      isSubmittingRef.current = false;
    }
  }, [quizId, csrfToken, navigate]);

  /* -------------------------------------------------- */
  /* LOAD QUIZ                                          */
  /* -------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await startStudentQuizApi(quizId, csrfToken);
        const data = await res.json();
        console.log("FULL API RESPONSE:", data);
        console.log("QUESTIONS:", data.questions);

        if (!res.ok) throw new Error(data.message);

        // 1. Check if already submitted
        if (data.attempt?.submitted) {
          navigate(`/student/quiz/${quizId}/submitted`, { replace: true });
          return;
        }

        // 2. Set Quiz Info
        setQuiz(data.quiz);

        // 3. Set Questions (Ensure options exist)
        const rawQuestions = data.questions || [];
        setQuestions(rawQuestions);

        // 4. Map Existing Answers correctly
        // We use a temp object to avoid multiple re-renders
        const savedAnswersMap = {};

        if (data.existingAnswers && Array.isArray(data.existingAnswers)) {
          data.existingAnswers.forEach((ans) => {
            const qId = ans.question_id;
            const oId = ans.option_id;

            if (!savedAnswersMap[qId]) {
              savedAnswersMap[qId] = [];
            }
            // Ensure we don't push duplicates and keep IDs consistent (Numbers)
            if (!savedAnswersMap[qId].includes(oId)) {
              savedAnswersMap[qId].push(oId);
            }
          });
        }
        setAnswers(savedAnswersMap);

        // 5. Timer Logic
        if (data.attempt?.started_at && data.quiz?.duration_minutes) {
          const startedAt = new Date(data.attempt.started_at).getTime();
          const durationMs = data.quiz.duration_minutes * 60 * 1000;
          const remaining = startedAt + durationMs - Date.now();
          setTimeLeft(Math.max(0, remaining));
        }
      } catch (err) {
        console.error("Quiz Load Error:", err);
        setError(err.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [quizId, csrfToken, navigate]);
  /* -------------------------------------------------- */
  /* TIMER                                              */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (timeLeft == null) return;

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
  /* TAB SWITCH / VISIBILITY                             */
  /* -------------------------------------------------- */
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        reportCheatingApi(quizId, "tab_switch", csrfToken);

        if (!warnedOnceRef.current) {
          warnedOnceRef.current = true;
          alert("Warning sent to teacher!");
        }

        // ❌ REMOVE AUTO SUBMIT
      }
    };

    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [quizId, csrfToken]);

  /* -------------------------------------------------- */
  /* NETWORK DISCONNECT                                  */
  /* -------------------------------------------------- */
  useEffect(() => {
    const onOffline = () => {
      alert("Network disconnected. Quiz submitted.");
      handleSubmit();
    };

    window.addEventListener("offline", onOffline);
    return () => window.removeEventListener("offline", onOffline);
  }, [handleSubmit]);

  /* -------------------------------------------------- */
  /* SAVE ANSWERS                                       */
  /* -------------------------------------------------- */
  const toggleOption = (qid, oid) => {
    setAnswers((prev) => {
      const cur = prev[qid] || [];
      const updated = cur.includes(oid)
        ? cur.filter((x) => x !== oid)
        : [...cur, oid];

      saveStudentAnswerApi(quizId, qid, updated, csrfToken).catch(() =>
        console.error("Failed to save answer"),
      );

      return { ...prev, [qid]: updated };
    });
  };

  /* -------------------------------------------------- */
  /* RENDER                                             */
  /* -------------------------------------------------- */
  if (loading) return <div>Loading quiz…</div>;
  if (error) return <div className="error">{error}</div>;

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000);
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
  };

  return (
    <div className="student-quiz-page neon-bg">
      <h2>{quiz.title}</h2>

      <div className="quiz-timer">⏱ {formatTime(timeLeft)}</div>

      {questions.map((q, i) => (
        <div key={q.id} className="question-card">
          <h4>
            Q{i + 1}. {q.question_text}
          </h4>

          {/* ✅ QUESTION IMAGE */}
          {q.image_url && (
            <div className="question-image-wrapper">
              <img
                src={q.image_url}
                alt="question"
                className="question-image"
                loading="lazy"
              />
            </div>
          )}

          {/* OPTIONS */}
          {q.options.map((opt) => (
            <label key={opt.id} className="option">
              <input
                type="checkbox"
                checked={(answers[q.id] || []).includes(opt.id)}
                onChange={() => toggleOption(q.id, opt.id)}
              />

              {/* TEXT */}
              <span>{opt.option_text}</span>

              {/* ✅ OPTION IMAGE */}
              {opt.image_url && (
                <img
                  src={opt.image_url}
                  alt="option"
                  className="option-image"
                  loading="lazy"
                />
              )}
            </label>
          ))}
        </div>
      ))}

      <button
        className="btn-submit"
        onClick={handleSubmit}
        disabled={isSubmittingRef.current}
      >
        Submit Quiz
      </button>
    </div>
  );
}
