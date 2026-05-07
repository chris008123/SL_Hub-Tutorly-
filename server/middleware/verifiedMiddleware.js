const { pool } = require("../models/db");

const verifiedMiddleware = async (req, res, next) => {
  try {
    // Always check DB for latest is_verified status instead of relying on JWT
    const result = await pool.query(
      "SELECT is_verified FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!result.rows[0].is_verified) {
      return res.status(403).json({
        error: "Please verify your email before posting. Check your inbox for the verification link.",
        code: "EMAIL_NOT_VERIFIED"
      });
    }

    next();
  } catch (err) {
    console.error("Verified middleware error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = verifiedMiddleware;
