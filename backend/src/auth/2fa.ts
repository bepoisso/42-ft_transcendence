import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import dotenv from "dotenv";
import * as twofactor from "node-2fa";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import type { User } from "../types/db";
import type { Generate2FAResponse } from "../types/auth"
import db from "../db/db"
import { signToken, verifyAuthToken} from "../auth/auth_token"
import { logToELK } from "../elk";



export async function generate2FA(email: string) {
	if (!email) {
		await logToELK('warning', 'email not found', { function: 'generate2FA', reason: 'invalid_credential', email: email});
		return {statusCode: 401, message: "Invalid credential"};
	}

	// Vérifier si l'utilisateur a déjà un secret 2FA
	const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User;
	if (!user) {
		await logToELK('warning', 'user not found', { function: 'generate2FA', reason: 'invalid_credential', email: email});
		return {statusCode: 404, message: "User not found"};
	}

	// Si l'utilisateur a déjà un secret et que 2FA est activé, retourner une erreur
	if (user.twofa_secret && user.twofa_enable) {
		return {statusCode: 400, message: "2FA already enabled for this user"};
	}

	const newSecret = twofactor.generateSecret({name: "ft_transcendence", account: email});

	const result: Generate2FAResponse = {
		secret: newSecret.secret,
		qr: newSecret.uri ?? "",
		uri: newSecret.qr,
	};

	try {
		db.prepare('UPDATE users SET twofa_secret = ? WHERE email = ?').run(result.secret, email);
		return { statusCode: 200, data: result };
	} catch (err) {
		await logToELK('error', '', {
			function: 'generate2FA',
			reason: 'invalid_credential'
		});
		return {statusCode: 500, message: String(err)};
	}
};

export async function verify2FA(email: string, input: string) {
	let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User;

	if (!user) {
		await logToELK('warning', 'User not found', { function: 'verify2FA', reason: 'user not in SQL', email: email});
		return { statusCode: 404, message: "User not found" };
	}

	if (!user.twofa_secret) {
		await logToELK('warning', '2FA not set for the user', {function: 'verify2FA', reason: 'first time login', email: email});
		return { statusCode: 404, message: "2fa not set for this user" };
	}

	const result = twofactor.verifyToken(user.twofa_secret, input);
	if (!result) {
		await logToELK('warning', 'Code invalide', { function: 'verify2FA', reason: 'invalid code', email: email });
		return { statusCode: 401, message: "Code invalid" };
	}

	try {

		db.prepare('UPDATE users SET twofa_enable = ? WHERE id = ?').run(1, user.id);
		const token = signToken({ id: user.id, email: user.email ?? '', twofa_enable: true });
		await logToELK('success', 'valid input', { function: 'verify2FA', reason: 'valid code', email: email });
		return { statusCode: 200, message: "Success", token };
	} catch (err) {
		await logToELK('error', 'SQL error', { function: 'verify2FA', reason: 'invalid_credential', email: email});
		return { statusCode: 500, message: "SQL errror" };
	}
}

export async function is2faEnable(email: string) {
	return db.prepare('SELECT twofa_enable FROM users WHERE email = ?').get(email);
}
