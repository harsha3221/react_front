// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import AuthForm from "./pages/login.jsx";
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import AvailableCourses from "./pages/AvailableCourses.jsx";
import QuizList from "./pages/QuizList.jsx";
import CreateQuiz from "./pages/CreateQuiz.jsx";
import QuizQuestions from "./pages/QuizQuestions.jsx";
import StudentSubjectQuizzes from "./pages/StudentSubjectQuizzes.jsx";
import StudentStartQuiz from "./pages/StudentStartQuiz.jsx";
import StudentSubmitted from "./pages/StudentSubmitted.jsx";
import TeacherQuizResults from "./pages/TeacherQuizResults.jsx";
import StudentQuizResult from "./pages/StudentQuizResult.jsx"; // ✅ NEW

function App() {
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/csrf-token", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch((err) => console.error("CSRF token fetch error:", err));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthForm csrfToken={csrfToken} />} />

        {/* TEACHER */}
        <Route
          path="/teacher/dashboard"
          element={<TeacherDashboard csrfToken={csrfToken} />}
        />
        <Route
          path="/teacher/subjects/:subjectId/quizzes"
          element={<QuizList csrfToken={csrfToken} />}
        />
        <Route
          path="/teacher/subjects/:subjectId/quizzes/new"
          element={<CreateQuiz csrfToken={csrfToken} />}
        />
        <Route
          path="/teacher/quiz/:quizId/questions"
          element={<QuizQuestions csrfToken={csrfToken} />}
        />
        <Route
          path="/teacher/quiz/:quizId/results"
          element={<TeacherQuizResults csrfToken={csrfToken} />}
        />

        {/* STUDENT */}
        <Route
          path="/student/dashboard"
          element={<StudentDashboard csrfToken={csrfToken} />}
        />
        <Route
          path="/student/available-courses"
          element={<AvailableCourses csrfToken={csrfToken} />}
        />
        <Route
          path="/student/subject/:subjectId/quizzes"
          element={<StudentSubjectQuizzes csrfToken={csrfToken} />}
        />
        <Route
          path="/student/quiz/:quizId/start"
          element={<StudentStartQuiz csrfToken={csrfToken} />}
        />
        <Route
          path="/student/quiz/:quizId/submitted"
          element={<StudentSubmitted csrfToken={csrfToken} />}
        />
        <Route
          path="/student/quiz/:quizId/result"
          element={<StudentQuizResult csrfToken={csrfToken} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
