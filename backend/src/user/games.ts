import db from "../db/db";
import { getUserByToken } from "../auth/auth_token";
import type { Games, Tournament } from "../types/games";
import type { User } from "../types/db";

export async function getGamesHistory(token: string) {
	const email = getUserByToken(token);
	if (!token) {
		return { statusCode: 404, message: "User not found" };
	}

	const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as User;
	if (!user) {
		return { statusCode: 404, message: "User not found" };
	}

	const games = db.prepare(`SELECT * FROM games WHERE player_id_left = ? OR player_id_right = ?`).get(user.id, user.id) as Games;
	if (!games) {
		return { statusCode: 404, message: "Games not founds" };
	}

	return { statusCode: 200, message: "Success", games };
}

