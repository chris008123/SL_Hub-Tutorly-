const express = require("express");
const { pool } = require("../models/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/users/:id — get user profile with questions and answers
router.get("/:id", async (req, res) => {
  try {
    const userResult = await pool.query(
      `SELECT id, name, email, role, subjects, reputation, avatar_url, bio, created_at
       FROM users WHERE id = $1`,
      [req.params.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's questions
    const questionsResult = await pool.query(
      `SELECT q.*, s.name as subject_name, s.icon as subject_icon, s.color as subject_color,
              COUNT(a.id) as answer_count
       FROM questions q
       LEFT JOIN subjects s ON q.subject_id = s.id
       LEFT JOIN answers a ON q.id = a.question_id
       WHERE q.user_id = $1
       GROUP BY q.id, s.name, s.icon, s.color
       ORDER BY q.created_at DESC`,
      [req.params.id]
    );

    // Get user's answers with question title
    const answersResult = await pool.query(
      `SELECT a.*, q.title as question_title, q.id as question_id
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [req.params.id]
    );

    res.json({
      user: userResult.rows[0],
      questions: questionsResult.rows,
      answers: answersResult.rows,
    });
  } catch (err) {
    console.error("Get user profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/users/:id/bio — update bio
router.patch("/:id/bio", authMiddleware, async (req, res) => {
  if (req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ error: "You can only edit your own profile" });
  }

  const { bio } = req.body;

  try {
    await pool.query(
      "UPDATE users SET bio = $1 WHERE id = $2",
      [bio?.slice(0, 300) || null, req.params.id]
    );
    res.json({ message: "Bio updated" });
  } catch (err) {
    console.error("Update bio error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
