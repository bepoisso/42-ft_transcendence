import db from "../db/db";
import { getUserByToken } from "../auth/auth_token";
import type { Games, Tournament } from "../types/games";
import type { User } from "../types/db";
import { lstat } from "fs";
import { clear } from "console";
import { syncBuiltinESMExports } from "module";
import { resourceLimits } from "worker_threads";

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
		const tournaments = db.prepare(`SELECT * FROM tournaments WHERE tournament_status = 'pending'`).all();
		return { statusCode: 200, message: "Success", tournaments };
	} catch (err) {
		return { statusCode: 500, message: "Internal server error" };
	}
}


export async function createTournament(name: string, nbrPlayer: number, token: string) {
	if (!name || !nbrPlayer || nbrPlayer !== 8) { 
		return { statusCode: 400, message: "Invalid credentials" };
	}

	const nameRegex = /^[A-Za-z0-9_-]{3,32}$/;
	if (!nameRegex.test(name)) {
		return { statusCode: 400, message: "Invalid tournament name" };
	}

	const email = await getUserByToken(token);
	const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as User;
	if (!user) {
		return { statusCode: 404, message: "User not found" };
	}

	try {
		db.prepare(`INSERT INTO tournaments (tournament_name, nbr_player, player_1, tournament_date) VALUES (?, ?, ?, ?)`).run(name, nbrPlayer, user.id, new Date().toISOString());
		return { statusCode: 200, message: "Success" };
	} catch (err) {
		return {statusCode: 500, message: "Internal Server Error"};
	}
}

export async function finishTournament(playerIdWon: number, tournamentId: number) {
	if (!playerIdWon) {
		return { statusCode: 401, message: "Invalid credential" }
	}

	const tournament = db.prepare(`SELECT * FROM tournaments WHERE id = ?`).get(tournamentId) as Tournament;
	if (!tournament) {
		return { statusCode: 404, message: "Tournamnet not found" };
	}

	const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(playerIdWon) as User;
	if (!user) {
		return { statusCode: 404, message: "user not found" };
	}

	const currentStatus = db.prepare(`SELECT tournament_status  FROM tournaments WHERE id = ?`).get(tournamentId);
	if (currentStatus === "finish") {
		return { statusCode: 400, message: "Tournament is already finished" };
	}

	try {
		db.prepare(`UPDATE tournaments SET player_won = ?, tournament_status = 'finish' WHERE id = ?`).run(playerIdWon, tournamentId);
		return { statusCode: 200, message: "Tournament finished success" };
	} catch (err) {
		return { statusCode: 500, message: "Internal server error" };
	}
}

export async function addPlayerToTournament(token: string, tournamentId: number) {
	if (!token || !tournamentId) {
		return { statusCode: 401, message: "Invalid credential" };
	}

	const email = await getUserByToken(token);
	if (!email) {
		return { statusCode: 404, message: "User not found" };
	}
	const user = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email) as { id: number };
	if (!user) {
		return { statusCode: 404, message: "User not found" };
	}
	const playerId = user.id;

	const tournament = db.prepare(`SELECT * FROM tournaments WHERE id = ?`).get(tournamentId) as Tournament;
	if (!tournament) {
		return { statusCode: 404, message: "Tournament not found" };
	}

	try {
		let playerSlot = 0;
		for (let i = 1; i <= 8; i++) {
			const columnName = `player_${i}`;
			const value = tournament[columnName as keyof Tournament];
			if (value === undefined || value === null) {
				playerSlot = i;
				break;
			}
		}

		if (playerSlot === 0) {
			return { statusCode: 400, message: "Tournament is already full" };
		}
		db.prepare(`UPDATE tournaments SET player_${playerSlot} = ? WHERE id = ?`).run(playerId, tournamentId);

		return { statusCode: 200, message: `Player ${playerId} successfully added to the tournament at position ${playerSlot}` };
	} catch (err) {
		return { statusCode: 500, message: "Internal server error", err };
	}
}

export async function finishGame(playerIdWon: number, score: string, gameId: number) {
	const game = db.prepare(`SELECT * FROM game WHERE id = ?`).get(gameId) as Games;
	if (!game) {
		return { statusCode: 404, message: "Game not found" };
	}
	
	const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(playerIdWon) as User;
	if (!user) {
		return { statusCode: 404, message: "Player not found" };
	}

	try {
		db.prepare(`UPDATE games SET player_id_won = ?, score = ? WHERE id = ?`).run(playerIdWon, score, gameId);
		return { statusCode: 200, message: "Success game updated" };
	} catch (err) {
		return { statusCode: 500, message: "Internal server error", err };
	}
}
