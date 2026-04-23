import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import CodeBlock from "../components/CodeBlock";
import "./QuestionDetail.css";

const QUESTION_TYPE_ICONS = {
  "Bug Fix": "🐛", "Concept": "💡", "Best Practice": "⭐",
  "Project Help": "🚀", "Interview Prep": "🎯",
};

const LEVEL_COLORS = {
  Beginner: { bg: "#dcfce7", color: "#16a34a" },
  Intermediate: { bg: "#fef9c3", color: "#ca8a04" },
  Advanced: { bg: "#fee2e2", color: "#dc2626" },
};

const QuestionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerBody, setAnswerBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => { fetchQuestion(); }, [id]);

  const fetchQuestion = async () => {
    try {
      const res = await api.get(`/api/questions/${id}`);
      setQuestion(res.data.question);
      setAnswers(res.data.answers);
    } catch (err) {
      if (err.response?.status === 404) navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerBody.trim()) return setError("Please write an answer");
    if (answerBody.trim().length < 10) return setError("Answer is too short");

    setSubmitting(true);
    setError("");
    try {
      const res = await api.post("/api/answers", {
        body: answerBody,
        question_id: parseInt(id),
      });
      const newAnswer = {
        ...res.data.answer,
        author_name: user.name,
        author_avatar: user.avatar_url,
        author_reputation: user.reputation,
      };
      setAnswers(prev => [...prev, newAnswer]);
      setAnswerBody("");
      setPreview(false);
      setSuccess("Your answer has been posted! 🎉");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post answer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      await api.patch(`/api/answers/${answerId}/accept`);
      setAnswers(prev => prev.map(a => ({ ...a, is_accepted: a.id === answerId })));
      setQuestion(prev => ({ ...prev, status: "answered" }));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to accept answer");
    }
  };

  // Insert code block template at cursor
  const insertCodeBlock = () => {
    const lang = prompt("Language (e.g. python, javascript, cpp):", "javascript");
    if (!lang) return;
    const snippet = `\n\`\`\`${lang}\n// your code here\n\`\`\`\n`;
    setAnswerBody(prev => prev + snippet);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) return (
    <div className="qdetail-loading">
      <div className="loading-spinner" />
    </div>
  );

  if (!question) return null;

  const isOwner = user?.id === question.user_id;
  const hasAccepted = answers.some(a => a.is_accepted);

  return (
    <div className="qdetail-page">
      <div className="qdetail-inner">
        <Link to="/" className="qdetail-back">← Back to questions</Link>

        {/* Question */}
        <div className="qdetail-question card fade-in">
          <div className="qdetail-tags">
            {question.subject_name && (
              <span className="qd-tag" style={{ background: `${question.subject_color}15`, color: question.subject_color }}>
                {question.subject_icon} {question.subject_name}
              </span>
            )}
            {question.experience_level && (
              <span className="qd-tag" style={{
                background: LEVEL_COLORS[question.experience_level]?.bg,
                color: LEVEL_COLORS[question.experience_level]?.color,
              }}>
                {question.experience_level}
              </span>
            )}
            {question.question_type && (
              <span className="qd-tag qd-tag-muted">
                {QUESTION_TYPE_ICONS[question.question_type]} {question.question_type}
              </span>
            )}
            <span className={`badge badge-${question.status} qd-status`}>
              {question.status === "open" ? "Open" : "✅ Answered"}
            </span>
          </div>

          <h1 className="qdetail-title">{question.title}</h1>
          <CodeBlock content={question.body} />

          <div className="qdetail-meta">
            <div className="qd-author">
              <div className="qd-avatar">{question.author_name?.charAt(0).toUpperCase()}</div>
              <div>
                <span className="qd-author-name">{question.author_name}</span>
                <span className="qd-author-rep">⭐ {question.author_reputation} rep</span>
              </div>
            </div>
            <div className="qd-stats">
              <span>👁 {question.views} views</span>
              <span>💬 {answers.length} answers</span>
              <span>🕐 {timeAgo(question.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Answers header */}
        <div className="qdetail-answers-header">
          <h2>{answers.length} {answers.length === 1 ? "Answer" : "Answers"}</h2>
          {hasAccepted && <span className="accepted-label">✅ Accepted answer marked</span>}
        </div>

        {answers.length === 0 ? (
          <div className="no-answers card">
            <div className="no-answers-icon">🤔</div>
            <h3>No answers yet</h3>
            <p>Be the first to help!</p>
          </div>
        ) : (
          <div className="answers-list">
            {answers.map((answer, i) => (
              <div
                key={answer.id}
                className={`answer-card card fade-in ${answer.is_accepted ? "accepted" : ""}`}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {answer.is_accepted && (
                  <div className="accepted-banner">✅ Accepted Answer</div>
                )}
                <CodeBlock content={answer.body} />
                <div className="answer-footer">
                  <div className="qd-author">
                    <div className="qd-avatar qd-avatar-sm">
                      {answer.author_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="qd-author-name">{answer.author_name}</span>
                      <span className="qd-author-rep">⭐ {answer.author_reputation} rep</span>
                    </div>
                  </div>
                  <div className="answer-actions">
                    <span className="answer-time">{timeAgo(answer.created_at)}</span>
                    {isOwner && !answer.is_accepted && question.status === "open" && (
                      <button className="btn-accept" onClick={() => handleAcceptAnswer(answer.id)}>
                        ✓ Accept answer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Post answer */}
        <div className="post-answer-section">
          <h2>Your Answer</h2>

          {!user ? (
            <div className="login-prompt card">
              <p>You need to be logged in to answer questions.</p>
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <Link to="/login" className="btn btn-primary">Log in</Link>
                <Link to="/register" className="btn btn-outline">Sign up free</Link>
              </div>
            </div>
          ) : isOwner ? (
            <div className="owner-note card">
              💡 This is your question. You can accept an answer once someone replies.
            </div>
          ) : null}

          {user && (
            <form onSubmit={handleSubmitAnswer} className="answer-form card">
              {error && <div className="error-msg">{error}</div>}
              {success && <div className="success-msg">{success}</div>}

              {/* Toolbar */}
              <div className="answer-toolbar">
                <button
                  type="button"
                  className={`toolbar-btn ${!preview ? "active" : ""}`}
                  onClick={() => setPreview(false)}
                >✏️ Write</button>
                <button
                  type="button"
                  className={`toolbar-btn ${preview ? "active" : ""}`}
                  onClick={() => setPreview(true)}
                >👁 Preview</button>
                <div className="toolbar-divider" />
                <button type="button" className="toolbar-btn" onClick={insertCodeBlock}>
                  {"</>"}  Insert Code
                </button>
                <span className="toolbar-hint">Wrap code in ```python ... ```</span>
              </div>

              {preview ? (
                <div className="answer-preview">
                  {answerBody ? <CodeBlock content={answerBody} /> : (
                    <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Nothing to preview yet...</p>
                  )}
                </div>
              ) : (
                <div className="form-group">
                  <textarea
                    value={answerBody}
                    onChange={e => { setAnswerBody(e.target.value); setError(""); }}
                    placeholder={`Share your knowledge...\n\nTo add code:\n\`\`\`javascript\nconsole.log("Hello!");\n\`\`\`\n\nTo add inline code use backticks: \`variableName\``}
                    className="form-input answer-textarea"
                    rows={10}
                  />
                </div>
              )}

              <div className="answer-form-footer">
                <span className="answer-chars">{answerBody.length} characters</span>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !answerBody.trim()}
                >
                  {submitting ? "Posting..." : "Post Answer →"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
