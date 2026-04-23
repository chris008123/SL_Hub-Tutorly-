const express = require("express");
const { pool } = require("../models/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/questions/subjects/all — must be before /:id route
router.get("/subjects/all", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM subjects ORDER BY name ASC");
    res.json({ subjects: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/questions — list with filters
router.get("/", async (req, res) => {
  const { subject, experience_level, question_type, status, search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let conditions = ["1=1"];
    const params = [];

    if (subject) {
      params.push(subject);
      conditions.push(`s.name = $${params.length}`);
    }
    if (experience_level) {
      params.push(experience_level);
      conditions.push(`q.experience_level = $${params.length}`);
    }
    if (question_type) {
      params.push(question_type);
      conditions.push(`q.question_type = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`q.status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(q.title ILIKE $${params.length} OR q.body ILIKE $${params.length})`);
    }

    const where = conditions.join(" AND ");

    const query = `
      SELECT q.*,
             u.name as author_name, u.avatar_url as author_avatar, u.reputation as author_reputation,
             s.name as subject_name, s.icon as subject_icon, s.color as subject_color,
             COUNT(a.id) as answer_count
      FROM questions q
      JOIN users u ON q.user_id = u.id
      LEFT JOIN subjects s ON q.subject_id = s.id
      LEFT JOIN answers a ON q.id = a.question_id
      WHERE ${where}
      GROUP BY q.id, u.name, u.avatar_url, u.reputation, s.name, s.icon, s.color
      ORDER BY q.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ questions: result.rows, page: parseInt(page) });
  } catch (err) {
    console.error("Get questions error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/questions/:id — single question + answers
router.get("/:id", async (req, res) => {
  try {
    await pool.query("UPDATE questions SET views = views + 1 WHERE id = $1", [req.params.id]);

    const result = await pool.query(
      `SELECT q.*,
              u.name as author_name, u.avatar_url as author_avatar, u.reputation as author_reputation,
              s.name as subject_name, s.icon as subject_icon, s.color as subject_color
       FROM questions q
       JOIN users u ON q.user_id = u.id
       LEFT JOIN subjects s ON q.subject_id = s.id
       WHERE q.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    const answers = await pool.query(
      `SELECT a.*, u.name as author_name, u.avatar_url as author_avatar, u.reputation as author_reputation
       FROM answers a
       JOIN users u ON a.user_id = u.id
       WHERE a.question_id = $1
       ORDER BY a.is_accepted DESC, a.created_at ASC`,
      [req.params.id]
    );

    res.json({ question: result.rows[0], answers: answers.rows });
  } catch (err) {
    console.error("Get question error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/questions — create question
router.post("/", authMiddleware, async (req, res) => {
  const { title, body, subject_id, experience_level, question_type } = req.body;

  if (!title || !body || !subject_id || !experience_level || !question_type) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO questions (title, body, subject_id, experience_level, question_type, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, body, subject_id, experience_level, question_type, req.user.id]
    );
    res.status(201).json({ question: result.rows[0] });
  } catch (err) {
    console.error("Create question error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
