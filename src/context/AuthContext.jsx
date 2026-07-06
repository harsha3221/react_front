import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { API_BASE } from "../config";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [csrfToken, setCsrfToken] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper routine to pull a token manually when anonymous actions happen
  const refreshAnonymousCsrf = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/csrf-token`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCsrfToken(data.csrfToken || "");
        return data.csrfToken;
      }
    } catch (err) {
      console.error("Failed to secure anonymous CSRF context token:", err);
    }
    return "";
  }, []);

  /* HYDRATE SESSION ON APP LOAD */
  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/me`, {
          credentials: "include",
        });

        if (res.status === 401) {
          setUser(null);
          // Session doesn't exist yet, grab anonymous anti-forgery token instead
          await refreshAnonymousCsrf();
          return;
        }

        if (!res.ok) {
          throw new Error("Unexpected auth error");
        }

        const data = await res.json();
        setUser(data.user || null);
        setCsrfToken(data.csrfToken || "");
      } catch (err) {
        console.error(
          "Auth hydration failed, attempting anonymous token setup:",
          err,
        );
        setUser(null);
        await refreshAnonymousCsrf();
      } finally {
        setLoading(false);
      }
    };

    hydrateAuth();
  }, [refreshAnonymousCsrf]);

  return (
    <AuthContext.Provider
      value={{
        csrfToken,
        setCsrfToken,
        user,
        setUser,
        loading,
        refreshAnonymousCsrf,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
