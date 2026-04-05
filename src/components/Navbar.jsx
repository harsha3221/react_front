import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./navbar.css";
import { API_BASE } from "../config";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const linkClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h1 className="logo" onClick={() => navigate("/")}>
          QuizFlow
        </h1>
      </div>

      <div className="nav-right">
        {/* IF NOT LOGGED IN */}
        {!user && (
          <button
            className="btn btn-primary"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}

        {/* TEACHER LINKS */}
        {user?.role === "teacher" && (
          <>
            <NavLink to="/teacher/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </>
        )}

        {/* STUDENT LINKS */}
        {user?.role === "student" && (
          <>
            <NavLink to="/student/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/student/available-courses" className={linkClass}>
              Courses
            </NavLink>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
