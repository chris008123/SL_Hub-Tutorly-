import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const QUESTION_TYPE_ICONS = {
  "Bug Fix": "🐛", "Concept": "💡", "Best Practice": "⭐",
  "Project Help": "🚀", "Interview Prep": "🎯",
};

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("questions");
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  const isOwn = currentUser?.id === parseInt(id);

  useEffect(() => { fetchProfile(); }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/api/users/${id}`);
      setProfile(res.data.user);
      setQuestions(res.data.questions);
      setAnswers(res.data.answers);
      setBio(res.data.user.bio || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBio = async () => {
    setSaving(true);
    try {
      await axios.patch(`/api/users/${id}/bio`, { bio });
      setProfile(prev => ({ ...prev, bio }));
      setEditing(false);
    } catch (err) {
      alert("Failed to save bio");
    } finally {
      setSaving(false);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getRepLevel = (rep) => {
    if (rep >= 500) return { label: "Expert", color: "#6366F1", icon: "🏆" };
    if (rep >= 200) return { label: "Advanced", color: "#F59E0B", icon: "⭐" };
    if (rep >= 50) return { label: "Helper", color: "#10B981", icon: "🌱" };
    return { label: "Newcomer", color: "#94A3B8", icon: "👋" };
  };

  if (loading) return (
    <div className="profile-loading">
      <div className="loading-spinner" />
    </div>
  );

  if (!profile) return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <h2>User not found</h2>
      <Link to="/" style={{ color: "var(--accent)" }}>Go home</Link>
    </div>
  );

  const repLevel = getRepLevel(profile.reputation);
  const acceptedAnswers = answers.filter(a => a.is_accepted).length;

  return (
    <div className="profile-page">
      <div className="profile-inner">

        {/* Profile card */}
        <div className="profile-card card fade-in">
          <div className="profile-banner" />
          <div className="profile-main">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                {profile.name?.charAt(0).toUpperCase()}
              </div>
              <span className="profile-role-badge">{profile.role}</span>
            </div>

            <div className="profile-info">
              <div className="profile-name-row">
                <h1 className="profile-name">{profile.name}</h1>
                <span className="rep-badge" style={{ background: `${repLevel.color}15`, color: repLevel.color }}>
                  {repLevel.icon} {repLevel.label}
                </span>
              </div>

              {editing ? (
                <div className="bio-edit">
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Tell the community about yourself... your skills, interests, years of experience"
                    className="form-input bio-textarea"
                    rows={3}
                    maxLength={300}
                  />
                  <div className="bio-edit-actions">
                    <span className="bio-chars">{bio.length}/300</span>
                    <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveBio} disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-bio-row">
                  <p className="profile-bio">
                    {profile.bio || (isOwn ? "No bio yet. Tell the community about yourself!" : "No bio yet.")}
                  </p>
                  {isOwn && (
                    <button className="btn-edit-bio" onClick={() => setEditing(true)}>
                      ✏️ {profile.bio ? "Edit" : "Add bio"}
                    </button>
                  )}
                </div>
              )}

              {profile.subjects?.length > 0 && (
                <div className="profile-subjects">
                  {profile.subjects.map(s => (
                    <span key={s} className="profile-subject-tag">{s}</span>
                  ))}
                </div>
              )}

              <p className="profile-joined">Joined {timeAgo(profile.created_at)}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="pstat-num">{profile.reputation}</span>
              <span className="pstat-label">Reputation</span>
            </div>
            <div className="pstat-divider" />
            <div className="profile-stat">
              <span className="pstat-num">{questions.length}</span>
              <span className="pstat-label">Questions</span>
            </div>
            <div className="pstat-divider" />
            <div className="profile-stat">
              <span className="pstat-num">{answers.length}</span>
              <span className="pstat-label">Answers</span>
            </div>
            <div className="pstat-divider" />
            <div className="profile-stat">
              <span className="pstat-num" style={{ color: "#10B981" }}>{acceptedAnswers}</span>
              <span className="pstat-label">Accepted</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === "questions" ? "active" : ""}`}
            onClick={() => setActiveTab("questions")}
          >
            Questions <span className="tab-count">{questions.length}</span>
          </button>
          <button
            className={`profile-tab ${activeTab === "answers" ? "active" : ""}`}
            onClick={() => setActiveTab("answers")}
          >
            Answers <span className="tab-count">{answers.length}</span>
          </button>
        </div>

        {/* Questions tab */}
        {activeTab === "questions" && (
          <div className="profile-list fade-in">
            {questions.length === 0 ? (
              <div className="profile-empty card">
                <span>📭</span>
                <p>{isOwn ? "You haven't asked any questions yet." : "No questions yet."}</p>
                {isOwn && <Link to="/ask" className="btn btn-primary" style={{ marginTop: 12 }}>Ask your first question</Link>}
              </div>
            ) : questions.map(q => (
              <Link to={`/questions/${q.id}`} key={q.id} className="profile-item card">
                <div className="pitem-top">
                  {q.subject_name && (
                    <span className="pitem-subject" style={{ background: `${q.subject_color}15`, color: q.subject_color }}>
                      {q.subject_icon} {q.subject_name}
                    </span>
                  )}
                  {q.question_type && (
                    <span className="pitem-type">{QUESTION_TYPE_ICONS[q.question_type]} {q.question_type}</span>
                  )}
                  <span className={`badge badge-${q.status}`}>{q.status === "open" ? "Open" : "Answered"}</span>
                </div>
                <h3 className="pitem-title">{q.title}</h3>
                <div className="pitem-meta">
                  <span>💬 {q.answer_count} answers</span>
                  <span>👁 {q.views} views</span>
                  <span>{timeAgo(q.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Answers tab */}
        {activeTab === "answers" && (
          <div className="profile-list fade-in">
            {answers.length === 0 ? (
              <div className="profile-empty card">
                <span>💬</span>
                <p>{isOwn ? "You haven't answered any questions yet." : "No answers yet."}</p>
                {isOwn && <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>Browse questions</Link>}
              </div>
            ) : answers.map(a => (
              <Link to={`/questions/${a.question_id}`} key={a.id} className="profile-item card">
                {a.is_accepted && <div className="pitem-accepted">✅ Accepted Answer</div>}
                <p className="pitem-answer-body">{a.body.slice(0, 150)}{a.body.length > 150 ? "..." : ""}</p>
                <div className="pitem-meta">
                  <span>On: <strong>{a.question_title}</strong></span>
                  <span>{timeAgo(a.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
