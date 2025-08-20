DROP TABLE IF EXISTS users;

CREATE TABLE users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT NOT NULL UNIQUE,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT,
	avatar_url TEXT,
	games_played NUMBER DEFAULT 0,
	games_won NUMBER DEFAULT 0,
	is_connected NUMBER DEFAULT 0,
	socket_id NUMBER DEFAULT 0,
	room_id NUMBER DEFAULT 0,
	google_id TEXT UNIQUE,
	twofa_enable BOOLEAN DEFAULT 0,
	twofa_secret TEXT UNIQUE,
	friend_list TEXT DEFAULT '[]',
);

DROP TABLE IF EXISTS games;

CREATE TABLE games (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	player_id_left NUMBER NOT NULL,
	player_id_right NUMBER,
	player_id_won NUMBER,
	game_date TEXT,
	score TEXT,
	tournament_id NUMBER DEFAULT 0,
);

DROP TABLE IF EXISTS tournament;

CREATE TABLE tournament (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	tournament_name TEXT NOT NULL,
	nbr_player NUMBER NOT NULL,
	player_list TEXT,
	player_won NUMBER,
	tournament_date TEXT
);
