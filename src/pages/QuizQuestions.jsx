import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import "../css/quiz-questions.css";
import { useAuth } from "../context/AuthContext";
import imageCompression from "browser-image-compression";

import {
  fetchQuizQuestionsApi,
  createQuestionApi,
  updateQuestionApi,
  deleteQuestionApi,
} from "../api/quizQuestions.api";

export default function QuizQuestions() {
  const { quizId } = useParams();
  const { csrfToken } = useAuth();
  const [saving, setSaving] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- FORM STATE ---------------- */
  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState(1);
  const [options, setOptions] = useState([
    { option_text: "", is_correct: false, image: null },
    { option_text: "", is_correct: false, image: null },
  ]);
  const [questionImage, setQuestionImage] = useState(null);

  /* ---------------- EDIT MODE ---------------- */
  const [editMode, setEditMode] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState(null);

  const STORAGE_KEY = `quiz-question-draft-${quizId}`;

  /* ---------------- IMAGE COMPRESSION ---------------- */
  const compressImage = async (file) => {
    try {
      console.log("Original size:", file.size / 1024, "KB");

      const compressed = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });

      console.log("Compressed size:", compressed.size / 1024, "KB");

      return compressed;
    } catch (err) {
      console.error("Compression failed:", err);
      return file;
    }
  };

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
            { option_text: "", is_correct: false, image: null },
            { option_text: "", is_correct: false, image: null },
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
        image: null,
        image_url: opt.image_url || null,
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
      { option_text: "", is_correct: false, image: null },
      { option_text: "", is_correct: false, image: null },
    ]);
    setQuestionImage(null);
    setEditMode(false);
    setEditQuestionId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append("question_text", questionText);
    formData.append("marks", marks);

    const optionsWithoutImages = options.map((opt) => ({
      option_text: opt.option_text,
      is_correct: opt.is_correct,
      id: opt.id,
    }));

    formData.append("options", JSON.stringify(optionsWithoutImages));

    if (questionImage) {
      formData.append("image", questionImage);
    }

    options.forEach((opt, index) => {
      if (opt.image) {
        formData.append(`option_image_${index}`, opt.image);
      }
    });

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
      .catch((err) => alert(err.message))
      .finally(() => setSaving(false));
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
                  src={q.image_url}
                  alt="Question"
                  className="question-image"
                />
              )}

              <ul>
                {q.options.map((opt) => (
                  <li key={opt.id}>
                    {opt.is_correct ? "✅" : "⭕"} {opt.option_text}
                    {opt.image_url && (
                      <img
                        src={opt.image_url}
                        alt="option"
                        style={{ width: "80px", marginLeft: "10px" }}
                      />
                    )}
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

        {/* QUESTION IMAGE */}
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const compressed = await compressImage(file);
            setQuestionImage(compressed);
          }}
        />

        {options.map((opt, i) => (
          <div key={i} className="option-row">
            <input
              value={opt.option_text}
              onChange={(e) => {
                const copy = [...options];
                copy[i].option_text = e.target.value;
                setOptions(copy);
              }}
              placeholder={`Option ${i + 1}`}
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

            {/* OPTION IMAGE */}
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const compressed = await compressImage(file);

                const copy = [...options];
                copy[i].image = compressed;
                setOptions(copy);
              }}
            />

            {opt.image_url && (
              <img
                src={opt.image_url}
                alt="preview"
                style={{ width: "60px", marginTop: "5px" }}
              />
            )}
          </div>
        ))}

        <button type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : editMode
              ? "Update Question"
              : "Save Question"}
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
