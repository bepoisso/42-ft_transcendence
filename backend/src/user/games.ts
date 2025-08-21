import db from "../db/db";
import { getUserByToken } from "../auth/auth_token";
import type { Games, Tournament } from "../types/games";
import type { User } from "../types/db";

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

