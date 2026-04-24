const express = require("express");
const { pool } = require("../models/db");
const authMiddleware = require("../middleware/authMiddleware");
const verifiedMiddleware = require("../middleware/verifiedMiddleware");
const { sendAnswerNotification } = require("../utils/mailer");

const router = express.Router();

// POST /api/answers — post an answer
router.post("/", authMiddleware, verifiedMiddleware, async (req, res) => {
  const { body, question_id } = req.body;

  if (!body || !question_id) {
    return res.status(400).json({ error: "Body and question_id are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO answers (body, question_id, user_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [body, question_id, req.user.id]
    );

    // Send email notification to question author (don't await — fire and forget)
    pool.query(
      `SELECT q.title, q.user_id, u.email, u.name
       FROM questions q JOIN users u ON q.user_id = u.id
       WHERE q.id = $1`,
      [question_id]
    ).then(({ rows }) => {
      if (rows.length > 0 && rows[0].user_id !== req.user.id) {
        sendAnswerNotification({
          toEmail: rows[0].email,
          toName: rows[0].name,
          questionTitle: rows[0].title,
          questionId: question_id,
          answererName: req.user.name,
        });
      }
    }).catch(err => console.error("Notification error:", err));

    res.status(201).json({ answer: result.rows[0] });
  } catch (err) {
    console.error("Post answer error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/answers/:id/accept — mark answer as accepted
router.patch("/:id/accept", authMiddleware, async (req, res) => {
  try {
    const answer = await pool.query(
      `SELECT a.*, q.user_id as question_owner
       FROM answers a JOIN questions q ON a.question_id = q.id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (answer.rows.length === 0) {
      return res.status(404).json({ error: "Answer not found" });
    }

    if (answer.rows[0].question_owner !== req.user.id) {
      return res.status(403).json({ error: "Only the question author can accept an answer" });
    }

    await pool.query(
      "UPDATE answers SET is_accepted = FALSE WHERE question_id = $1",
      [answer.rows[0].question_id]
    );

    await pool.query("UPDATE answers SET is_accepted = TRUE WHERE id = $1", [req.params.id]);

    await pool.query(
      "UPDATE questions SET status = 'answered' WHERE id = $1",
      [answer.rows[0].question_id]
    );

    await pool.query(
      "UPDATE users SET reputation = reputation + 10 WHERE id = $1",
      [answer.rows[0].user_id]
    );

    res.json({ message: "Answer accepted" });
  } catch (err) {
    console.error("Accept answer error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
