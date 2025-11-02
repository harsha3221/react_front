import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthForm from './pages/login.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import AvailableCourses from './pages/AvailableCourses.jsx';
import { useState, useEffect } from 'react';

function App() {
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/csrf-token', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken))
      .catch(err => console.error("CSRF token fetch error:", err));
  }, []);

  return (
    <Router>
      <Routes>
        {/* ✅ Pass csrfToken as a prop */}
        <Route path="/" element={<AuthForm csrfToken={csrfToken} />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard csrfToken={csrfToken} />} />
        <Route path="/student/dashboard" element={<StudentDashboard csrfToken={csrfToken} />} />
        <Route path="/student/available-courses" element={<AvailableCourses csrfToken={csrfToken} />} />

      </Routes>
    </Router>
  );
}

export default App;
