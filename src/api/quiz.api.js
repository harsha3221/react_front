// src/api/quiz.api.js
import { API_BASE } from "../config";

/* ---------------------------------- */
/* CREATE QUIZ                         */
/* ---------------------------------- */
export const createQuizApi = ({
    subjectId,
    title,
    description,
    duration,
    startTime,
    endTime,
    csrfToken,
}) => {
    return fetch(`${API_BASE}/quiz/create`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
            subject_id: subjectId,
            title,
            description,
            duration_minutes: parseInt(duration, 10),
            start_time: startTime,
            end_time: endTime,
        }),
    });
};
export const fetchQuizzesBySubjectApi = (subjectId) => {
    return fetch(`${API_BASE}/quiz/subject/${subjectId}`, {
        method: "GET",
        credentials: "include",
    });
};
export const deleteQuizApi = (quizId, csrfToken) => {
    return fetch(`${API_BASE}/quiz/${quizId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "CSRF-Token": csrfToken,
        },
    });
};