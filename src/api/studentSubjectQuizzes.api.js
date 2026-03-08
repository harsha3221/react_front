// src/api/studentSubjectQuizzes.api.js
import { API_BASE } from "../config";

/* ---------------------------------- */
/* FETCH SUBJECT QUIZZES               */
/* ---------------------------------- */
export const fetchStudentSubjectQuizzesApi = (
    subjectId,
    csrfToken,
) => {
    return fetch(`${API_BASE}/student/subject/${subjectId}/quizzes`, {
        method: "GET",
        credentials: "include",
        headers: {
            "CSRF-Token": csrfToken,
        },
    });
};
