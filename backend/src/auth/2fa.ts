import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import dotenv from "dotenv";
import * as twofactor from "node-2fa";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import type { User } from "../types/db";
import type { Generate2FAResponse } from "../types/auth"
import db from "../db/db"
import { signToken, verifyToken} from "../auth/auth_token"



export async function generate2FA(username: string) {
	if (!username) {
		return {statusCode: 401, message: "Invalid credential"};
	}


	const newSecret = twofactor.generateSecret({name: "ft_transcendence", account: username});

	const result: Generate2FAResponse = {
		secret: newSecret.secret,
		qr: newSecret.uri ?? "",
		uri: newSecret.qr,
	};

	try {
		db.prepare('UPDATE users SET twofa_secret = ? WHERE username = ?').run(result.secret, username);
		return { statusCode: 200, data: result };
	} catch (err) {
		console.error("Error generating 2FA:", err);
		return {statusCode: 500, message: String(err)};
	}
};

export async function verify2FA(username: string, input: string) {
	let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User;

	if (!user.twofa_secret) {
		return { statusCode: 404, message: "2fa not set for this user" };
	}

	const result = twofactor.verifyToken(user.twofa_secret, input);
	if (!result) {
		return { statusCode: 401, message: "Code invalid" };
	}

	const token = signToken({ id: user.id, username: user.username, twofa_enable: true });
	db.prepare('UPDATE users SET twofa_enable = ? WHERE username = ?').run(true, username);

	return { success: true, token };
}

export async function is2faEnable(username: string) {
	return db.prepare('SELECT twofa_enable FROM users WHERE username = ?').get(username);
}
