// src/api/auth.api.js
import { API_BASE } from "../config";

/* ---------------- LOGIN ---------------- */
export const loginApi = (payload, csrfToken) => {
    return fetch(`${API_BASE}/login`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken // ✅ Secure anti-forgery layer
        },
        body: JSON.stringify(payload),
    });
};

/* ---------------- SIGNUP ---------------- */
export const signupApi = (payload, csrfToken) => {
    return fetch(`${API_BASE}/signup`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken // ✅ Secure anti-forgery layer
        },
        body: JSON.stringify(payload),
    });
};

/* ---------------- HYDRATE SESSION ---------------- */
export const meApi = () => {
    return fetch(`${API_BASE}/me`, {
        credentials: "include",
    });
};

export const resendVerificationApi = (email, csrfToken) => {
    return fetch(`${API_BASE}/verification-status?email=${encodeURIComponent(email)}`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken // ✅ Secure anti-forgery layer
        },
        body: JSON.stringify({ email }),
    });
};
export const checkVerificationStatusApi = (email) => {
    return fetch(`${API_BASE}/verification-status?email=${encodeURIComponent(email)}`, {
        method: "GET",
        credentials: "include",
    });
};