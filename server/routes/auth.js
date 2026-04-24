const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { pool } = require("../models/db");
const authMiddleware = require("../middleware/authMiddleware");
const { sendVerificationEmail } = require("../utils/mailer");

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, role, subjects } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  if (!["student", "tutor"].includes(role)) {
    return res.status(400).json({ error: "Role must be student or tutor" });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, subjects, verification_token, verification_expiry, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
       RETURNING id, name, email, role, subjects, reputation, is_verified, created_at`,
      [name.trim(), email.toLowerCase(), hashedPassword, role, subjects || [], verificationToken, verificationExpiry]
    );

    const user = result.rows[0];

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    sendVerificationEmail({ toEmail: user.email, toName: user.name, verificationUrl });

    const token = generateToken(user);
    res.status(201).json({
      message: "Account created! Please check your email to verify your account.",
      token,
      user,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, email, password, role, subjects, reputation, avatar_url, bio, is_verified
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);

    res.json({ message: "Logged in successfully", token, user: userWithoutPassword });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// GET /api/auth/verify-email?token=xxx
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Verification token is required" });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, email, verification_expiry FROM users
       WHERE verification_token = $1 AND is_verified = FALSE`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or already used verification link" });
    }

    const user = result.rows[0];

    if (new Date() > new Date(user.verification_expiry)) {
      return res.status(400).json({ error: "Verification link has expired. Please request a new one." });
    }

    await pool.query(
      `UPDATE users SET is_verified = TRUE, verification_token = NULL, verification_expiry = NULL WHERE id = $1`,
      [user.id]
    );

    res.json({ message: "Email verified successfully! You can now post questions and answers." });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/resend-verification
router.post("/resend-verification", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, is_verified FROM users WHERE id = $1",
      [req.user.id]
    );

    const user = result.rows[0];

    if (user.is_verified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      `UPDATE users SET verification_token = $1, verification_expiry = $2 WHERE id = $3`,
      [verificationToken, verificationExpiry, user.id]
    );

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail({ toEmail: user.email, toName: user.name, verificationUrl });

    res.json({ message: "Verification email resent! Please check your inbox." });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/auth/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, subjects, reputation, avatar_url, bio, is_verified, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
