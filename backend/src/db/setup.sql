DROP TABLE IF EXISTS users;

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

DROP TABLE IF EXISTS games;

CREATE TABLE games (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	player_id_left NUMBER NOT NULL,
	player_id_right NUMBER,
	player_id_won NUMBER,
	game_date TEXT NOT NULL,
	score TEXT,
	tournament_id NUMBER DEFAULT 0
);




DROP TABLE IF EXISTS tournamentz;

CREATE TABLE tournaments (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	tournament_name TEXT NOT NULL UNIQUE,
	player_1 INTEGER NOT NULL,
	player_2 INTEGER,
	player_3 INTEGER,
	player_4 INTEGER,
	player_5 INTEGER,
	player_6 INTEGER,
	player_7 INTEGER,
	player_8 INTEGER,
	tournament_date TEXT NOT NULL DEFAULT (datetime('now')),
	tournament_status TEXT NOT NULL DEFAULT 'pending',
	FOREIGN KEY(player_1) REFERENCES users(id),
	FOREIGN KEY(player_2) REFERENCES users(id),
	FOREIGN KEY(player_3) REFERENCES users(id),
	FOREIGN KEY(player_4) REFERENCES users(id),
	FOREIGN KEY(player_5) REFERENCES users(id),
	FOREIGN KEY(player_6) REFERENCES users(id),
	FOREIGN KEY(player_7) REFERENCES users(id),
	FOREIGN KEY(player_8) REFERENCES users(id)
);

CREATE TABLE tournament_games (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	tournament_id INTEGER NOT NULL,
	round INTEGER NOT NULL,
	poule INTEGER,
	player1_id INTEGER,
	player2_id INTEGER,
	winner_id INTEGER,
	status TEXT NOT NULL DEFAULT 'pending',
	FOREIGN KEY(tournament_id) REFERENCES tournaments(id),
	FOREIGN KEY(player1_id) REFERENCES users(id),
	FOREIGN KEY(player2_id) REFERENCES users(id),
	FOREIGN KEY(winner_id) REFERENCES users(id)
);
