import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [csrfToken, setCsrfToken] = useState("");

  return (
    <AuthContext.Provider value={{ csrfToken, setCsrfToken }}>
      {children}
    </AuthContext.Provider>
  );
}

/* Custom hook (recommended way to consume context) */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
