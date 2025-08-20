DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS friends;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS tournament;

-- Table des utilisateurs
CREATE TABLE users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT NOT NULL UNIQUE,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT,
	avatar_url TEXT,
	games_played NUMBER DEFAULT 0,
	games_won NUMBER DEFAULT 0,
	is_connected NUMBER DEFAULT 0 NOT NULL,
	socket_id NUMBER DEFAULT 0,
	room_id NUMBER DEFAULT 0 NOT NULL,
	google_id TEXT UNIQUE,
	twofa_enable BOOLEAN DEFAULT 0,
	twofa_secret TEXT UNIQUE,
	username_tournament TEXT
);

DROP TABLE IF EXISTS friends;

CREATE TABLE friends (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL,
	friend_id INTEGER NOT NULL,
	status TEXT DEFAULT 'pending',
	FOREIGN KEY (user_id) REFERENCES users(id),
	FOREIGN KEY (friend_id) REFERENCES users(id)
);


-- Table des parties
CREATE TABLE games (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	player_id_left NUMBER NOT NULL,
	player_id_right NUMBER,
	player_id_won NUMBER,
	game_date TEXT NOT NULL,
	score TEXT,
	tournament_id NUMBER DEFAULT 0
);

-- Table des tournois
CREATE TABLE tournament (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	tournament_name TEXT NOT NULL,
	nbr_player NUMBER NOT NULL,
	player_list TEXT,
	player_won NUMBER,
	tournament_date TEXT NOT NULL
);
