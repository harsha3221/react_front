// src/api/teacherQuizResults.api.js
import { API_BASE } from "../config";

/* ---------------------------------- */
/* FETCH QUIZ RESULTS                  */
/* ---------------------------------- */
export const fetchQuizResultsApi = (quizId) => {
    return fetch(`${API_BASE}/teacher/quiz/${quizId}/results`, {
        credentials: "include",
    });
};

/* ---------------------------------- */
/* PUBLISH QUIZ RESULTS                */
/* ---------------------------------- */
export const publishQuizResultsApi = (quizId, csrfToken) => {
    return fetch(`${API_BASE}/teacher/quiz/${quizId}/publish-results`, {
        method: "POST",
        credentials: "include",
        headers: {
            "X-CSRF-Token": csrfToken,
        },
    });
};
