import React, { useState } from 'react';
import '../css/login.css';

function InputField({ label, type, value, onChange }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input type={type} value={value} onChange={onChange} required />
    </div>
  );
}

export default function AuthForm({ csrfToken }) {  // ✅ receive csrfToken prop
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const url = isLogin
      ? "http://localhost:3000/login"
      : "http://localhost:3000/signup";

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken   // ✅ attach token here
      },
      body: JSON.stringify(formData),
      credentials: "include"
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Something went wrong");
        }
        console.log("Success ✔️✔️");
      })
      .catch(err => {
        console.error("Error submitting form:", err.message);
        setError(err.message);
      });
  };

  return (
    <div className="page-container">
      <div className="form-wrapper" style={{ height: isLogin ? '350px' : '550px' }}>
        <div className="form-content" key={isLogin ? 'login' : 'signup'}>
          <form onSubmit={handleSubmit}>
            <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
            {error && <p className="error-message">{error}</p>}

            {!isLogin && (
              <>
                <InputField label="Name" type="text" value={formData.name} onChange={handleChange('name')} />
                <InputField label="Password" type="password" value={formData.password} onChange={handleChange('password')} />
                <InputField label="Confirm Password" type="password" value={formData.confirmPassword} onChange={handleChange('confirmPassword')} />
              </>
            )}

            <InputField label="Email" type="email" value={formData.email} onChange={handleChange('email')} />
            {isLogin && <InputField label="Password" type="password" value={formData.password} onChange={handleChange('password')} />}

            <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>

            <p className="toggle-text">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button type="button" className="toggle-btn" onClick={() => { setError(''); setIsLogin(!isLogin); }}>
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
