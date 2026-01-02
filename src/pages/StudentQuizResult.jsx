import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function StudentQuizResult({ csrfToken }) {
  const { quizId } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://localhost:3000/student/quiz/${quizId}/result`, {
      credentials: "include",
      headers: { "CSRF-Token": csrfToken },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Result not available");
        return res.json();
      })
      .then((data) => setResult(data.result))
      .catch((err) => setError(err.message));
  }, [quizId, csrfToken]);

  if (error) return <div>{error}</div>;
  if (!result) return <div>Loading…</div>;

  return (
    <div className="student-result-page">
      <h2>Your Result</h2>
      <p>
        Marks: {result.obtained_marks} / {result.total_marks}
      </p>
      <p>Evaluated at: {new Date(result.evaluated_at).toLocaleString()}</p>
    </div>
  );
}
