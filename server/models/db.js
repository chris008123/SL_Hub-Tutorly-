const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'tutor')),
        subjects TEXT[] DEFAULT '{}',
        reputation INTEGER DEFAULT 0,
        avatar_url TEXT,
        bio TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token TEXT,
        verification_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Add verification columns to existing users table if they don't exist
    await pool.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS verification_token TEXT,
        ADD COLUMN IF NOT EXISTS verification_expiry TIMESTAMP
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        icon VARCHAR(10),
        color VARCHAR(20)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        body TEXT NOT NULL,
        subject_id INTEGER REFERENCES subjects(id),
        experience_level VARCHAR(30) CHECK (experience_level IN ('Beginner', 'Intermediate', 'Advanced')),
        question_type VARCHAR(30) CHECK (question_type IN ('Bug Fix', 'Concept', 'Best Practice', 'Project Help', 'Interview Prep')),
        image_url TEXT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'answered')),
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS answers (
        id SERIAL PRIMARY KEY,
        body TEXT NOT NULL,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        is_accepted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      INSERT INTO subjects (name, icon, color) VALUES
        ('Python', '🐍', '#3B82F6'),
        ('JavaScript', '🟨', '#F59E0B'),
        ('C++', '⚙️', '#8B5CF6'),
        ('Java', '☕', '#EF4444'),
        ('React', '⚛️', '#06B6D4'),
        ('HTML & CSS', '🎨', '#EC4899'),
        ('SQL & Databases', '🗄️', '#10B981'),
        ('Git & GitHub', '🐙', '#F97316'),
        ('Data Structures & Algorithms', '🧩', '#6366F1'),
        ('General Programming', '💻', '#22C55E')
      ON CONFLICT (name) DO NOTHING
    `);

    console.log("✅ Database initialized successfully");
  } catch (err) {
    console.error("❌ Database initialization failed:", err.message);
  }
};

module.exports = { pool, initDB };
