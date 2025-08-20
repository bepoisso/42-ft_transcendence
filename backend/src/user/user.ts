import db from "../db/db";
import { getUserByToken } from "../auth/auth_token";
import type { User, Friend } from "../types/db";
import bcrypt from 'bcrypt';


export async function getUserPrivate(token: string) {
	const email = getUserByToken(token);
	if (!email) {
		return { statusCode: 404, message: "User not found" };
	}

	const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as User;
	if (!user) {
		return { StatusCode: 404, message: "User not found" };
	}

	const friends = db.prepare(`SELECT f.id, f.status,
		u.id as friend_id, u.username, u.avatar_url, u.is_connected
		FROM friends f
		JOIN users u ON (u.id = CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END)
		WHERE f.user_id = ? OR f.friend_id = ?`).all(user.id, user.id, user.id);

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

export async function updateUsername(newUsername: string, token: string) {
	if (!newUsername) {
		return { statusCode: 400, message: "Username is required" };
	}
	
	const email = getUserByToken(token);
	if (!email) {
		return { statusCode: 404, message: "User not found" };
	}

	const usernameRegex = /^[a-zA-Z0-9]{3,}$/;
	if (!usernameRegex.test(newUsername)) {
		return { statusCode: 401, message: "Invalid credential" };
	}

	const test = db.prepare(`SELECT id FROM users WHERE username = ?`).get(newUsername);
	if (test) {
		return { statusCode: 409, message: "Username is already taken" };
	}

	try {
		db.prepare(`UPDATE users SET username = ? WHERE email = ?`).run(newUsername, email);
		return { statusCode: 200, message: "Username updated successfully" };
	} catch (err) {
		return { statusCode: 500, message: "Failed to update username" }; 
	}
}

export async function updateAvatar(newAvatar: string, token: string) {
	if (!newAvatar) {
		return { statusCode: 400, message: "Avatar URL is required" };
	}
	
	const email = getUserByToken(token);
	if (!email) {
		return { statusCode: 404, message: "User not found" };
	}

	const avatarRegex = /^[a-zA-Z0-9]{3,}$/; // A CHANGER
	if (!avatarRegex.test(newAvatar)) {
		return { statusCode: 401, message: "Invalid credential" };
	}

	try {
		db.prepare(`UPDATE users SET avatar_url = ? WHERE email = ?`).run(newAvatar, email);
		return { statusCode: 200, message: "Avatar updated successfully" };
	} catch (err) {
		return { statusCode: 500, message: "Failed to update avatar" }; 
	}
}

export async function updatePassword(oldPass: string, newPass: string, confirmPass: string, token: string) {
	const email = getUserByToken(token);
	if (!email) {
		return {statusCode: 404, message: "User not found"};
	}

	if (!oldPass || !newPass || !confirmPass) {
		return { statusCode: 401, message: "Invalid credential" };
	}

	const passRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!passRegex.test(oldPass) || !passRegex.test(newPass) || !passRegex.test(confirmPass)) {
		return { statuscode: 401, message: "Invalid credential" };
	}

	if (newPass !== confirmPass) {
		return { statusCode: 400, message: "New password and confirm password do not match" };
	}
	
	const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as User;
	if (!user) {
		return { statusCode: 404, message: "User not found" };
	}

	const verify = await bcrypt.compare(newPass, user.password_hash || '');
	if (!verify) {
		return { statusCode: 401, message: "Missmatch old password" };
	}

	const newPassHash = await bcrypt.hash(newPass, 10);
	if (!newPassHash) {
		return { statusCode: 500, message: "Internal server error" };
	} 

	try {
		db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(newPassHash, user.id);
	} catch (err) {
		return { statusCode: 500, message: "Internal server error", err }
	}
}
