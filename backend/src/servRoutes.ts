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
import { verifyAuthToken, getUserByToken } from "./auth/auth_token";
import dotenv from "dotenv";

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
				reply.redirect(`${gAdress}:${gPortFront}/2fa`);
			} else {
				reply.redirect(`${gAdress}:${gPortFront}/2fa`);
			}
		} catch (error) {
			console.error("Google OAuth callback error:", error);
			return reply.status(500).send({ error: "Authentication failed" });
		}
	});

	fastify.post("/auth/2fa/generate", {preHandler: [verifyAuthToken]}, async (request, reply) => {
		const token = request.cookies.token;
		if (typeof token !== "string") {
			return reply.status(400).send({ error: "Token is missing or invalid." });
		}
		interface GetUserByTokenResult extends User {}
		const user: GetUserByTokenResult = await getUserByToken(token) as GetUserByTokenResult;
		if (!user.email || typeof user.email !== "string") {
			return reply.status(400).send({ error: "User email is missing or invalid." });
		}
		const result = await generate2FA(user.email);
		reply.send(result);
	});

	fastify.post("/auth/2fa/verify", {preHandler: [verifyAuthToken]}, async (request, reply) => {
		const {input} = request.body as any;
		const token = request.cookies.token;
		if (typeof token !== "string") {
			return reply.status(400).send({ error: "Token is missing or invalid." });
		}
		interface GetUserByTokenResult extends User {}
		const user: GetUserByTokenResult = await getUserByToken(token) as GetUserByTokenResult;
		if (!user.email || typeof user.email !== "string") {
			return reply.status(400).send({ error: "User email is missing or invalid." });
		}
		const result = await verify2FA(user.email, input);
		reply.send(result);
	});

	fastify.get("/auth/2fa/check", {preHandler: [verifyAuthToken]}, async (request, reply) => {
		const token = request.cookies.token;
		if (typeof token !== "string") {
			return reply.status(400).send({ error: "Token is missing or invalid." });
		}
		interface GetUserByTokenResult extends User {}
		const user: GetUserByTokenResult = await getUserByToken(token) as GetUserByTokenResult;
		if (!user) {
			return reply.status(404).send({error: "User not found"});
		}
		return {statusCode: 200, message: "Success", value: user.twofa_enable};
	});


	// Gere Socket
	socketHandler(fastify);

}
