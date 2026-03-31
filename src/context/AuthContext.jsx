import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE } from "../config";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [csrfToken, setCsrfToken] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* HYDRATE SESSION ON APP LOAD           */

  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/me`, {
          credentials: "include",
        });

        /* ✅ EXPECTED CASE: NOT LOGGED IN */
        if (res.status === 401) {
          setUser(null);
          setCsrfToken("");
          return;
        }

        /* ❌ UNEXPECTED ERROR */
        if (!res.ok) {
          throw new Error("Unexpected auth error");
        }

        const data = await res.json();

        setUser(data.user || null);
        setCsrfToken(data.csrfToken || "");
      } catch (err) {
        console.error("Auth hydration failed:", err);
        setUser(null);
        setCsrfToken("");
      } finally {
        setLoading(false);
      }
    };

    hydrateAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        csrfToken,
        setCsrfToken,
        user,
        setUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* CUSTOM HOOK                           */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
