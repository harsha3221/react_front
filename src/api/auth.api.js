// src/api/auth.api.js
import { API_BASE } from "../config";

/* ---------------- LOGIN ---------------- */
export const loginApi = (payload) => {
    return fetch(`${API_BASE}/login`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
};

/* ---------------- SIGNUP ---------------- */
export const signupApi = (payload) => {
    return fetch(`${API_BASE}/signup`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
};

/* ---------------- HYDRATE SESSION ---------------- */
export const meApi = async () => {
    // 1. Get CSRF token
    const csrfRes = await fetch(`${API_BASE}/csrf-token`, {
        credentials: "include",
    });

    const { csrfToken } = await csrfRes.json();

    // 2. Call /me with token
    return fetch(`${API_BASE}/me`, {
        credentials: "include",
        headers: {
            "CSRF-Token": csrfToken,
        },
    });
};
export const resendVerificationApi = (email) => {
    return fetch(`${API_BASE}/resend-verification`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    });
};