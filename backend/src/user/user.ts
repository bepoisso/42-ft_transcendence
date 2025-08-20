import db from "../db/db";
import { getUserByToken } from "../auth/auth_token";
import type { User, Friend } from "../types/db";

// PROFILE USER PRIVATE
//		FRIEND LIST
// PROFILE USER PUBLIC


export async function getUserPrivate(token: string) {
	const email = getUserByToken(token);
	if (!email) {
		return { statusCode: 404, message: "User not found" };
	}

	const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as User;
	if (!user) {
		return { StatusCode: 404, message: "User not found" };
	}

	const friends = db.prepare(`SELECT * FROM friends WHERE user_id = ? OR friend_id = ?`).all(user.id, user.id) as Friend[];

	return {
		statusCode: 200,
		message: "Success",
		id: user.id,
		username: user.username,
		username_tournamenet: user.username_tournament,
		avatar_url: user.avatar_url,
		email: user.email,
		games_played: user.games_played,
		games_won: user.games_won,
		room_id: user.room_id,
		friends: friends
	};
}

export async function getUserPublic(id: number) {
	if (!id) {
		return { statusCode: 404, message: "User not found" };
	}

	const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as User;
	if (!user) {
		return { StatusCode: 404, message: "User not found" };
	}

	return {	statusCode: 200,
				message: "Success",
				id: user.id,
				username: user.username,
				is_connected: user.is_connected,
				username_tournamenet: user.username_tournament,
				avatar_url: user.avatar_url,
				games_played: user.games_played,
				games_won: user.games_won
			}
}

