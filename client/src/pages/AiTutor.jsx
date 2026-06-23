import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import "./AiTutor.css";

const SUGGESTED_PROMPTS = [
  "Why is my useEffect running twice in React?",
  "Explain Big O notation with examples",
  "What's the difference between SQL and NoSQL?",
  "How do I reverse a linked list in Python?",
  "What are REST API best practices?",
];

const formatMessage = (text) => {
  // Split on code blocks
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const lines = part.slice(3, -3).split("\n");
      const lang = lines[0].trim();
      const code = lines.slice(1).join("\n");
      return (
        <div key={i} className="code-block">
          {lang && <div className="code-lang">{lang}</div>}
          <pre><code>{code}</code></pre>
        </div>
      );
    }
    // Handle inline code and bold
    const inline = part.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((seg, j) => {
      if (seg.startsWith("`") && seg.endsWith("`")) {
        return <code key={j} className="inline-code">{seg.slice(1, -1)}</code>;
      }
      if (seg.startsWith("**") && seg.endsWith("**")) {
        return <strong key={j}>{seg.slice(2, -2)}</strong>;
      }
      return seg;
    });
    return <span key={i}>{inline}</span>;
  });
};

const AiTutor = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey! I'm your AI tutor 👋 I can help with bugs, concepts, best practices, and more. What are you working on?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;

    const userMsg = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Send full history (minus the initial greeting) to keep context
      const history = newMessages.slice(1).map(m => ({ role: m.role, content: m.content }));
      const res = await api.post("/api/ai/chat", { messages: history });
      setMessages(prev => [...prev, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble right now. Please try again in a moment.",
        isError: true,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Hey! I'm your AI tutor 👋 I can help with bugs, concepts, best practices, and more. What are you working on?",
    }]);
    setInput("");
  };

  const isOnlyGreeting = messages.length === 1;

  return (
    <div className="ai-tutor-page">
      <div className="ai-tutor-container">
        {/* Header */}
        <div className="ai-header">
          <div className="ai-header-left">
            <div className="ai-avatar">🤖</div>
            <div>
              <h1 className="ai-title">AI Tutor</h1>
              <span className="ai-status"><span className="ai-dot" />Always online</span>
            </div>
          </div>
          <div className="ai-header-right">
            <button className="btn-ghost" onClick={clearChat} title="New chat">↺ New chat</button>
            <Link to="/ask" className="btn btn-primary ask-public-btn">Ask publicly →</Link>
          </div>
        </div>

        {/* Tip banner */}
        <div className="ai-tip">
          💡 Try AI first — if you still need help, <Link to="/ask">post a public question</Link> for human tutors.
        </div>

        {/* Messages */}
        <div className="ai-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message-row ${msg.role === "user" ? "user-row" : "ai-row"}`}>
              {msg.role === "assistant" && <div className="msg-avatar">🤖</div>}
              <div className={`message-bubble ${msg.role === "user" ? "user-bubble" : "ai-bubble"} ${msg.isError ? "error-bubble" : ""}`}>
                {msg.role === "assistant" ? formatMessage(msg.content) : msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row ai-row">
              <div className="msg-avatar">🤖</div>
              <div className="message-bubble ai-bubble typing-bubble">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggested prompts — shown only at start */}
        {isOnlyGreeting && (
          <div className="suggested-prompts">
            <p className="prompts-label">Try asking:</p>
            <div className="prompts-list">
              {SUGGESTED_PROMPTS.map((p, i) => (
                <button key={i} className="prompt-chip" onClick={() => sendMessage(p)}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="ai-input-area">
          <textarea
            ref={inputRef}
            className="ai-textarea"
            placeholder="Ask anything about code, concepts, bugs..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            {loading ? "..." : "↑"}
          </button>
        </div>
        <p className="input-hint">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
};

export default AiTutor;
