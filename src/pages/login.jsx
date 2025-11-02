import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/login.css';

// Component for a standard input/select group
function InputField({ label, type, value, onChange, isRequired = true, children, isSelect = false }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      {isSelect ? (
        <select value={value} onChange={onChange} required={isRequired}>
          {children}
        </select>
      ) : (
        <input type={type} value={value} onChange={onChange} required={isRequired} />
      )}
    </div>
  );
}

// Initial state for the form data (used for clearing)
const initialFormData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  department: '',
  year: ''
};

export default function AuthForm({ csrfToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // ✅ for redirecting after login

  // Handler for all standard text/email/password inputs
  const handleChange = (field) => (e) => {
    if (field === 'role') {
      let newState = { ...formData, [field]: e.target.value };
      if (e.target.value !== 'teacher') newState.department = '';
      if (e.target.value !== 'student') newState.year = '';
      setFormData(newState);
    } else {
      setFormData({ ...formData, [field]: e.target.value });
    }
  };

  const handleToggle = () => {
    setError('');
    setFormData(initialFormData);
    setIsLogin(!isLogin);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Submitting form data:', formData);

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        return setError('Passwords do not match.');
      }
      if (formData.role === 'teacher' && !formData.department) {
        return setError('Please select a department.');
      }
      if (formData.role === 'student' && !formData.year) {
        return setError('Please select a year.');
      }
    }

    const url = isLogin
      ? 'http://localhost:3000/login'
      : 'http://localhost:3000/signup';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.message || 'Network request failed.');
      }

      console.log('Success ✔️✔️');

      if (!isLogin) {
        setError('Registration successful! Please log in.');
        setTimeout(() => handleToggle(), 1500);
      } else {
        // ✅ Redirect using navigate based on role
        if (data.role === 'teacher') {
          navigate('/teacher/dashboard');
        } else if (data.role === 'student') {
          navigate('/student/dashboard');
        }
      }
    } catch (err) {
      console.error('Error submitting form:', err.message);
      setError(err.message);
    }
  };

  let extraFields = 0;
  if (!isLogin) {
    if (formData.role === 'teacher') extraFields = 1;
    else if (formData.role === 'student') extraFields = 1;
  }

  const formHeight = isLogin
    ? '350px'
    : `${580 + extraFields * 50}px`;

  return (
    <div className="page-container">
      <div className="form-wrapper" style={{ height: formHeight }}>
        <div className="form-content" key={isLogin ? 'login' : 'signup'}>
          <form onSubmit={handleSubmit}>
            <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
            {error && <p className="error-message">{error}</p>}

            {!isLogin && (
              <>
                <InputField label="Name" type="text" value={formData.name} onChange={handleChange('name')} />

                <InputField label="Role" value={formData.role} onChange={handleChange('role')} isSelect>
                  <option value="">Select Role</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </InputField>

                {formData.role === 'teacher' && (
                  <InputField
                    label="Department"
                    value={formData.department}
                    onChange={handleChange('department')}
                    isSelect
                  >
                    <option value="">Select Department</option>
                    <option value="cs">Computer Science</option>
                    <option value="math">Mathematics</option>
                    <option value="phy">Physics</option>
                    <option value="chem">Chemistry</option>
                  </InputField>
                )}

                {formData.role === 'student' && (
                  <InputField
                    label="Year"
                    value={formData.year}
                    onChange={handleChange('year')}
                    isSelect
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </InputField>
                )}

                <InputField
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange('password')}
                />
                <InputField
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                />
              </>
            )}

            <InputField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
            />

            {isLogin && (
              <InputField
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange('password')}
              />
            )}

            <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>

            <p className="toggle-text">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button type="button" className="toggle-btn" onClick={handleToggle}>
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
