import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Generic protected route
 * @param {ReactNode} children - page component
 * @param {string} role - required role ("teacher" | "student")
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  /* ⛔ Wait for hydration */
  if (loading) {
    return <div>Loading...</div>;
  }

  /* ⛔ Not logged in */
  if (!user) {
    return <Navigate to="/" replace />;
  }

  /* ⛔ Wrong role */
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  /* ✅ Allowed */
  return children;
}
