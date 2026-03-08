// src/api/student.api.js
import { API_BASE } from "../config";

/* ---------------------------------- */
/* FETCH AVAILABLE COURSES             */
/* ---------------------------------- */
export const fetchAvailableCoursesApi = () => {
    return fetch(`${API_BASE}/student/available-courses`, {
        method: "GET",
        credentials: "include",
    });
};

/* ---------------------------------- */
/* JOIN COURSE                         */
/* ---------------------------------- */
export const joinCourseApi = (subjectId, csrfToken) => {
    return fetch(`${API_BASE}/student/join-course`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ subjectId }),
    });
};
export const fetchStudentDashboardApi = () => {
    return fetch(`${API_BASE}/student/dashboard`, {
        method: "GET",
        credentials: "include",
    });
};