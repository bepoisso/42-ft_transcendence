import jwt from 'jsonwebtoken';
import fastify from "fastify";
import db from "../db/db"
import { FastifyRequest, FastifyReply } from 'fastify';
import type { User } from "../types/db";
import cookies from "@fastify/cookie"

export function signToken(user: { id: number; email: string; twofa_enable: boolean }): string {
	const jwtsecret = process.env.JWT_SECRET;
	if (!jwtsecret) {
		throw new Error('JWT_SECRET evironement variable is not set');
	}
	const payload = { id: user.id, email: user.email, twofa_enable: user.twofa_enable };

	if (user.twofa_enable) {
		return jwt.sign(payload, jwtsecret, { expiresIn: '4h' });
	} else {
		return jwt.sign(payload, jwtsecret, { expiresIn: '15m' });

	}
};

export async function verifyAuthToken(request: FastifyRequest, reply: FastifyReply) {
	try {
		const token = request.cookies.token;
		if (!token) {
			reply.send({statusCode: 401, error: 'Token is missing' });
			console.log("TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", request);
			return;
		}

		const jwtsecret = process.env.JWT_SECRET;
		if (!jwtsecret) {
			reply.send({statusCode: 500, error: 'Server configuration error' });
			return;
		}

		const decoded = jwt.verify(token, jwtsecret) as {id: number; email:string, twofa_enable: boolean};
		(request as any).user = decoded;

		console.log("🔐 Token décodé:", { id: decoded.id, email: decoded.email, twofa_enable: decoded.twofa_enable });
		console.log("🌐 URL demandée:", request.url);

		if (!decoded.twofa_enable) {
			console.log("⚠️  2FA non activé, vérification des URLs autorisées...");
			const allowedFor2FA = ['/auth/2fa/generate', '/auth/2fa/verify', '/auth/2fa/check'];
			if (!allowedFor2FA.includes(request.url)) {
				console.log("❌ URL non autorisée sans 2FA");
				reply.send({ statusCode:403, error: 'Two-Factor Authentication required' });
				return;
			}
		} else {
			console.log("✅ 2FA activé, accès autorisé");
		}
	} catch (err) {
		reply.send({statusCode: 401 ,error: 'Invalid or expired token'});
		return;
	}
};


export async function getUserByToken(token: string) {
	try {
		if (!token) {
			throw new Error('Token is missing');
		}
		const jwtsecret = process.env.JWT_SECRET;
		if (!jwtsecret) {
			throw new Error('JWT_SECRET evironement variable is not set');
		}
		const decoded = jwt.verify(token, jwtsecret) as {id: number; email:string, twofa_enable: boolean};
		const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(decoded.id) as User;
		return user.email;
	} catch (err) {
		console.log("ERROR: ", err);
		return { statusCode: 404, message: "User not found or token invalid"};
	}
};
