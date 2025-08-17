DROP TABLE IF EXISTS users;

CREATE TABLE users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT NOT NULL UNIQUE,
	email TEXT UNIQUE,
	password_hash TEXT,
	google_id TEXT UNIQUE,
	twofa_enable BOOLEAN DEFAULT 0,
	twofa_secret TEXT UNIQUE
);
