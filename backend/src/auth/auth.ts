import fastify from "fastify";
import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../db/db';
import cors from '@fastify/cors';
import { METHODS } from "http";
import { REPL_MODE_SLOPPY } from "repl";
import { FastifyInstance } from "fastify";
import { signToken } from './auth_token';
import { verifyAuth } from './auth_token';
import { error } from "console";
import { brotliCompressSync } from "zlib";
import { User } from '../types/db';

dotenv.config();

const app = fastify({
	logger: true
});

/* app.register(cors, {
	origin: true,
	methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
	credential: true,
	allowedHeaders: ['Content-Type', 'Authorization']
}); */

export function ping() {
	return {message: 'pong'};
};

export async function register(username:string, mail:string, password:string) {
	if (!username || !mail || !password) {
		return { statusCode: 400, message: "Missing required fields" };
	}

	const passwordHash = await bcrypt.hash(password, 10);
	
	// TODO password policy
	// TODO handling DB error

	try {
		db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(username, mail, passwordHash);
		return { statusCode: 200, message: "User Succefully register"}
	} catch (err) {
		console.error(err)
		return { statusCode: 400, message: "Bad request" };
	}
};

export async function login(mail:string, password:string) {
	if (!mail || !password) {
		return { statusCode: 400, message: "Missing required fields" };
	}

	const user = db.prepare('SELECT * FROM users WHERE email = ?').get(mail) as User;
	if (!user) {
		return { statusCode: 401, message: "Invalid credentials" }
	}

	const verify = await bcrypt.compare(password, user.password_hash || '');
	if (!verify) {
		return { statusCode: 401, message: "Invalid credentials" };
	}

	const jwtsecret = process.env.JWT_SECRET;
	if (!jwtsecret) {
		throw new Error('JWT_SECRET environment variable is not set');
	}

	const token = signToken({ id: user.id, username: user.username });
	console.log("Success login");
	return {token};
};
