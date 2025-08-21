import db from "../db/db";
import { getUserByToken } from "../auth/auth_token";
import type { Games, Tournament } from "../types/games";
import type { User } from "../types/db";
import { lstat } from "fs";
import { clear } from "console";

export async function getGamesHistory(token: string) {
	const email = await getUserByToken(token);
	if (!token) {
		return { statusCode: 404, message: "User not found" };
	}

	const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as User;
	if (!user) {
		return { statusCode: 404, message: "User not found" };
	}
	const games = db.prepare(`SELECT * FROM games WHERE player_id_left = ? OR player_id_right = ?`).all(user.id, user.id) as Games[];

	return { statusCode: 200, message: "Success", games };
}


export async function getTournamentHistory() {
	try {
		const tournament = db.prepare(`SELECT * FROM tournaments WHERE tournament_status = 'finish'`);
		if (!tournament) {
			return { statusCode: 500, message: "Internal server error" };
		}
		return {statusCode: 200, message: "Success", tournament};
	} catch (err) {
		return { statusCode: 500, message: "Internal server error" };
	}
}


export async function getPendingTournament() {
	try {
		const tournament = db.prepare(`SELECT * FROM tournaments WHERE tournament_status = 'pending'`);
		if (!tournament) {
			return { statusCode: 500, message: "Internal server error" };
		}
		return {statusCode: 200, message: "Success", tournament};
	} catch (err) {
		return { statusCode: 500, message: "Internal server error" };
	}
}


export async function createTournament(name: string, nbrPlayer: number, token: string) {
	if (!name || !nbrPlayer || (nbrPlayer !== 4 && nbrPlayer !== 8)) { 
		return { statusCode: 400, message: "Invalid credentials" };
	}

	const nameRegex = /^[A-Za-z0-9_-]{3,32}$/;
	if (!nameRegex.test(name)) {
		return { statusCode: 400, message: "Invalid tournament name" };
	}

	const email = getUserByToken(token);
	const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as User;
	if (!user) {
		return { statusCode: 404, message: "User not found" };
	}

	try {
		db.prepare(`INSERT INTO tournaments (tournament_name, nbr_player, player_one, tournament_date) VALUES (?, ?, ?, ?)`).run(name, nbrPlayer, user.id, new Date().toISOString());
		return { statusCode: 200, message: "Success" };
	} catch (err) {
		return {statusCode: 500, message: "Internal Server Error"};
	}
}

export async function finishTournament(playerIdWon: number, tournamentId: number) {
	if (!playerIdWon) {
		return { statusCode: 401, message: "Invalid credential" }
	}

	try {
		db.prepare(`UPDATE tournaments SET player_won = ?, tournament_status = 'finish' WHERE id = ?`).run(playerIdWon, tournamentId);
		return { statusCode: 200, message: "Tournament finished" };
	} catch (err) {
		return { statusCode: 500, message: "Internal server error" };
	}
}

/* CREATE TABLE tournament (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	tournament_name TEXT NOT NULL,
	nbr_player NUMBER NOT NULL,
	player_list TEXT,
	player_won NUMBER,
	tournament_date TEXT NOT NULL,
	tournament_status TEXT NOT NULL DEFAULT 'pending'
);
 */
