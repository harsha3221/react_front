import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

import {
  fetchQuizResultsApi,
  publishQuizResultsApi,
} from "../api/teacherQuizResults.api";

export default function TeacherQuizResults() {
  const { quizId } = useParams();
  const { csrfToken } = useAuth();

  const [results, setResults] = useState([]);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);

  /* -------------------------------------------------- */
  /* LOAD RESULTS                                       */
  /* -------------------------------------------------- */
  const loadResults = useCallback(() => {
    setLoading(true);
    setError("");

    fetchQuizResultsApi(quizId)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to load results");
        }
        return res.json();
      })
      .then((data) => {
        setResults(data.results || []);
        setPublished(!!data.results_published);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [quizId]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  /* -------------------------------------------------- */
  /* PUBLISH RESULTS (DOUBLE-CLICK SAFE)                */
  /* -------------------------------------------------- */
  const publishResults = async () => {
    if (publishing) return;
    setPublishing(true);

    try {
      const res = await publishQuizResultsApi(quizId, csrfToken);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to publish results");
      }

      alert("✅ Results published to students");
      loadResults();
    } catch (err) {
      alert(err.message);
    } finally {
      setPublishing(false);
    }
  };

  /* -------------------------------------------------- */
  /* RENDER                                             */
  /* -------------------------------------------------- */
  if (loading) {
    return (
      <>
        <Navbar role="teacher" />
        <div className="results-page">
          <p>Loading results...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar role="teacher" />
        <div className="results-page error">{error}</div>
      </>
    );
  }

  return (
    <>
      <Navbar role="teacher" />

      <div className="results-page">
        <h2>Quiz Results</h2>

        {/* PUBLISH BUTTON */}
        {!published ? (
          <button
            className="btn-publish"
            onClick={publishResults}
            disabled={publishing}
          >
            {publishing ? "Publishing..." : "📢 Publish Results to Students"}
          </button>
        ) : (
          <p style={{ color: "green", fontWeight: "bold" }}>
            ✅ Results Published
          </p>
        )}

        {/* RESULTS TABLE */}
        {results.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Obtained</th>
                <th>Total</th>
                <th>Evaluated At</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>{r.student_name}</td>
                  <td>{r.obtained_marks}</td>
                  <td>{r.total_marks}</td>
                  <td>{new Date(r.evaluated_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
