import { FastifyInstance } from "fastify";
import { WSRoutes } from "./game/wsRoutes";
import { ping, register, login } from "./auth/auth";
import { googleOauth } from "./auth/auth_provider";
import { generate2FA, verify2FA, is2faEnable } from "./auth/2fa";
import { request } from "http";
import { Script } from "vm";
import type { User } from "./types/db";
import db from "./db/db"
import { TokenExpiredError } from "jsonwebtoken";
import { verifyAuthToken } from "./auth/auth_token";


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
			reply.cookie("token", result.token, { httpOnly: true, secure: true });
		}
		reply.send(result);
	});

	fastify.post("/login", async (request, reply) => {
		const { email, password } = request.body as any;
		const result = await login(email, password);
		if (typeof result.token === "string") {
			reply.cookie("token", result.token, { httpOnly: true, secure: true });
		}
		reply.send(result);
	});

	fastify.get("/auth/google/callback", async (request, reply) => {
		try {
			const result = await googleOauth(request, reply, fastify);
			
			if (result.statusCode !== 200) {
				return reply.status(result.statusCode).send({ error: result.message });
			}

			const { token, username } = result as { token: string; username: string; statusCode: number; message: string };
			
			if (!username) {
				return reply.status(404).send({error: "Username is missing"});
			}
			
			if (!token) {
				return reply.status(400).send({ error: "Token is missing or invalid." });
			}

			reply.cookie("token", token, { httpOnly: true, secure: true });
			
			if (await is2faEnable(username)) {
				reply.redirect("http://127.0.0.1:5173/2fa");
			} else {
				reply.redirect("http://127.0.0.1:5173/2fa");
			}
		} catch (error) {
			console.error("Google OAuth callback error:", error);
			return reply.status(500).send({ error: "Authentication failed" });
		}
	});

	fastify.post("/auth/2fa/generate", {preHandler: [verifyAuthToken]}, async (request, reply) => {
		const { username } = request.body as any;
		const result = await generate2FA(username);
		reply.send(result);
	});

	fastify.post("/auth/2fa/verify", {preHandler: [verifyAuthToken]}, async (request, reply) => {
		const {username, input} = request.body as any;
		const result = await verify2FA(username, input);
		reply.send(result);
	});

	fastify.get("/api/auth/2fa/check", {preHandler: [verifyAuthToken]}, async (request, reply) => {
		const user = db.prepare('SELECT * FROM users WHERE username = ?').get(request.body as any) as User;
		if (!user) {
			return reply.status(404).send({error: "User not found"});
		}
		return {status: user.twofa_enable};
	});

	// Gere WS
	WSRoutes(fastify);
}
