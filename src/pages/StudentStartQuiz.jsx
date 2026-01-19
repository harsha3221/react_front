import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/student-quiz.css";
import { useAuth } from "../context/AuthContext";
/* -------------------------------------------------- */
/* HELPERS                                            */
/* -------------------------------------------------- */
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

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
  /* SUBMIT                                             */
  /* -------------------------------------------------- */
  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      await fetch(`http://localhost:3000/student/quiz/${quizId}/submit`, {
        method: "POST",
        credentials: "include",
        headers: { "CSRF-Token": csrfToken },
      });

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
        const res = await fetch(
          `http://localhost:3000/student/quiz/${quizId}/start`,
          {
            credentials: "include",
            headers: { "CSRF-Token": csrfToken },
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        if (data.attempt?.submitted) {
          navigate(`/student/quiz/${quizId}/submitted`, { replace: true });
          return;
        }

        /* RANDOMIZE QUESTIONS + OPTIONS */
        const randomizedQuestions = shuffle(
          (data.questions || []).map((q) => ({
            ...q,
            options: shuffle(q.options || []),
          }))
        );

        setQuiz(data.quiz);
        setQuestions(randomizedQuestions);

        /* Normalize answers (always array) */
        const map = {};
        (data.existingAnswers || []).forEach((a) => {
          if (!map[a.question_id]) map[a.question_id] = [];
          map[a.question_id].push(a.option_id);
        });
        setAnswers(map);

        /* TIMER = started_at + duration_minutes */
        const startedAt = new Date(data.attempt.started_at).getTime();
        const durationMs = data.quiz.duration_minutes * 60 * 1000;
        const endTime = startedAt + durationMs;
        setTimeLeft(Math.max(0, endTime - Date.now()));
      } catch (err) {
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
        if (!warnedOnceRef.current) {
          warnedOnceRef.current = true;
          alert("Return in 5 seconds or quiz will submit");
          hiddenTimerRef.current = setTimeout(handleSubmit, 5000);
        } else {
          handleSubmit();
        }
      } else if (hiddenTimerRef.current) {
        clearTimeout(hiddenTimerRef.current);
      }
    };

    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [handleSubmit]);

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
  /* SAVE ANSWERS (MULTI SELECT)                         */
  /* -------------------------------------------------- */
  const saveAnswer = async (questionId, optionIds) => {
    await fetch(`http://localhost:3000/student/quiz/${quizId}/answer`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ question_id: questionId, option_ids: optionIds }),
    });
  };

  const toggleOption = (qid, oid) => {
    setAnswers((prev) => {
      const cur = prev[qid] || [];
      const updated = cur.includes(oid)
        ? cur.filter((x) => x !== oid)
        : [...cur, oid];

      saveAnswer(qid, updated);
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

          {q.options.map((opt) => (
            <label key={opt.id} className="option">
              <input
                type="checkbox"
                checked={(answers[q.id] || []).includes(opt.id)}
                onChange={() => toggleOption(q.id, opt.id)}
              />
              {opt.option_text}
            </label>
          ))}
        </div>
      ))}

      <button className="btn-submit" onClick={handleSubmit}>
        Submit Quiz
      </button>
    </div>
  );
}
