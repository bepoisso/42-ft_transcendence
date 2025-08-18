import jwt from 'jsonwebtoken';
import fastify from "fastify";

import { FastifyRequest, FastifyReply } from 'fastify';

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

export function verifyAuthToken(request:FastifyRequest, reply: FastifyReply, done: Function) {


	try {
		const token = request.cookies.token;
		if (!token) {
			throw new Error('Token is missing');
		}
		const jwtsecret = process.env.JWT_SECRET;
		if (!jwtsecret) {
			throw new Error('JWT_SECRET evironement variable is not set');
		}
		const decoded = jwt.verify(token, jwtsecret) as {id: number; email:string, twofa_enable: boolean};

		(request as any).user = decoded;

		if (!decoded.twofa_enable) {
			const allowedFor2FA = ['/auth/2fa/generate', '/auth/2fa/verify', '/auth/2fa/check'];
			if (!allowedFor2FA.includes(request.url)) {
				return reply.status(403).send({ error: 'Two-Factor Authentication required' });
			}
		}

		done();
	} catch (err) {
		return reply.status(401).send({error: 'Invalid or expired token'});
	}
};
