// src/api/studentQuizStart.api.js
import { API_BASE } from "../config";

/* ---------------------------------- */
/* START / LOAD QUIZ                  */
/* ---------------------------------- */
export const startStudentQuizApi = (quizId, csrfToken) => {
    return fetch(`${API_BASE}/student/quiz/${quizId}/start`, {
        method: "GET",
        credentials: "include",
        headers: {
            "CSRF-Token": csrfToken,
        },
    });
};

/* ---------------------------------- */
/* SAVE ANSWER                        */
/* ---------------------------------- */
export const saveStudentAnswerApi = (
    quizId,
    questionId,
    optionIds,
    csrfToken,
) => {
    return fetch(`${API_BASE}/student/quiz/${quizId}/answer`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
            question_id: questionId,
            option_ids: optionIds,
        }),
    });
};

/* ---------------------------------- */
/* SUBMIT QUIZ                        */
/* ---------------------------------- */
export const submitStudentQuizApi = (quizId, csrfToken) => {
    return fetch(`${API_BASE}/student/quiz/${quizId}/submit`, {
        method: "POST",
        credentials: "include",
        headers: {
            "CSRF-Token": csrfToken,
        },
    });
};
export const reportCheatingApi = (quizId, type, csrf) => {
    return fetch("/api/report-cheating", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "CSRF-Token": csrf,
        },
        body: JSON.stringify({
            quizId,
            event_type: type,
        }),
    });
};
