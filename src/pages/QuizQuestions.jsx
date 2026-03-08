import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import "../css/quiz-questions.css";
import { useAuth } from "../context/AuthContext";

import {
  fetchQuizQuestionsApi,
  createQuestionApi,
  updateQuestionApi,
  deleteQuestionApi,
} from "../api/quizQuestions.api";

export default function QuizQuestions() {
  const { quizId } = useParams();
  const { csrfToken } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- FORM STATE ---------------- */
  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState(1);
  const [options, setOptions] = useState([
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
  ]);
  const [questionImage, setQuestionImage] = useState(null);

  /* ---------------- EDIT MODE ---------------- */
  const [editMode, setEditMode] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState(null);

  const STORAGE_KEY = `quiz-question-draft-${quizId}`;

  /* ---------------- LOAD DRAFT ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setQuestionText(data.questionText || "");
        setMarks(data.marks || 1);
        setOptions(
          data.options || [
            { option_text: "", is_correct: false },
            { option_text: "", is_correct: false },
          ],
        );
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [STORAGE_KEY]);

  /* ---------------- SAVE DRAFT ---------------- */
  useEffect(() => {
    if (editMode) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ questionText, marks, options }),
    );
  }, [questionText, marks, options, editMode, STORAGE_KEY]);

  /* ---------------- FETCH QUESTIONS ---------------- */
  const fetchQuestions = useCallback(() => {
    setLoading(true);

    fetchQuizQuestionsApi(quizId)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch questions");
        return res.json();
      })
      .then((data) => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [quizId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  /* ---------------- EDIT ---------------- */
  const startEditing = (q) => {
    localStorage.removeItem(STORAGE_KEY);

    setEditMode(true);
    setEditQuestionId(q.id);
    setQuestionText(q.question_text);
    setMarks(q.marks);
    setOptions(
      q.options.map((opt) => ({
        option_text: opt.option_text,
        is_correct: opt.is_correct,
        id: opt.id,
      })),
    );
    setQuestionImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------------- RESET ---------------- */
  const resetForm = () => {
    setQuestionText("");
    setMarks(1);
    setOptions([
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ]);
    setQuestionImage(null);
    setEditMode(false);
    setEditQuestionId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("question_text", questionText);
    formData.append("marks", marks);
    formData.append("options", JSON.stringify(options));
    if (questionImage) formData.append("image", questionImage);

    const apiCall = editMode
      ? updateQuestionApi(quizId, editQuestionId, formData, csrfToken)
      : createQuestionApi(quizId, formData, csrfToken);

    apiCall
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message);
        }
        return res.json();
      })
      .then(() => {
        resetForm();
        fetchQuestions();
      })
      .catch((err) => alert(err.message));
  };

  /* ---------------- DELETE ---------------- */
  const handleDeleteQuestion = (questionId) => {
    if (!window.confirm("Are you sure?")) return;

    deleteQuestionApi(quizId, questionId, csrfToken)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message);
        }
      })
      .then(() => {
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      })
      .catch((err) => alert(err.message));
  };

  /* ---------------- RENDER ---------------- */
  if (loading) return <h2>Loading questions...</h2>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="quiz-questions-container">
      <h2>
        {editMode ? "Edit Question" : "Questions for Quiz"} #{quizId}
      </h2>

      <div className="questions-list">
        {questions.length === 0 ? (
          <p>No questions added yet.</p>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="question-card">
              <div className="question-header-row">
                <h3>
                  Q: {q.question_text} ({q.marks} marks)
                </h3>
                <div className="question-actions">
                  <button onClick={() => startEditing(q)}>✏️ Edit</button>
                  <button onClick={() => handleDeleteQuestion(q.id)}>
                    🗑 Delete
                  </button>
                </div>
              </div>

              {q.image_url && (
                <img
                  src={`${q.image_url}`}
                  alt="Question"
                  className="question-image"
                />
              )}

              <ul>
                {q.options.map((opt) => (
                  <li key={opt.id}>
                    {opt.is_correct ? "✅" : "⭕"} {opt.option_text}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="add-question-form">
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          required
        />

        <input
          type="number"
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setQuestionImage(e.target.files?.[0] || null)}
        />

        {options.map((opt, i) => (
          <div key={i}>
            <input
              value={opt.option_text}
              onChange={(e) => {
                const copy = [...options];
                copy[i].option_text = e.target.value;
                setOptions(copy);
              }}
            />
            <input
              type="checkbox"
              checked={opt.is_correct}
              onChange={() => {
                const copy = [...options];
                copy[i].is_correct = !copy[i].is_correct;
                setOptions(copy);
              }}
            />
          </div>
        ))}

        <button type="submit">
          {editMode ? "Update Question" : "Save Question"}
        </button>

        {editMode && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}
