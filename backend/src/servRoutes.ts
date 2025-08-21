import { FastifyInstance } from "fastify";
import { socketHandler } from "./game/socket";
import { ping, register, login } from "./auth/auth";
import { googleOauth } from "./auth/auth_provider";
import { generate2FA, verify2FA, is2faEnable } from "./auth/2fa";
import { request } from "http";
import { Script } from "vm";
import type { User } from "./types/db";
import db from "./db/db"
import { TokenExpiredError } from "jsonwebtoken";
import { verifyAuthToken, getUserByToken, signToken } from "./auth/auth_token";
import { getUserPrivate, getUserPublic, updateUsername, updateAvatar, updatePassword } from "./user/user"
import { getGamesHistory, getTournamentHistory, getPendingTournament, createTournament, finishTournament } from "./user/games"
import dotenv from "dotenv";
import { sign, verify } from "crypto";
import { verifyToken } from "node-2fa";
import fastifyOauth2 from "@fastify/oauth2";

dotenv.config();

const gAdress = process.env.ADRESS
const gPortBack = process.env.PORT_BACK;
const gPortFront = process.env.PORT_FRONT;


// CE fichier sert simplement a prendre toutes les API
export async function servRoutes(fastify: FastifyInstance)
{
	// // J'ai donné ici à titre d'exemple en gros c'est la structure attendue
	// fastify.post("/api/users/register", async (req, reply) => {
	// 	const { email, password } = req.body as any;
	// 	const result = await checkUserExist(email, password);
	// 	reply.send(result);
	// });

	// /// Ca donne quelque chose comme :
	// fastify.post("/api/etc", async (req, reply) => { // req = le full objet que je recupere donc le protocole HTTP || reply = l'objet que je renvoie (generalement un JSON)
	// 	const {params1, params2} = req.body as any; // params1/2/3/etc = les objets que je recupere du body de la requete
	// 	const result = await maFonction(params1, params2) // Ces params ce sont ceux que j'utilise dans ma fonction qui se trouve dans son emplacement
	// 	reply.send(result); // c'est le return de ma fonction en gros
	// })

	fastify.get("/ping", async (request, reply) => {
		const result = await ping();
		reply.send(result);
	});

	fastify.post("/register", async (request, reply) => {
		const { username, email, password } = request.body as any;
		const result = await register(username, email, password);
		if (typeof result.token === "string") {
			reply.clearCookie("token", { path: '/' });

			reply.cookie("token", result.token, {
				httpOnly: true,
				secure: false,
				sameSite: 'lax',
				path: '/',
				maxAge: 15 * 60 * 1000
			});
		}
		reply.send(result);
	});

	fastify.post("/login", async (request, reply) => {
		const { email, password } = request.body as any;
		const result = await login(email, password);
		if (typeof result.token === "string") {
			reply.clearCookie("token", { path: '/' });

			reply.cookie("token", result.token, {
				httpOnly: true,
				secure: false,
				sameSite: 'lax',
				path: '/',
				maxAge: 15 * 60 * 1000
			});
		}
		reply.send(result);
	});

	fastify.get("/auth/google/callback", async (request, reply) => {
		try {
			const result = await googleOauth(request, reply, fastify);

			if (result.statusCode !== 200) {
				return reply.status(result.statusCode).send({ error: result.message });
			}

			const { email } = result as { email: string; statusCode: number; message: string };

			if (!email) {
				return reply.send({ statusCode: 404, error: "Email is missing" });
			}

			const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as User;

			const token = signToken({ id: user.id, email: user.email ?? '', twofa_enable: user.twofa_enable ?? false});
			if (!token) {
				return reply.send({ statusCode: 400, error: "Can not create token" });
			}

			reply.clearCookie("token", { path: '/' });

			reply.cookie("token", token, {
				httpOnly: true,
				secure: false, // Changez à true en production avec HTTPS
				sameSite: 'lax',
				path: '/',
				maxAge: 15 * 60 * 1000
			});
			reply.redirect(`http://localhost:5173/2fa`);
		} catch (error) {
			console.error("Google OAuth callback error:", error);
			return reply.send({ statusCode: 500, error: "Authentication failed" });
		}
	});

	fastify.post("/auth/2fa/generate", {preHandler: [verifyAuthToken]}, async (request, reply) => {
		try {
			const user = (request as any).user;
			if (!user || !user.email) {
				return reply.send({statusCode: 400,  error: "User information missing" });
			}

			const result = await generate2FA(user.email);
			reply.send(result);
		} catch (error) {
			console.error("2FA Generation error:", error);
			return reply.send({statusCode: 500,  error: "Failed to generate 2FA" });
		}
	});

	fastify.post("/auth/2fa/verify", {preHandler: [verifyAuthToken]}, async (request, reply) => {
		try {
			const { input } = request.body as any;
			if (!input) {
				return reply.send({statusCode: 400,  error: "2FA code is required" });
			}

			const user = (request as any).user;
			if (!user || !user.email) {
				return reply.send({statusCode: 400,  error: "User information missing" });
			}

			const result = await verify2FA(user.email, input);

			reply.clearCookie("token", { path: '/' });

			reply.cookie("token", result.token || "", {
				httpOnly: true,
				secure: false,
				sameSite: 'lax',
				path: '/',
				maxAge: 4 * 60 * 60 * 1000
			});
			reply.send(result);
		} catch (error) {
			console.error("2FA Verification error:", error);
			return reply.send({statusCode: 500,  error: "Failed to verify 2FA" });
		}
	});

	fastify.get("/auth/2fa/check", {preHandler: verifyAuthToken}, async (request, reply) => {
		const token = request.cookies.token;
		if (typeof token !== "string") {
			return reply.send({statusCode: 400, error: "Token is missing or invalid." });
		}

		const userResult = await getUserByToken(token);
		if (typeof userResult !== "string") {
			return reply.send({statusCode: 400, error: "User not found"});
		}

		const email = userResult;
		const tfa = db.prepare(`SELECT twofa_enable FROM users WHERE email = ?`).get(email);
		return reply.send({statusCode: 200, message: "Success", value: tfa});
	});

	// Endpoint temporaire pour nettoyer les cookies (à supprimer en production)
	fastify.post("/auth/clear-cookies", async (request, reply) => {
		reply.clearCookie("token", { path: '/' });
		return reply.send({ message: "Cookies cleared" });
	});

	fastify.get("/api/get/user/private", {preHandler: [verifyAuthToken]}, async (request, reply) => {
		const token = request.cookies.token;
		const result = await getUserPrivate(token || "");
		return reply.send(result);
	});

	fastify.post("/api/get/user/public", {preHandler: [verifyAuthToken]}, async (request, reply) => {
		const { id } = request.body as any;
		const token = request.cookies.token;
		const result = await getUserPublic(id || 0);
		return reply.send(result);
	});

	fastify.get("/api/get/game/history", {preHandler: [verifyAuthToken]}, async (request, reply) => {
		const token = request.cookies.token;
		const result = await getGamesHistory(token || "");
		return reply.send(result);
	});

	fastify.patch("/api/update/user/username", {preHandler: [verifyAuthToken]}, async (request, reply) => {
		const token = request.cookies.token;
		const { username } = request.body as any;
		const result = await updateUsername(username, token || "")
		return reply.send(result);
	});

	fastify.patch("/api/update/user/avatar", {preHandler: [verifyAuthToken]}, async (request, reply) => {
		const token = request.cookies.token;
		const { avatar } = request.body as any;
		const result = await updateAvatar(avatar, token  || "")
		return reply.send(result);
	});

	fastify.patch("/api/update/user/password", {preHandler: [verifyAuthToken]}, async (request, reply) => {
		const token = request.cookies.token;
		const { newPass, oldPass, confirmPass } = request.body as any;
		const result = await updatePassword(oldPass, newPass, confirmPass, token || "")
		return reply.send(result);
	});

	fastify.get("/api/get/tournament/history", {preHandler: [verifyAuthToken]}, async (request, reply) => {
		const result = await getTournamentHistory();
		return reply.send(result);
	});

	fastify.get("/api/get/tournament/pending", {preHandler: [verifyAuthToken]}, async (request, reply) => {
		const result = await getPendingTournament();
		return reply.send(result);
	});

	fastify.post("/api/create/tournament", {preHandler: [verifyAuthToken]}, async (request, reply) => {
		const {name , nbrPlayer } = request.body as any;
		const token = request.cookies.token;
		const result = await createTournament(name, nbrPlayer, token || "");
		return reply.send(result);
	});

	fastify.post("/api/update/tournament", {preHandler: [verifyAuthToken]}, async (request, reply) => {
		const {playerIdWon, tournamentId} = request.body as any;
		const result = await finishTournament(playerIdWon, tournamentId);
		return reply.send(result);
	});


	// Gere Socket
	console.log("🔧 Enregistrement du gestionnaire WebSocket...");
	socketHandler(fastify);
	console.log("✅ Gestionnaire WebSocket enregistré");

}

