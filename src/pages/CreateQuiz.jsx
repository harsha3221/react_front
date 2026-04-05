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

  /* SUBMIT*/
  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Create real Date objects from the input strings
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    //  Tiny edge case fix: 60-second grace period
    // Allows for network lag or a few seconds of user delay
    const gracePeriod = 60 * 1000;

    // Check if start time is significantly in the past
    if (start.getTime() < now.getTime() - gracePeriod) {
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
        // Convert to ISO format before sending to Backend (UTC)
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        csrfToken,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create quiz");

      // Clear draft after successful creation
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
      <button
        onClick={() => navigate(`/teacher/subjects/${subjectId}/quizzes`)}
        className="btn-back"
      >
        ← Back to Quizzes
      </button>

      <h2>Create New Quiz</h2>
      <p className="create-quiz-subtitle">
        Set the schedule and parameters for your assessment.
      </p>

      {error && (
        <div className="error">
          <span>⚠️</span> {error}
        </div>
      )}
      {message && (
        <div className="success">
          <span>✅</span> {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="quiz-form">
        <label>
          Quiz Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Midterm Organic Chemistry"
            required
          />
        </label>

        <label>
          Description (optional)
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What should students focus on during this quiz?"
          />
        </label>

        <div className="form-row">
          <label>
            Duration (Minutes)
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
              required
            />
          </label>

          {/* Placeholder for visual balance or extra settings */}
          <div style={{ visibility: "hidden", height: 0 }}></div>
        </div>

        <div className="form-row">
          <label>
            Start Time
            <input
              type="datetime-local"
              value={startTime}
              min={getCurrentDateTimeLocal()}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </label>

          <label>
            End Time
            <input
              type="datetime-local"
              value={endTime}
              min={startTime || getCurrentDateTimeLocal()}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </label>
        </div>

        <button type="submit" className="btn-submit">
          Publish Quiz
        </button>
      </form>
    </div>
  );
}
