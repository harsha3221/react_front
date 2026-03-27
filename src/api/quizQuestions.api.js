
import { API_BASE } from "../config";

/* ---------------------------------- */
/* FETCH QUESTIONS                    */
/* ---------------------------------- */
export const fetchQuizQuestionsApi = (quizId) => {
    return fetch(`${API_BASE}/quiz/${quizId}/questions`, {
        method: "GET",
        credentials: "include",
    });
};

/* ---------------------------------- */
/* CREATE QUESTION                    */
/* ---------------------------------- */
export const createQuestionApi = (quizId, data, csrfToken) => {
    return fetch(`${API_BASE}/quiz/${quizId}/questions`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json", // Use JSON now
            "CSRF-Token": csrfToken,
        },
        body: JSON.stringify(data),
    });
};

export const updateQuestionApi = (quizId, questionId, data, csrfToken) => {
    return fetch(`${API_BASE}/quiz/${quizId}/questions/${questionId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "CSRF-Token": csrfToken,
        },
        body: JSON.stringify(data),
    });
};

export const deleteQuestionApi = (quizId, questionId, csrfToken) => {
    return fetch(`${API_BASE}/quiz/${quizId}/questions/${questionId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "CSRF-Token": csrfToken,
        },
    });
};