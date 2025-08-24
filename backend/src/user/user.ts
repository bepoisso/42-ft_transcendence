import db from "../db/db";
import { getUserByToken } from "../auth/auth_token";
import type { User, Friend } from "../types/db";
import bcrypt from 'bcrypt';


export async function getUserPrivate(token: string) {
	console.log("👤 getUserPrivate() appelé avec token:", token ? "Token présent" : "Token manquant");

	const email = await getUserByToken(token);
	console.log("📧 getUserByToken() résultat:", email ? `Email: ${email}` : "Email null/undefined");

	if (!email) {
		console.log("❌ getUserPrivate: User not found, retour 404");
		return { statusCode: 404, message: "User not found" };
	}

	try {
		console.log("🔍 Recherche utilisateur avec email:", email);
		const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as User;
		if (!user) {
			console.log("❌ getUserPrivate: User not found in database");
			return { StatusCode: 404, message: "User not found" };
		}

		console.log("👥 Recherche des amis pour user ID:", user.id);
		const friends = db.prepare(`
			SELECT DISTINCT
				f.status,
				u.id as friend_id,
				u.username,
				u.avatar_url,
				u.is_connected,
				MIN(f.id) as friendship_id
			FROM friends f
			JOIN users u ON (
				(f.user_id = ? AND u.id = f.friend_id) OR
				(f.friend_id = ? AND u.id = f.user_id)
			)
			WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'
			GROUP BY u.id, f.status
			ORDER BY u.username
		`).all(user.id, user.id, user.id, user.id);

		console.log("FRIENDS = ", friends);
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
	} catch (err) {
		console.error("💥 getUserPrivate: Erreur dans try/catch:", err);
		return {statusCode: 500, message: "Internal server error", err};
	}

}

// Il faut verifier le token et me renvoyer si ils sont deja amis ou pas
export async function getUserPublic(username: number) {
	if (!username) {
		return { statusCode: 404, message: "User not found" };
	}

	const user = db.prepare(`SELECT * FROM users WHERE username = ?`).get(username) as User;
	if (!user) {
		return { statusCode: 404, message: "User not found" };
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

	const email = await getUserByToken(token);
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

	const email = await getUserByToken(token);
	if (!email) {
		return { statusCode: 404, message: "User not found" };
	}

	const avatarRegex = /.*\.(jpg|jpeg|png|webp)(\?.*)?$/i;
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
	const email = await getUserByToken(token);
	if (!email) {
		return {statusCode: 404, message: "User not found"};
	}

	if (!oldPass || !newPass || !confirmPass) {
		return { statusCode: 401, message: "Invalid credential" };
	}

	const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
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

	const verify = await bcrypt.compare(oldPass, user.password_hash || '');
	if (!verify) {
		return { statusCode: 401, message: "Missmatch old password" };
	}

	const newPassHash = await bcrypt.hash(newPass, 10);
	if (!newPassHash) {
		return { statusCode: 500, message: "Internal server error" };
	}

	try {
		db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(newPassHash, user.id);
		return { statusCode: 200, message: "Password updated successfully" };
	} catch (err) {
		return { statusCode: 500, message: "Internal server error", err }
	}
}
