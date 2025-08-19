DROP TABLE IF EXISTS users;

CREATE TABLE users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT NOT NULL UNIQUE,
	email TEXT UNIQUE,
	password_hash TEXT,
	google_id TEXT UNIQUE
);


-- IL faut ajouter : avatarURL (string), games played (string), games won (string), friends (list), isConnected (boolean)
