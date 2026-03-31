import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const logout = async () => {
    await fetch("http://localhost:3000/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null); // clear user
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="nav-left">
        <h2 className="logo" onClick={() => navigate("/")}>
          Quiz Platform
        </h2>
      </div>

      {/* RIGHT */}
      <div className="nav-right">
        {/* ✅ IF NOT LOGGED IN */}
        {!user && (
          <>
            <button className="login-btn" onClick={() => navigate("/login")}>
              Login
            </button>
          </>
        )}

        {/* ✅ TEACHER */}
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

        {/* ✅ STUDENT */}
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
