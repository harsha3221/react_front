import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./navbar.css";

export default function Navbar({ role }) {
  const navigate = useNavigate();

  const logout = async () => {
    await fetch("http://localhost:3000/logout", {
      method: "POST",
      credentials: "include",
    });
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h2 className="logo">Quiz Platform</h2>
      </div>

      <div className="nav-right">
        {role === "teacher" && (
          <>
            <NavLink to="/teacher/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          </>
        )}

        {role === "student" && (
          <>
            <NavLink to="/student/dashboard" className={linkClass}>
              Dashboard
            </NavLink>

            <NavLink to="/student/available-courses" className={linkClass}>
              Courses
            </NavLink>
          </>
        )}

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
