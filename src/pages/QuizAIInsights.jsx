import React, { useState } from "react";
import { useParams } from "react-router-dom"; // 1. Import useParams
import { API_BASE } from "../config";

export default function QuizAIInsights({ quizId: propQuizId }) {
  // 2. Extract quizId from URL (e.g., /teacher/quiz/:quizId/analysis)
  const { quizId: urlQuizId } = useParams();

  // Use the prop if it exists, otherwise use the URL parameter
  const quizId = propQuizId || urlQuizId;

  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateInsights = async () => {
    // 3. Safety check to prevent fetching 'undefined'
    if (!quizId) {
      setError("Quiz ID not found. Please refresh or try again.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/analytics/ai-report/${quizId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        // This handles your 404 "No data found" error gracefully
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      setInsights(data);
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setError(
        err.message ||
          "Failed to generate AI report. Check console for details.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="ai-loading-state">
        <div className="loader"></div>
        <p>🤖 AI is cross-referencing skips and wrong answers...</p>
      </div>
    );

  return (
    <div className="ai-analytics-wrapper">
      {!insights ? (
        <div className="ai-init-view">
          <button className="ai-btn-primary" onClick={generateInsights}>
            ✨ Run AI Performance Analysis
          </button>
          {error && (
            <p
              className="error-msg"
              style={{ color: "red", marginTop: "10px" }}
            >
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="ai-report-dashboard">
          <header className="report-header">
            <h3>📊 Intelligence Report</h3>
            <p className="summary-text">{insights.summary}</p>
          </header>

          <div className="insight-grid">
            <div className="card gap-card">
              <h4 style={{ color: "#f0ad4e" }}>⚠️ Concept Gaps (Confusion)</h4>
              <ul>
                {insights.topicsToImprove?.map((topic, i) => (
                  <li key={i}>{topic}</li>
                ))}
              </ul>
            </div>

            <div className="card void-card">
              <h4 style={{ color: "#d9534f" }}>
                🚫 Knowledge Voids (Unattempted)
              </h4>
              <ul>
                {insights.knowledgeVoids?.map((topic, i) => (
                  <li key={i}>{topic}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card full-width">
            <h4>🔥 Critical Questions Analysis</h4>
            <div className="question-analysis-list">
              {insights.hardQuestions?.map((item, i) => (
                <div key={i} className="analysis-item">
                  <strong>Question:</strong> {item.question}
                  <p>
                    <strong>AI Verdict:</strong> {item.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card strategy-card full-width">
            <h4>💡 Recommended Reteaching Strategy</h4>
            <p className="strategy-p">{insights.suggestions}</p>
            <button className="btn-outline" onClick={() => setInsights(null)}>
              Re-Analyze Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
