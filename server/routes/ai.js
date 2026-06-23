const express = require("express");
const { pool } = require("../models/db");

const router = express.Router();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const AI_SYSTEM_PROMPT = `You are an expert CS and tech tutor on SL_Hub, a free platform that helps developers of all levels.
Your role is to help students understand programming concepts, debug code, learn best practices, and prepare for interviews.
Guidelines:
- Be clear, friendly, and encouraging — students may be beginners
- For code, always use markdown fenced code blocks with the language specified (e.g. \`\`\`javascript)
- Break down complex ideas step by step
- If a question is vague, answer the most likely interpretation and offer to clarify
- Stay focused on tech and CS topics
- Keep answers concise but complete — don't pad unnecessarily`;

// Helper: call Groq API
const callGroq = async (messages) => {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "system", content: AI_SYSTEM_PROMPT }, ...messages],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

// POST /api/ai/chat — Option C: conversational AI tutor
// Body: { messages: [{ role, content }] }
router.post("/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  try {
    const reply = await callGroq(messages);
    res.json({ reply });
  } catch (err) {
    console.error("AI chat error:", err);
    res.status(500).json({ error: "AI tutor is unavailable right now" });
  }
});

// POST /api/ai/auto-answer — Option D: auto-answer a newly posted question
// Body: { question_id, title, body, subject, experience_level, question_type }
router.post("/auto-answer", async (req, res) => {
  const { question_id, title, body, subject, experience_level, question_type } = req.body;

  if (!question_id || !title || !body) {
    return res.status(400).json({ error: "question_id, title, and body are required" });
  }

  try {
    // Build a rich prompt from the question context
    const contextParts = [];
    if (subject) contextParts.push(`Topic: ${subject}`);
    if (experience_level) contextParts.push(`Student level: ${experience_level}`);
    if (question_type) contextParts.push(`Question type: ${question_type}`);
    const context = contextParts.length > 0 ? `\n${contextParts.join(" | ")}` : "";

    const prompt = `A student posted this question on SL_Hub:${context}\n\nTitle: ${title}\n\n${body}\n\nPlease provide a helpful, thorough answer.`;

    const aiReply = await callGroq([{ role: "user", content: prompt }]);

    // Get or create the AI bot user
    let aiBotId;
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      ["ai-tutor@slhub.bot"]
    );

    if (existing.rows.length > 0) {
      aiBotId = existing.rows[0].id;
    } else {
      // Create the AI bot user once — adjust columns to match your users table
      const created = await pool.query(
        `INSERT INTO users (name, email, password, is_verified)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        ["🤖 AI Tutor", "ai-tutor@slhub.bot", "NOT_A_REAL_PASSWORD", true]
      );
      aiBotId = created.rows[0].id;
    }

    // Insert the AI answer
    const result = await pool.query(
      `INSERT INTO answers (body, question_id, user_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [aiReply, question_id, aiBotId]
    );

    res.status(201).json({ answer: result.rows[0] });
  } catch (err) {
    console.error("Auto-answer error:", err);
    res.status(500).json({ error: "Auto-answer failed" });
  }
});

module.exports = router;
