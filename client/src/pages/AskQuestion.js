import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./AskQuestion.css";

const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const QUESTION_TYPES = [
  { value: "Bug Fix", icon: "🐛", desc: "Something isn't working" },
  { value: "Concept", icon: "💡", desc: "I don't understand how this works" },
  { value: "Best Practice", icon: "⭐", desc: "What's the right way to do this?" },
  { value: "Project Help", icon: "🚀", desc: "I need guidance on my project" },
  { value: "Interview Prep", icon: "🎯", desc: "DSA, coding challenges, interviews" },
];

const AskQuestion = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    title: "", body: "", subject_id: "", experience_level: "", question_type: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = details, 2 = content

  useEffect(() => {
    axios.get("/api/questions/subjects/all").then(res => setSubjects(res.data.subjects));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleNext = () => {
    if (!form.subject_id || !form.experience_level || !form.question_type) {
      return setError("Please fill in all fields to continue");
    }
    setStep(2);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Please add a title for your question");
    if (!form.body.trim()) return setError("Please describe your question");
    if (form.body.trim().length < 20) return setError("Please describe your question in more detail");

    setLoading(true);
    try {
      const res = await axios.post("/api/questions", form);
      navigate(`/questions/${res.data.question.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post question. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedSubject = subjects.find(s => s.id === parseInt(form.subject_id));

  return (
    <div className="ask-page">
      <div className="ask-inner">
        {/* Header */}
        <div className="ask-header">
          <div className="ask-header-text">
            <h1>Ask a question</h1>
            <p>Get help from the community. Be specific and clear.</p>
          </div>
          <div className="ask-steps">
            <div className={`ask-step ${step >= 1 ? "active" : ""}`}>
              <span>1</span> Details
            </div>
            <div className="ask-step-line" />
            <div className={`ask-step ${step >= 2 ? "active" : ""}`}>
              <span>2</span> Question
            </div>
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {step === 1 && (
          <div className="ask-card card fade-in">
            <h2 className="ask-card-title">What is your question about?</h2>

            {/* Subject */}
            <div className="form-group">
              <label className="form-label">Topic / Language</label>
              <div className="subject-grid">
                {subjects.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className={`subject-card ${form.subject_id === String(s.id) ? "active" : ""}`}
                    style={form.subject_id === String(s.id) ? { borderColor: s.color, background: `${s.color}12` } : {}}
                    onClick={() => { setForm({ ...form, subject_id: String(s.id) }); setError(""); }}
                  >
                    <span className="subject-card-icon">{s.icon}</span>
                    <span className="subject-card-name">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="form-group">
              <label className="form-label">Your experience level</label>
              <div className="level-selector">
                {EXPERIENCE_LEVELS.map(l => (
                  <button
                    key={l}
                    type="button"
                    className={`level-btn ${form.experience_level === l ? "active" : ""}`}
                    onClick={() => { setForm({ ...form, experience_level: l }); setError(""); }}
                  >
                    <span className="level-dot" data-level={l} />
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Type */}
            <div className="form-group">
              <label className="form-label">Type of question</label>
              <div className="qtype-grid">
                {QUESTION_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    className={`qtype-card ${form.question_type === t.value ? "active" : ""}`}
                    onClick={() => { setForm({ ...form, question_type: t.value }); setError(""); }}
                  >
                    <span className="qtype-icon">{t.icon}</span>
                    <span className="qtype-name">{t.value}</span>
                    <span className="qtype-desc">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary ask-next-btn" onClick={handleNext}>
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="fade-in">
            {/* Preview tags */}
            {selectedSubject && (
              <div className="ask-preview-tags">
                <span className="ask-tag" style={{ background: `${selectedSubject.color}15`, color: selectedSubject.color }}>
                  {selectedSubject.icon} {selectedSubject.name}
                </span>
                <span className="ask-tag">{form.experience_level}</span>
                <span className="ask-tag">
                  {QUESTION_TYPES.find(t => t.value === form.question_type)?.icon} {form.question_type}
                </span>
                <button type="button" className="ask-back-btn" onClick={() => setStep(1)}>
                  ← Change
                </button>
              </div>
            )}

            <div className="ask-card card">
              <h2 className="ask-card-title">Write your question</h2>

              <div className="form-group">
                <label className="form-label">Title <span className="form-hint">Be specific and clear</span></label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder={
                    form.question_type === "Bug Fix"
                      ? "e.g. Why does my Python loop skip the first element?"
                      : form.question_type === "Concept"
                      ? "e.g. How does async/await work in JavaScript?"
                      : "e.g. What's the best way to structure a React project?"
                  }
                  className="form-input ask-title-input"
                  maxLength={200}
                />
                <span className="char-count">{form.title.length}/200</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Description
                  <span className="form-hint">Include your code, error messages, and what you've tried</span>
                </label>
                <textarea
                  name="body"
                  value={form.body}
                  onChange={handleChange}
                  placeholder={`Describe your question in detail...\n\nFor bug fixes, paste your code and the error message.\nFor concepts, explain what you understand so far.\nFor project help, describe what you're building.`}
                  className="form-input ask-body-input"
                  rows={12}
                />
              </div>

              <div className="ask-tips card">
                <h4>💡 Tips for a great question</h4>
                <ul>
                  <li>Include the exact error message if there is one</li>
                  <li>Paste the relevant code snippet</li>
                  <li>Mention what you've already tried</li>
                  <li>Keep it focused on one specific problem</li>
                </ul>
              </div>

              <div className="ask-actions">
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Posting..." : "Post Question 🚀"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AskQuestion;
