import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/login.css";
import { useAuth } from "../context/AuthContext";
import { loginApi, signupApi, meApi } from "../api/auth.api";

/* Component for a standard input/select group */
function InputField({
  label,
  type,
  value,
  onChange,
  isRequired = true,
  children,
  isSelect = false,
}) {
  return (
    <div className="input-group">
      <label>{label}</label>
      {isSelect ? (
        <select value={value} onChange={onChange} required={isRequired}>
          {children}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={isRequired}
        />
      )}
    </div>
  );
}

const initialFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "",
  department: "",
  year: "",
};

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setCsrfToken, setUser } = useAuth();

  const handleChange = (field) => (e) => {
    if (field === "role") {
      let newState = { ...formData, [field]: e.target.value };
      if (e.target.value !== "teacher") newState.department = "";
      if (e.target.value !== "student") newState.year = "";
      setFormData(newState);
    } else {
      setFormData({ ...formData, [field]: e.target.value });
    }
  };

  const handleToggle = () => {
    setError("");
    setFormData(initialFormData);
    setIsLogin(!isLogin);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        return setError("Passwords do not match.");
      }
    }

    try {
      const res = isLogin
        ? await loginApi(formData)
        : await signupApi(formData);

      const data = await res.json();

      if (!res.ok) {
        if (data.needsVerification) {
          navigate("/verify-email", { state: { email: data.email } });
          return;
        }
        throw new Error(data.message || "Authentication failed");
      }

      if (!isLogin) {
        navigate("/verify-email", { state: { email: formData.email } });
        return;
      }

      if (!data.user) {
        throw new Error("Login successful but no user data received.");
      }

      setUser(data.user);

      if (data.csrfToken) {
        setCsrfToken(data.csrfToken);
      } else {
        const meRes = await meApi();
        if (meRes.ok) {
          const meData = await meRes.json();
          setCsrfToken(meData.csrfToken);
        }
      }

      if (data.user.role === "teacher") {
        navigate("/teacher/dashboard", { replace: true });
      } else {
        navigate("/student/dashboard", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="page-container">
        <div className="form-wrapper">
          {/* Key ensures animation triggers on toggle */}
          <div className="form-content" key={isLogin ? "login" : "signup"}>
            <form onSubmit={handleSubmit}>
              <h2>{isLogin ? "Login" : "Sign Up"}</h2>

              {error && <p className="error-message">{error}</p>}

              {!isLogin && (
                <>
                  <InputField
                    label="Name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange("name")}
                  />

                  <InputField
                    label="Role"
                    value={formData.role}
                    onChange={handleChange("role")}
                    isSelect
                  >
                    <option value="">Select Role</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </InputField>

                  {formData.role === "teacher" && (
                    <InputField
                      label="Department"
                      value={formData.department}
                      onChange={handleChange("department")}
                      isSelect
                    >
                      <option value="">Select Department</option>
                      <option value="cs">Computer Science</option>
                      <option value="math">Mathematics</option>
                      <option value="phy">Physics</option>
                      <option value="chem">Chemistry</option>
                    </InputField>
                  )}

                  {formData.role === "student" && (
                    <InputField
                      label="Year"
                      value={formData.year}
                      onChange={handleChange("year")}
                      isSelect
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </InputField>
                  )}
                </>
              )}

              <InputField
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
              />

              <InputField
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange("password")}
              />

              {!isLogin && (
                <InputField
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                />
              )}

              <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>

              <p className="toggle-text">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={handleToggle}
                >
                  {isLogin ? "Sign Up" : "Login"}
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
