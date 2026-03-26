import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/create-quiz.css";
import { useAuth } from "../context/AuthContext";
import { createQuizApi } from "../api/quiz.api";

export default function CreateQuiz() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { csrfToken } = useAuth();

  /* ---------------- FORM STATE ---------------- */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const STORAGE_KEY = `create-quiz-draft-${subjectId}`;

  /* ---------------- HELPER ---------------- */
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  /* ---------------- LOAD DRAFT ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTitle(data.title || "");
        setDescription(data.description || "");
        setDuration(data.duration || "");
        setStartTime(data.startTime || "");
        setEndTime(data.endTime || "");
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [STORAGE_KEY]);

  /* ---------------- SAVE DRAFT ---------------- */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        title,
        description,
        duration,
        startTime,
        endTime,
      }),
    );
  }, [title, description, duration, startTime, endTime, STORAGE_KEY]);

  /* ---------------- AUTO FIX END TIME ---------------- */
  useEffect(() => {
    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
      setEndTime("");
    }
  }, [startTime, endTime]);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    /* 🔥 VALIDATIONS */
    if (start < now) {
      return setError("Start time cannot be in the past");
    }

    if (end <= start) {
      return setError("End time must be after start time");
    }

    if (Number(duration) <= 0) {
      return setError("Duration must be greater than 0");
    }

    try {
      const res = await createQuizApi({
        subjectId,
        title,
        description,
        duration,
        startTime,
        endTime,
        csrfToken,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create quiz");

      localStorage.removeItem(STORAGE_KEY);

      setMessage("✅ Quiz created successfully!");
      setTimeout(() => {
        navigate(`/teacher/subjects/${subjectId}/quizzes`);
      }, 1500);
    } catch (err) {
      console.error("Quiz creation failed:", err);
      setError(err.message);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="create-quiz-container">
      <h2>Create New Quiz</h2>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <form onSubmit={handleSubmit} className="quiz-form">
        <label>
          Quiz Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label>
          Description (optional):
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter quiz description..."
          />
        </label>

        <label>
          Duration (in minutes):
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </label>

        <label>
          Start Time:
          <input
            type="datetime-local"
            value={startTime}
            min={getCurrentDateTimeLocal()} // 🔥 no past selection
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </label>

        <label>
          End Time:
          <input
            type="datetime-local"
            value={endTime}
            min={startTime || getCurrentDateTimeLocal()} // 🔥 must be after start
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </label>

        <button type="submit" className="btn-submit">
          Create Quiz
        </button>
      </form>

      <button
        onClick={() => navigate(`/teacher/subjects/${subjectId}/quizzes`)}
        className="btn-back"
      >
        ← Back to Quizzes
      </button>
    </div>
  );
}
