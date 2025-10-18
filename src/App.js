import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './pages/login.jsx';
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
        <Route path="/" element={<Login csrfToken={csrfToken} />} />
      </Routes>
    </Router>
  );
}

export default App;
