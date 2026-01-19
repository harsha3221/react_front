// src/App.js
import { Routes, Route } from "react-router-dom";
// import { useState } from "react";

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




  return (

    <Routes>
      <Route path="/" element={<AuthForm />} />

      {/* TEACHER */}
      <Route
        path="/teacher/dashboard"
        element={<TeacherDashboard />}
      />
      <Route
        path="/teacher/subjects/:subjectId/quizzes"
        element={<QuizList />}
      />
      <Route
        path="/teacher/subjects/:subjectId/quizzes/new"
        element={<CreateQuiz />}
      />
      <Route
        path="/teacher/quiz/:quizId/questions"
        element={<QuizQuestions />}
      />
      <Route
        path="/teacher/quiz/:quizId/results"
        element={<TeacherQuizResults />}
      />

      {/* STUDENT */}
      <Route
        path="/student/dashboard"
        element={<StudentDashboard />}
      />
      <Route
        path="/student/available-courses"
        element={<AvailableCourses />}
      />
      <Route
        path="/student/subject/:subjectId/quizzes"
        element={<StudentSubjectQuizzes />}
      />
      <Route
        path="/student/quiz/:quizId/start"
        element={<StudentStartQuiz />}
      />
      <Route
        path="/student/quiz/:quizId/submitted"
        element={<StudentSubmitted />}
      />
      <Route
        path="/student/quiz/:quizId/result"
        element={<StudentQuizResult />}
      />
    </Routes>

  );
}

export default App;
