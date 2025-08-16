import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import dotenv from "dotenv";
import twofactor from "node-2fa";
import bd from "../db/db";
import { STATUS_CODES } from "http";
import { REPL_MODE_SLOPPY } from "repl";


export async function generate2FA(username: string) {
	const newSecret = twofactor.generateSecret({name: "ft_transcendence", account: username});

	const result: Generate2FAResponse = {
		secret: newSecret.secret,
		qr: newSecret.qr ?? "",
		uri: newSecret.uri,
	};

	try {
		bd.prepare('UPDATE users SET 2fa_secret = ?, 2fa_enable = ? WHERE username = ?').run(result.secret, true, username);
		return result;
	} catch (err) {
		return {statusCode: 500, message: "Internal server error"};
	}
};

export async function verify2FA(username: string, input: string) {
	const row = bd.prepare('SELECT 2fa_secret FROM users WHERE username = ?').get(username) as { '2fa_secret': string } | undefined;
	const secret = row ? row['2fa_secret'] : null;

	if (!secret) {
		return { statusCode: 404, message: "2fa not set for this user" };
	}

	const result = twofactor.verifyToken(secret, input);
	if (!result) {
		return { statusCode: 401, message: "Code invalid" };
	}

	return { success: true };
}

export async function is2faEnable(username: string) {
	return bd.prepare('SELECT 2fa_enable FROM users WHERE username = ?').get(username);
}
