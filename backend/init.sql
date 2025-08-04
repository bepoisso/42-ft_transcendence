
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT DEFAULT 'offline',
  is_two_factor_enabled BOOLEAN DEFAULT 0,
  is_verified BOOLEAN DEFAULT 0
);
