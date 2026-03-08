// src/api/studentQuizSubmitted.api.js
import { API_BASE } from "../config";

/* ---------------------------------- */
/* FETCH QUIZ SUMMARY (SUBMITTED)     */
/* ---------------------------------- */
export const fetchStudentQuizSummaryApi = (quizId, csrfToken) => {
    return fetch(`${API_BASE}/student/quiz/${quizId}/summary`, {
        method: "GET",
        credentials: "include",
        headers: {
            "CSRF-Token": csrfToken,
        },
    });
};
