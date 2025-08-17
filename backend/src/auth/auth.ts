import fastify from "fastify";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../db/db';
import cors from '@fastify/cors';
import { METHODS } from "http";
import { REPL_MODE_SLOPPY } from "repl";
import { FastifyInstance } from "fastify";
import { signToken } from './auth_token';
import { verifyToken } from './auth_token';
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

export async function register(username:string, email:string, password:string) {
	if (!username || !email || !password) {
		return { statusCode: 400, message: "Missing required fields" };
	}

	// Password email username policy
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const usernameRegex = /^[a-zA-Z0-9]{3,}$/;
	if (!passwordRegex.test(password) || !emailRegex.test(email) || !usernameRegex.test(username)) {
		return { statusCode: 401, message: "Invalid credential" };
	}

	// Hash password
	const passwordHash = await bcrypt.hash(password, 10);

	try {
		db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email, passwordHash);
		return { statusCode: 200, message: "User Succefully register"};
	} catch (err) {
		console.error(err);
		return { statusCode: 400, message: "Bad request" };
	}
};

export async function login(email:string, password:string) {
	if (!email || !password) {
		return { statusCode: 400, message: "Missing required fields" };
	}

	const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User;
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

	const token = signToken({ id: user.id, username: user.username, twofa_enable: user.twofa_enable ?? false });
	return {token};
};

export async function loginOrCreateGoogleUser(email: string, username: string, googleId: string) {
	if (!email || !username || !googleId) {
		return { statusCode: 400, message: "Missing required fields from Google" };
	}

	try {
		let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User;

		// If user doesn't exist create it
		if (!user) {
			// Generate a random pasword
			const randomPassword = Math.random().toString(36).slice(-10);
			const passwordHash = await bcrypt.hash(randomPassword, 10);

			db.prepare('INSERT INTO users (username, email, password_hash, google_id) VALUES (?, ?, ?, ?)').run(
				username, email, passwordHash, googleId);

			user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User;

			if (!user) {
				return { statusCode: 500, message: "Failed to create user" };
			}
		}
		// If user exists but dosen't have a google_id in db, update it
		else if (!user.google_id) {
			db.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(googleId, user.id);
		}

		const token = signToken({ id: user.id, username: user.username, twofa_enable: user.twofa_enable ?? false});

		return {
			statusCode: 200,
			message: "Successfully authenticated with Google",
			token,
			username
		};
	} catch (err) {
		console.error(err);
		return { statusCode: 500, message: "Internal server error" };
	}
};
