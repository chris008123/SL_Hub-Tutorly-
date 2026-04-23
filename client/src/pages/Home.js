import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const QUESTION_TYPES = ["Bug Fix", "Concept", "Best Practice", "Project Help", "Interview Prep"];

const QUESTION_TYPE_ICONS = {
  "Bug Fix": "🐛",
  "Concept": "💡",
  "Best Practice": "⭐",
  "Project Help": "🚀",
  "Interview Prep": "🎯",
};

const LEVEL_COLORS = {
  Beginner: { bg: "#dcfce7", color: "#16a34a" },
  Intermediate: { bg: "#fef9c3", color: "#ca8a04" },
  Advanced: { bg: "#fee2e2", color: "#dc2626" },
};

const Home = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: "", experience_level: "", question_type: "", status: ""
  });
  const [search, setSearch] = useState("");

  useEffect(() => { fetchSubjects(); }, []);
  useEffect(() => { fetchQuestions(); }, [filters]);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get("/api/questions/subjects/all");
      setSubjects(res.data.subjects);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      if (search) params.search = search;
      const res = await axios.get("/api/questions", { params });
      setQuestions(res.data.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? "" : value }));
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">👨‍💻 Built for programmers</div>
          <h1>Stuck on code?<br />Get unstuck fast.</h1>
          <p>Tutorly connects developers of all levels with volunteer tutors. Ask anything — bugs, concepts, best practices, interview prep. Always free.</p>
          <div className="hero-actions">
            {user ? (
              <Link to="/ask" className="btn btn-primary hero-cta">Ask a question →</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary hero-cta">Get started free →</Link>
                <Link to="/login" className="btn btn-outline hero-cta">Log in</Link>
              </>
            )}
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">{questions.length}+</span>
              <span className="stat-label">Questions asked</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">{subjects.length}</span>
              <span className="stat-label">Topics covered</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">Free</span>
              <span className="stat-label">Always</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="content-wrap">
        {/* Sidebar */}
        <aside className="sidebar">
          {/* Topics */}
          <div className="filter-section card">
            <h3 className="filter-title">Topic</h3>
            <div className="filter-list">
              <button
                className={`filter-item ${!filters.subject ? "active" : ""}`}
                onClick={() => setFilter("subject", "")}
              >All topics</button>
              {subjects.map(s => (
                <button
                  key={s.id}
                  className={`filter-item ${filters.subject === s.name ? "active" : ""}`}
                  onClick={() => setFilter("subject", s.name)}
                >
                  <span>{s.icon}</span> {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div className="filter-section card" style={{ marginTop: 12 }}>
            <h3 className="filter-title">Experience Level</h3>
            <div className="filter-list">
              <button
                className={`filter-item ${!filters.experience_level ? "active" : ""}`}
                onClick={() => setFilter("experience_level", "")}
              >All levels</button>
              {EXPERIENCE_LEVELS.map(l => (
                <button
                  key={l}
                  className={`filter-item ${filters.experience_level === l ? "active" : ""}`}
                  onClick={() => setFilter("experience_level", l)}
                >
                  {l === "Beginner" ? "🟢" : l === "Intermediate" ? "🟡" : "🔴"} {l}
                </button>
              ))}
            </div>
          </div>

          {/* Question Type */}
          <div className="filter-section card" style={{ marginTop: 12 }}>
            <h3 className="filter-title">Question Type</h3>
            <div className="filter-list">
              <button
                className={`filter-item ${!filters.question_type ? "active" : ""}`}
                onClick={() => setFilter("question_type", "")}
              >All types</button>
              {QUESTION_TYPES.map(t => (
                <button
                  key={t}
                  className={`filter-item ${filters.question_type === t ? "active" : ""}`}
                  onClick={() => setFilter("question_type", t)}
                >
                  {QUESTION_TYPE_ICONS[t]} {t}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="filter-section card" style={{ marginTop: 12 }}>
            <h3 className="filter-title">Status</h3>
            <div className="filter-list">
              <button className={`filter-item ${!filters.status ? "active" : ""}`} onClick={() => setFilter("status", "")}>All</button>
              <button className={`filter-item ${filters.status === "open" ? "active" : ""}`} onClick={() => setFilter("status", "open")}>🟢 Open</button>
              <button className={`filter-item ${filters.status === "answered" ? "active" : ""}`} onClick={() => setFilter("status", "answered")}>✅ Answered</button>
            </div>
          </div>
        </aside>

        {/* Feed */}
        <main className="feed">
          <div className="feed-header">
            <form onSubmit={handleSearch} className="search-bar">
              <input
                className="form-input search-input"
                placeholder="Search questions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-primary search-btn">Search</button>
            </form>
            {user && (
              <Link to="/ask" className="btn btn-primary ask-btn">+ Ask Question</Link>
            )}
          </div>

          {/* Active filters display */}
          {Object.values(filters).some(Boolean) && (
            <div className="active-filters">
              {Object.entries(filters).map(([key, value]) =>
                value ? (
                  <span key={key} className="active-filter-tag">
                    {value}
                    <button onClick={() => setFilter(key, value)}>×</button>
                  </span>
                ) : null
              )}
              <button className="clear-filters" onClick={() => setFilters({ subject: "", experience_level: "", question_type: "", status: "" })}>
                Clear all
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading-grid">
              {[1,2,3].map(i => <div key={i} className="question-skeleton card" />)}
            </div>
          ) : questions.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-icon">🔍</div>
              <h3>No questions found</h3>
              <p>Try a different filter or be the first to ask!</p>
              {user && (
                <Link to="/ask" className="btn btn-primary" style={{ marginTop: 16 }}>
                  Ask the first question
                </Link>
              )}
            </div>
          ) : (
            <div className="question-list">
              {questions.map((q, i) => (
                <Link
                  to={`/questions/${q.id}`}
                  key={q.id}
                  className="question-card card fade-in"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className="qcard-top">
                    <div className="qcard-meta">
                      {q.subject_name && (
                        <span className="qcard-subject" style={{ background: `${q.subject_color}18`, color: q.subject_color }}>
                          {q.subject_icon} {q.subject_name}
                        </span>
                      )}
                      {q.experience_level && (
                        <span className="qcard-level" style={{
                          background: LEVEL_COLORS[q.experience_level]?.bg,
                          color: LEVEL_COLORS[q.experience_level]?.color
                        }}>
                          {q.experience_level}
                        </span>
                      )}
                      {q.question_type && (
                        <span className="qcard-type">
                          {QUESTION_TYPE_ICONS[q.question_type]} {q.question_type}
                        </span>
                      )}
                    </div>
                    <span className={`badge badge-${q.status}`}>
                      {q.status === "open" ? "Open" : "Answered"}
                    </span>
                  </div>

                  <h3 className="qcard-title">{q.title}</h3>
                  <p className="qcard-body">{q.body}</p>

                  <div className="qcard-footer">
                    <div className="qcard-author">
                      <div className="mini-avatar">{q.author_name?.charAt(0).toUpperCase()}</div>
                      <span>{q.author_name}</span>
                    </div>
                    <div className="qcard-stats">
                      <span>💬 {q.answer_count}</span>
                      <span>👁 {q.views}</span>
                      <span>{timeAgo(q.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
