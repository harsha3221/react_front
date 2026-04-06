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
  /* PUBLISH RESULTS                                    */
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
  /* PROCTORING HELPER                                  */
  /* -------------------------------------------------- */
  const renderProctoringStatus = (cheatingCount) => {
    if (!cheatingCount || cheatingCount === 0) {
      return (
        <span style={{ color: "#2ecc71", fontWeight: "600" }}>✅ Clear</span>
      );
    }
    return (
      <span
        title="Student flagged for tab switching or leaving the screen"
        style={{
          backgroundColor: "#fff3cd",
          color: "#856404",
          padding: "2px 8px",
          borderRadius: "4px",
          fontSize: "0.85rem",
          fontWeight: "bold",
          border: "1px solid #ffeeba",
        }}
      >
        ⚠️ {cheatingCount} Flags
      </span>
    );
  };

  /* -------------------------------------------------- */
  /* LOADING & ERROR STATES                             */
  /* -------------------------------------------------- */
  if (loading) {
    return (
      <>
        <Navbar role="teacher" />
        <div className="results-page">
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <p>Loading results...</p>
          </div>
        </div>
      </>
    );
  }

  // This uses the 'error' variable, fixing the ESLint warning
  if (error) {
    return (
      <>
        <Navbar role="teacher" />
        <div className="results-page">
          <div
            style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "15px",
              borderRadius: "5px",
              margin: "20px auto",
              maxWidth: "600px",
              textAlign: "center",
            }}
          >
            <strong>Error:</strong> {error}
            <br />
            <button
              onClick={loadResults}
              style={{ marginTop: "10px", cursor: "pointer" }}
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  /* -------------------------------------------------- */
  /* MAIN RENDER                                        */
  /* -------------------------------------------------- */
  return (
    <>
      <Navbar role="teacher" />

      <div
        className="results-page"
        style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2>Quiz Results</h2>
          <button
            onClick={loadResults}
            style={{ cursor: "pointer", padding: "5px 10px" }}
          >
            🔄 Refresh
          </button>
        </header>

        {/* PUBLISH BUTTON */}
        {!published ? (
          <button
            className="btn-publish"
            onClick={publishResults}
            disabled={publishing}
            style={{
              marginBottom: "20px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            {publishing ? "Publishing..." : "📢 Publish Results to Students"}
          </button>
        ) : (
          <p
            style={{ color: "green", fontWeight: "bold", marginBottom: "20px" }}
          >
            ✅ Results Published to Students
          </p>
        )}

        {/* RESULTS TABLE */}
        {results.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                <th style={{ padding: "12px", borderBottom: "2px solid #ddd" }}>
                  Student
                </th>
                <th style={{ padding: "12px", borderBottom: "2px solid #ddd" }}>
                  Score
                </th>
                <th style={{ padding: "12px", borderBottom: "2px solid #ddd" }}>
                  Proctoring Status
                </th>
                <th style={{ padding: "12px", borderBottom: "2px solid #ddd" }}>
                  Evaluated At
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>
                    <strong>{r.student_name}</strong>
                  </td>
                  <td style={{ padding: "12px" }}>
                    {r.obtained_marks} / {r.total_marks}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {renderProctoringStatus(r.cheating_count)}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      fontSize: "0.9rem",
                      color: "#666",
                    }}
                  >
                    {new Date(r.evaluated_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
