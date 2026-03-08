// src/api/quizQuestions.api.js
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
export const createQuestionApi = (quizId, formData, csrfToken) => {
    return fetch(`${API_BASE}/quiz/${quizId}/questions`, {
        method: "POST",
        credentials: "include",
        headers: {
            "CSRF-Token": csrfToken,
        },
        body: formData,
    });
};

/* ---------------------------------- */
/* UPDATE QUESTION                    */
/* ---------------------------------- */
export const updateQuestionApi = (
    quizId,
    questionId,
    formData,
    csrfToken,
) => {
    return fetch(`${API_BASE}/quiz/${quizId}/questions/${questionId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "CSRF-Token": csrfToken,
        },
        body: formData,
    });
};

/* ---------------------------------- */
/* DELETE QUESTION                    */
/* ---------------------------------- */
export const deleteQuestionApi = (quizId, questionId, csrfToken) => {
    return fetch(`${API_BASE}/quiz/${quizId}/questions/${questionId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "CSRF-Token": csrfToken,
        },
    });
};
