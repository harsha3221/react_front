// src/api/teacherDashboard.api.js
import { API_BASE } from "../config";

/* ---------------------------------- */
/* FETCH TEACHER DASHBOARD            */
/* ---------------------------------- */
export const fetchTeacherDashboardApi = () => {
    return fetch(`${API_BASE}/teacher/dashboard`, {
        credentials: "include",
    });
};

/* ---------------------------------- */
/* CREATE SUBJECT                     */
/* ---------------------------------- */
export const createSubjectApi = (formData, csrfToken) => {
    return fetch(`${API_BASE}/teacher/create-subject`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(formData),
    });
};