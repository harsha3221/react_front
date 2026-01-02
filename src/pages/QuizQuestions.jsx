// src/pages/QuizQuestions.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../css/quiz-questions.css";

export default function QuizQuestions({ csrfToken }) {
  const { quizId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states
  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState(1);
  const [options, setOptions] = useState([
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
  ]);
  const [questionImage, setQuestionImage] = useState(null);

  // Edit mode states
  const [editMode, setEditMode] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState(null);

  /* ------------------------------------------------------ */
  /* Fetch Questions                                         */
  /* ------------------------------------------------------ */
  const fetchQuestions = () => {
    fetch(`http://localhost:3000/quiz/${quizId}/questions`, {
      method: "GET",
      credentials: "include",
      headers: { "CSRF-Token": csrfToken },
    })
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
  };

  useEffect(() => {
    fetchQuestions();
  }, [quizId, csrfToken]);

  /* ------------------------------------------------------ */
  /* Start editing an existing question                      */
  /* ------------------------------------------------------ */
  const startEditing = (q) => {
    setEditMode(true);
    setEditQuestionId(q.id);
    setQuestionText(q.question_text);
    setMarks(q.marks);

    setOptions(
      q.options.map((opt) => ({
        option_text: opt.option_text,
        is_correct: opt.is_correct,
        id: opt.id,
      }))
    );

    setQuestionImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ------------------------------------------------------ */
  /* Reset form state                                        */
  /* ------------------------------------------------------ */
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
  };

  /* ------------------------------------------------------ */
  /* Add option                                              */
  /* ------------------------------------------------------ */
  const addOption = () => {
    setOptions([...options, { option_text: "", is_correct: false }]);
  };

  /* ------------------------------------------------------ */
  /* Submit form: Create OR Update                           */
  /* ------------------------------------------------------ */
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("question_text", questionText);
    formData.append("marks", marks);
    formData.append("options", JSON.stringify(options));

    if (questionImage) formData.append("image", questionImage);

    const url = editMode
      ? `http://localhost:3000/quiz/${quizId}/questions/${editQuestionId}`
      : `http://localhost:3000/quiz/${quizId}/questions`;

    const method = editMode ? "PUT" : "POST";

    fetch(url, {
      method,
      credentials: "include",
      headers: { "CSRF-Token": csrfToken },
      body: formData,
    })
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

  /* ------------------------------------------------------ */
  /* Delete question                                         */
  /* ------------------------------------------------------ */
  const handleDeleteQuestion = (questionId) => {
    if (!window.confirm("Are you sure?")) return;

    fetch(`http://localhost:3000/quiz/${quizId}/questions/${questionId}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "CSRF-Token": csrfToken },
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message);
        }
        return res.json();
      })
      .then(() => {
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      })
      .catch((err) => alert(err.message));
  };

  /* ------------------------------------------------------ */
  /* RENDER SECTION                                          */
  /* ------------------------------------------------------ */

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
                  <button className="btn-edit" onClick={() => startEditing(q)}>
                    ✏️ Edit
                  </button>

                  <button
                    className="btn-danger"
                    onClick={() => handleDeleteQuestion(q.id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>

              {q.image_url && (
                <div className="question-image-wrapper">
                  <img
                    src={`http://localhost:3000${q.image_url}`}
                    alt="Question"
                    className="question-image"
                  />
                </div>
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

      {/* Form Section */}
      <div className="add-question-section">
        <h3>{editMode ? "Update Question" : "Add New Question"}</h3>

        <form onSubmit={handleSubmit} className="add-question-form">
          <textarea
            placeholder="Enter question text..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
          />

          <input
            type="number"
            min="1"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            placeholder="Marks"
          />

          <label className="image-label">
            Question Image (optional)
            <input
              id="question-image-input"
              type="file"
              accept="image/*"
              onChange={(e) => setQuestionImage(e.target.files?.[0] || null)}
            />
          </label>

          <h4>Options</h4>

          {options.map((opt, index) => (
            <div key={index} className="option-row">
              <input
                type="text"
                placeholder={`Option ${index + 1}`}
                value={opt.option_text}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index].option_text = e.target.value;
                  setOptions(newOptions);
                }}
                required
              />
              <label>
                <input
                  type="checkbox"
                  checked={opt.is_correct}
                  onChange={() => {
                    const newOptions = [...options];
                    newOptions[index].is_correct =
                      !newOptions[index].is_correct;
                    setOptions(newOptions);
                  }}
                />
                Correct
              </label>
            </div>
          ))}

          <button type="button" onClick={addOption} className="btn-secondary">
            ➕ Add Option
          </button>

          <button type="submit" className="btn-primary">
            {editMode ? "Update Question" : "Save Question"}
          </button>

          {editMode && (
            <button
              type="button"
              className="btn-cancel"
              onClick={resetForm}
              style={{ marginTop: "8px" }}
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
