// src/api/studentQuiz.api.js
import { API_BASE } from "../config";

/* ---------------------------------- */
/* FETCH STUDENT QUIZ RESULT           */
/* ---------------------------------- */
export const fetchStudentQuizResultApi = (quizId, csrfToken) => {
    return fetch(`${API_BASE}/student/quiz/${quizId}/result`, {
        method: "GET",
        credentials: "include",
        headers: {
            "CSRF-Token": csrfToken,
        },
    });
};
