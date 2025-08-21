import { FastifyInstance } from "fastify";
import { getGameRoom, getNextRoomId } from "./interface";
import * as cookie from "cookie";
import { WebSocket } from "@fastify/websocket";
import jwt from "jsonwebtoken";
import db from "../db/db";
import { setRoom } from "./interface";
import { initGameRoom } from "./initialisation";
import { updateGame, gameLoop } from "./logic"


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
	console.log("🚀 Initialisation du WebSocket handler");

	const getSocket = new Map<number, WebSocket>();
	const getId = new Map<WebSocket, number>();
	let matchmakingQueue: number = -1; // File d'attente pour le matchmaking
	let matchmaking = -1;

	// Route WebSocket avec Fastify
	fastify.get('/ws', { websocket: true }, (connection, req) => {
		console.log("🔌 Nouvelle tentative de connexion WebSocket");
		console.log("📋 Headers de la requête:", req.headers);

		const ws = connection;

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
		console.log(`🟢 Utilisateur connecté avec succès - ID: ${payload.id}, Email: ${payload.email}`);
		console.log(`📊 Nombre total de connexions actives: ${getSocket.size}`);

		// Envoyer un message de confirmation de connexion
		ws.send(JSON.stringify({
			type: "connection_confirmed",
			message: "WebSocket connection established successfully",
			userId: payload.id
		}));		} catch (err) {
			console.log("JWT invalide");
			ws.close(); // déconnecte la socket
			return;
		}

		// Gestion des messages front to back
		ws.on("message", (message: string) => {
			try {
				const data = JSON.parse(message);
				console.log("📦 Message reçu du client:", data); // Debug: voir tous les messages

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
					console.log("🎮 Game accepted - Mode:", data.mode, "From:", data.from);
					const idRoom = getNextRoomId();

					if (data.mode === "local" || data.mode === "AI") {
						console.log("🎯 Mode local/AI - création de la room:", idRoom);
						const gameRoom = initGameRoom(idRoom, data.from, data.from, data.mode);
						db.prepare("UPDATE users SET room_id = ? WHERE id = ?").run(idRoom, data.from);
						setRoom(idRoom, gameRoom);
						console.log("✅ Room locale créée avec succès, envoi roomId:", idRoom);
						ws.send(JSON.stringify({ type: "room_ready", roomId: idRoom }));
						return; // 🔴 IMPORTANT: sortir ici pour éviter l'exécution du code online
					}

					// Mode online (matchmaking) - ne s'exécute que si ce n'est PAS local/AI
					console.log("🌐 Mode online");
					const toSocket = getSocket.get(data.from);
					const idTo = getId.get(ws);
					if (!idTo) return;

					db.prepare("UPDATE users SET room_id = ? WHERE id = ?").run(idRoom, idTo);
					db.prepare("UPDATE users SET room_id = ? WHERE id = ?").run(idRoom, data.from);

					const gameRoom = initGameRoom(idRoom, data.from, idTo, data.mode);
					setRoom(idRoom, gameRoom);

					db.prepare(`INSERT INTO games (player_id_left, player_id_right, game_date) VALUES (?, ?, ?)`).run(data.from, idTo, new Date().toISOString());
					if (toSocket) {toSocket.send(JSON.stringify({ type: "room_ready", roomId: idRoom }));}
					ws.send(JSON.stringify({ type: "room_ready", roomId: idRoom }));

					gameRoom.gameState.is_running = true;
					gameLoop(gameRoom);
				}



				// Logique game
				if (data.type === "game_info") {
					console.log("📡 Demande game_info reçue pour room:", data.roomId);
					const gameRoom = getGameRoom(data.roomId);
					if (!gameRoom) {
						console.log("❌ Room non trouvée:", data.roomId);
						ws.send(JSON.stringify({ type: "error", message: "Game room not found" }));
						return;
					}
					const gameState = gameRoom.gameState;
					console.log("✅ Envoi game_update pour room:", data.roomId);
					ws.send(JSON.stringify({
						type: "game_update",
						gameState: gameState, // Correction: gameState au lieu de game
						mode: gameRoom.mode,
					}));
				}


				if (data.type === "move_paddle") {
					// recuperer les deux ws
					// check si c'est local ou IA, dans ce cas c'est simple on ne renvoie qu'à ws
					// Meme si j'ai deja ws, pour assurer on va aller chercher les deux sockets manuellement

					const gameRoom = getGameRoom(data.roomId);
					if (!gameRoom) return ;

					const fromId = getId.get(ws);
					updateGame(gameRoom, fromId, data.direction, data.movement);
				}


				if (data.type === "reconnect") {
					const gameRoom = getGameRoom(data.roomId);
					if (!gameRoom || (gameRoom.player1.id_player !== data.fromId && gameRoom.player2.id_player !== data.fromId)) {
						ws.send(JSON.stringify({ type: "error", message: "Error trying to reconnect to the game" }));
					} else {
						ws.send(JSON.stringify({type: "room_ready", roomId: data.roomId}))
					}
				}

				if (data.type === "matchmaking") {
					console.log("🎲 Demande de matchmaking de l'utilisateur:", data.from);

					if (matchmakingQueue === -1) {
						matchmakingQueue = data.from;
						console.log("User : ", data.from, "ajouté à la file d'attente");
						ws.send(JSON.stringify({
							type: "matchmaking_waiting",
							message: "Recherche d'un adversaire..."
						}));
					} else {
						console.log("Match trouvé! Joueur 1:", matchmakingQueue, "vs Joueur 2:", data.from);

						const idRoom = getNextRoomId();
						const toSocket = getSocket.get(matchmakingQueue);
						const player1Id = matchmakingQueue;
						const player2Id = data.from;

						// Mise à jour de la DB
						db.prepare("UPDATE users SET room_id = ? WHERE id = ?").run(idRoom, player1Id);
						db.prepare("UPDATE users SET room_id = ? WHERE id = ?").run(idRoom, player2Id);

						// Création de la room
						const gameRoom = initGameRoom(idRoom, player1Id, player2Id, "online");
						setRoom(idRoom, gameRoom);

						// Insertion en DB
						db.prepare(`INSERT INTO games (player_id_left, player_id_right, game_date) VALUES (?, ?, ?)`).run(player1Id, player2Id, new Date().toISOString());

						// Notification aux deux joueurs
						if (toSocket) {
							toSocket.send(JSON.stringify({ type: "room_ready", roomId: idRoom }));
						}
						ws.send(JSON.stringify({ type: "room_ready", roomId: idRoom }));

						// Reset de la queue
						matchmakingQueue = -1;
						console.log("✅ Room online créée avec succès, ID:", idRoom);
					}
				}



			} catch (err) {
				console.error("Message invalide :", err);
			}
		});

		// Gestion de la déconnexion
		ws.on("close", (code: number, reason: string) => {
			const userId = getId.get(ws);
			console.log(`🔌 WebSocket fermée - Code: ${code}, Raison: ${reason}, User ID: ${userId}`);
			if (userId) {
				getSocket.delete(userId);
				getId.delete(ws);
				console.log(`📊 Nombre total de connexions actives: ${getSocket.size}`);
			}
		});

		// Gestion des erreurs de socket
		ws.on("error", (error: any) => {
			const userId = getId.get(ws);
			console.error("🔴 Erreur WebSocket pour l'utilisateur ID:", userId || "inconnu");
			console.error("📝 Détails de l'erreur:", error);
		});

	});

	console.log("✅ WebSocket handler initialisé avec succès");
}
