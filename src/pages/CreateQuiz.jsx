import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/create-quiz.css";

export default function CreateQuiz({ csrfToken }) {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await fetch("http://localhost:3000/quiz/create", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          subject_id: subjectId,
          title,
          description,
          duration_minutes: parseInt(duration, 10),
          start_time: startTime,
          end_time: endTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create quiz");

      setMessage("✅ Quiz created successfully!");
      setTimeout(() => {
        navigate(`/teacher/subjects/${subjectId}/quizzes`);
      }, 1500);
    } catch (err) {
      console.error("Quiz creation failed:", err);
      setError(err.message);
    }
  };

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
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </label>

        <label>
          End Time:
          <input
            type="datetime-local"
            value={endTime}
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
