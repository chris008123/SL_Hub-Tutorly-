import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const SUBJECTS = [
  "Python", "JavaScript", "C++", "Java", "React",
  "HTML & CSS", "SQL & Databases", "Git & GitHub",
  "Data Structures & Algorithms", "General Programming"
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "student", subjects: []
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const toggleSubject = (subject) => {
    setForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      return setError("Please fill in all required fields");
    }
    if (form.role === "tutor" && form.subjects.length === 0) {
      return setError("Please select at least one subject you can teach");
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role, form.subjects);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card fade-in">
        <div className="auth-header">
          <div className="auth-logo">🎓</div>
          <h1>Join Tutorly</h1>
          <p>Free tutoring for every student</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Kwame Mensah"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">I am a...</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${form.role === "student" ? "active" : ""}`}
                onClick={() => setForm({ ...form, role: "student" })}
              >
                <span className="role-icon">📚</span>
                <span className="role-name">Student</span>
                <span className="role-desc">I need help</span>
              </button>
              <button
                type="button"
                className={`role-btn ${form.role === "tutor" ? "active" : ""}`}
                onClick={() => setForm({ ...form, role: "tutor" })}
              >
                <span className="role-icon">✏️</span>
                <span className="role-name">Tutor</span>
                <span className="role-desc">I can help</span>
              </button>
            </div>
          </div>

          {form.role === "tutor" && (
            <div className="form-group">
              <label className="form-label">Subjects I can teach</label>
              <div className="subjects-grid">
                {SUBJECTS.map(subject => (
                  <button
                    key={subject}
                    type="button"
                    className={`subject-chip ${form.subjects.includes(subject) ? "active" : ""}`}
                    onClick={() => toggleSubject(subject)}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
