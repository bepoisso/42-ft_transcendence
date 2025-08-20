import { FastifyInstance } from "fastify";
import { getGameRoom, getNextRoomId } from "./interface";
import cookie from "cookie";
import { WebSocket } from "@fastify/websocket";
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import db from "../db/db";
import { setRoom } from "./interface";
import { initGameRoom } from "./initialisation";


/*
	io.on = reçoit une nouvelle co

	socket.on = reçoit un evenement spécifique d'un client
	socket.emit = envoie un evenement à un client
	socket.join = ajoute la socket a la une room
	socket.leave = detache la socket de la room

	io.to(some1) = envoie a some1
	io.emit = envoie a tout le monde

*/


export async function socketHandler(fastify: FastifyInstance)
{
	const wss = new WebSocketServer({ server: fastify.server });

	const getSocket = new Map<number, WebSocket>();
	const getId = new Map<WebSocket, number>();

	wss.on("connection", async (ws, req) => {

		const cookies = cookie.parse(req.headers.cookie || "");
		const token = cookies["token"];

		try {
			if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
			if (!token) throw new Error("Token is missing");

			const payload = jwt.verify(token, process.env.JWT_SECRET) as {
				id: number;
				email: string;
				twofa_enable: boolean;
			};

			getSocket.set(payload.id, ws);
			getId.set(ws, payload.id);
			console.log(`Utilisateur connecté : ${payload.id}`);

		} catch (err) {
			console.log("JWT invalide");
			ws.close(); // déconnecte la socket
			return;
		}

		// Gestion des messages front to back
		ws.on("message", (message: string) => {
			try {
				const data = JSON.parse(message);

				//implementer chaque logique
				if (data.type === "game_send_invite") {
					const fromId = getId.get(ws);
					const toSocket = getSocket.get(data.to);
					const fromUser = db.prepare("SELECT username FROM users WHERE id = ?").get(fromId);

					if (toSocket && fromId !== undefined) {
					// Envoie un message JSON au destinataire
						toSocket.send(JSON.stringify({
							type: "game_receive_invite",
							from: fromId,
							from_name: fromUser
						}));
					}
				}

				if (data.type === "friend_send_invite") {
					const fromId = getId.get(ws);
					const toSocket = getSocket.get(data.to);
					const fromUser = db.prepare("SELECT username FROM users WHERE id = ?").get(fromId);

					if (toSocket && fromId !== undefined) {
					// Envoie un message JSON au destinataire
						toSocket.send(JSON.stringify({
							type: "friend_receive_invite",
							from: fromId,
							from_name: fromUser
						}));
					}
				}

				if (data.type === "friend_accepted") {
					const idFrom = data.from;
					const idTo = getId.get(ws);
					// utiliser la fonction de benj qui va recupérer les données d'un utilisateur selon son id
					// ajouter chaque utilisateur a sa table correspondante avec les infos fetch
				}

				if (data.type === "game_accepted") {
					const idRoom = getNextRoomId();

					const toSocket = getSocket.get(data.from);
					if (data.mode === "local" || data.mode === "AI") {

						const gameRoom = initGameRoom(idRoom, data.from, data.from, data.mode); // probleme ici on va avoir le meme nom pour les deux joueurs
						db.prepare("UPDATE users SET room_id = ? WHERE id = ?").run(idRoom, data.from);
						setRoom(idRoom, gameRoom);
						// est ce que on doit le faire dans ce cas si ? db.prepare(`INSERT INTO games (player_id_left, player_id_right, room_id, game_date) VALUES (?, ?, ?, ?)`).run(data.from, idTo, idRoom, new Date().toISOString());
						ws.send(JSON.stringify({ type: "room_ready", roomId: idRoom }));
					}

					const idTo = getId.get(ws);
					if (!idTo) return;

					db.prepare("UPDATE users SET room_id = ? WHERE id = ?").run(idRoom, idTo);
					db.prepare("UPDATE users SET room_id = ? WHERE id = ?").run(idRoom, data.from);

					const gameRoom = initGameRoom(idRoom, data.from, idTo, data.mode);

					setRoom(idRoom, gameRoom);

					db.prepare(`INSERT INTO games (player_id_left, player_id_right, room_id, game_date) VALUES (?, ?, ?, ?)`).run(data.from, idTo, idRoom, new Date().toISOString());
					if (toSocket) {toSocket.send(JSON.stringify({ type: "room_ready", roomId: idRoom }));}
					ws.send(JSON.stringify({ type: "room_ready", roomId: idRoom }));
				}



				// Logique game
				if (data.type === "game_info") {
					const gameRoom = getGameRoom(data.roomId);
					if (!gameRoom) return ;
					const gameState = gameRoom.gameState;
					ws.send(JSON.stringify({
						type: "game_update",
						game: gameState,
						mode: gameRoom.mode,
					}));
				}








			} catch (err) {
				console.error("Message invalide :", err);
			}
		});


	});
}
