import { FastifyInstance } from "fastify";
import { GameRoom, getGameRoom, getNextRoomId, WIDTH, HEIGHT } from "../game/interface";
import * as cookie from "cookie";
import { WebSocket } from "@fastify/websocket";
import jwt from "jsonwebtoken";
import db from "../db/db";
import { setRoom } from "../game/interface";
import { initGameRoom } from "../game/initialisation";
import { updateGame, gameLoop } from "../game/logic"
import { friend_accepted, friend_send_invite, refuse_friend_invite } from "./friend";
import { Algo, Clock } from "../game/algo";


/*
	io.on = reçoit une nouvelle co

	socket.on = reçoit un evenement spécifique d'un client
	socket.emit = envoie un evenement à un client
	socket.join = ajoute la socket a la une room
	socket.leave = detache la socket de la room

	io.to(some1) = envoie a some1
	io.emit = envoie a tout le monde

*/
export const getSocket = new Map<number, WebSocket>();
export const getId = new Map<WebSocket, number>();
let matchmakingQueue: number = -1;

export async function socketHandler(fastify: FastifyInstance)
{

	// Route WebSocket avec Fastify
	fastify.get('/ws', { websocket: true }, (connection, req) => {

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

			// Il faut update le statut isConnected a 1
			try {
				db.prepare("UPDATE users SET is_connected = 1 WHERE id = ?").run(payload.id);
			} catch (dbError) {
				console.error("Erreur mise à jour statut connexion:", dbError);
			}

			//Ici on va gérer les demandes d'amis en attente
			const pendingRequests = db.prepare(`
				SELECT f.*, u.username, u.avatar_url
				FROM friends f
				JOIN users u ON f.user_id = u.id
				WHERE f.friend_id = ? AND f.status = 'pending'
			`).all(payload.id);

			if (pendingRequests.length > 0) {
				pendingRequests.forEach((request: any) => {
					ws.send(JSON.stringify({
						type: "friend_receive_invite",
						from: request.user_id,
					}));
				});
			}

			// Envoyer un message de confirmation de connexion
			ws.send(JSON.stringify({
				type: "connection_confirmed",
				message: "WebSocket connection established successfully",
				userId: payload.id
			}));

		} catch (err) {
			ws.close();
			return;
		}

		// Gestion des messages front to back
		ws.on("message", (message: string) => {
			try {
				const data = JSON.parse(message);


				//Ici, implementer de chaque logique

				if (data.type === "game_send_invite") {
					const fromId = getId.get(ws);
					const toSocket = getSocket.get(data.to);
					const fromUser = db.prepare("SELECT username FROM users WHERE id = ?").get(fromId) as any;

					if (toSocket && fromId !== undefined) {
					// Envoie un message JSON au destinataire
						toSocket.send(JSON.stringify({
							type: "game_receive_invite",
							from: fromId,
							from_name: fromUser.username
						}));
					}
				}

		// ---------------- FRIENDS LOGIC -------------------
				if (data.type === "friend_send_invite") {
					const fromId = getId.get(ws);
					const socket = getSocket.get(fromId!);
					friend_send_invite(socket!, data);
				}

				if (data.type === "accept_friend_invite") {
					const fromId = getId.get(ws);
					const socket = getSocket.get(fromId!);
					friend_accepted(socket!, data);
				}


				if (data.type === "refuse_friend_invite") {
					const fromId = getId.get(ws);
					const socket = getSocket.get(fromId!);
					refuse_friend_invite(socket!, data);
				}


				if (data.type === "game_accepted") {
					const idRoom = getNextRoomId();

					if (data.mode === "local" || data.mode === "ai") {
						const gameRoom = initGameRoom(idRoom, data.from, data.from, data.mode, 0);
						db.prepare("UPDATE users SET room_id = ? WHERE id = ?").run(idRoom, data.from);

						(gameRoom as any).sockets = [ws];
						setRoom(idRoom, gameRoom);

						if (data.mode == "ai") {
							gameRoom.gameState.ia = new Algo(HEIGHT / 2, WIDTH / 2, gameRoom.gameState.player1.paddle.height, HEIGHT);
							gameRoom.gameState.clock = new Clock();
							gameRoom.gameState.player2.username = "AI";
						}

						gameRoom.gameState.is_running = true;

						(gameRoom as any).interval = setInterval(() => {
							gameLoop(gameRoom);

							if (ws.readyState === 1) {
								ws.send(JSON.stringify({
									type: "game_update",
									gameState: gameRoom.gameState,
									mode: gameRoom.mode,
									perspective: "player1"
								}));
							}
						}, 30);

						ws.send(JSON.stringify({ type: "room_ready", roomId: idRoom }));
						return;
					}

					// Mode online (matchmaking) - ne s'exécute que si ce n'est PAS local/AI
					const toSocket = getSocket.get(data.from);
					const idTo = getId.get(ws);
					if (!idTo) return;

					db.prepare("UPDATE users SET room_id = ? WHERE id = ?").run(idRoom, idTo);
					db.prepare("UPDATE users SET room_id = ? WHERE id = ?").run(idRoom, data.from);

					const gameRoom = initGameRoom(idRoom, data.from, idTo, data.mode, 0);
					(gameRoom as any).sockets = [toSocket, ws];
					setRoom(idRoom, gameRoom);

					// recuperer directement le nom des joueurs pour tout envoyer à la db
					const left_username_data = db.prepare("SELECT username FROM users WHERE id = ?").get(data.from) as { username?: string } | undefined;
					const right_username_data = db.prepare("SELECT username FROM users WHERE id = ?").get(idTo) as { username?: string } | undefined;
					const left_username = left_username_data?.username;
					const right_username = right_username_data?.username;
					db.prepare(`INSERT INTO games
						(player_id_left, username_left, player_id_right, username_right, game_date)
						VALUES (?, ?, ?, ?, ?)`).run(data.from, left_username, idTo, right_username, new Date().toISOString());
					if (toSocket) {toSocket.send(JSON.stringify({ type: "room_ready", roomId: idRoom }));}
					ws.send(JSON.stringify({ type: "room_ready", roomId: idRoom }));

					gameRoom.gameState.is_running = true;
				}



				// Logique game
				if (data.type === "game_info") {
					// console.log("📡 Demande game_info reçue pour room:", data.roomId);
					const gameRoom = getGameRoom(data.roomId);
					if (!gameRoom) {
						// console.log("❌ Room non trouvée:", data.roomId);
						ws.send(JSON.stringify({ type: "error", message: "Game room not found" }));
						return;
					}
					const gameState = gameRoom.gameState;
					const userId = getId.get(ws);
					const perspective = gameRoom.player1.id_player === userId ? "player1" : "player2";
					// console.log("✅ Envoi game_update pour room:", data.roomId);
					ws.send(JSON.stringify({
						type: "game_update",
						gameState: gameState, // Correction: gameState au lieu de game
						mode: gameRoom.mode,
						perspective: perspective
					}));
				}


				if (data.type === "move_paddle") {
					// recuperer les deux ws
					// check si c'est local ou IA, dans ce cas c'est simple on ne renvoie qu'à ws
					// Meme si j'ai deja ws, pour assurer on va aller chercher les deux sockets manuellement

					const gameRoom = getGameRoom(data.roomId);
					if (!gameRoom) return ;

					const fromId = getId.get(ws);
					updateGame(gameRoom, fromId, data.direction, data.movement, data.perspective);
				}


				if (data.type === "matchmaking") {
					// console.log("Demande de matchmaking de l'utilisateur:", data.from);

					if (matchmakingQueue === -1) {
						matchmakingQueue = data.from;
						// console.log("User : ", data.from, "ajouté à la file d'attente");
						ws.send(JSON.stringify({
							type: "matchmaking_waiting",
							message: "Recherche d'un adversaire..."
						}));
					} else {
						// console.log("Match trouvé! Joueur 1:", matchmakingQueue, "vs Joueur 2:", data.from);

						// Si la personne rappuie sur online rien ne se passe
						if (matchmakingQueue === data.from) {
							return;
						}

						const idRoom = getNextRoomId();
						const toSocket = getSocket.get(matchmakingQueue);
						const player1Id = matchmakingQueue;
						const player2Id = data.from;

						// Mise à jour de la DB
						db.prepare("UPDATE users SET room_id = ? WHERE id = ?").run(idRoom, player1Id);
						db.prepare("UPDATE users SET room_id = ? WHERE id = ?").run(idRoom, player2Id);

						// Création de la room
						const gameRoom = initGameRoom(idRoom, player1Id, player2Id, "online", 0);
						setRoom(idRoom, gameRoom);

						// Insertion en DB
						// Je vais chercher les username pour tout rentrer d'un coup
						const username_ll = db.prepare("SELECT username FROM users WHERE id = ?").get(player1Id) as { username?: string } | undefined;
						const username_rr = db.prepare("SELECT username FROM users WHERE id = ?").get(player2Id) as { username?: string } | undefined;
						const username_l = username_ll?.username;
						const username_r = username_rr?.username;
						db.prepare(`INSERT INTO games
							(player_id_left, username_left, player_id_right, username_right, game_date)
							VALUES (?, ?, ?, ?, ?)`).run(player1Id, username_l, player2Id, username_r, new Date().toISOString());

						// Notification aux deux joueurs
						if (toSocket) {
							toSocket.send(JSON.stringify({ type: "room_ready", roomId: idRoom }));
						}
						ws.send(JSON.stringify({ type: "room_ready", roomId: idRoom }));

						// Reset de la queue
						matchmakingQueue = -1;
						// console.log("Room online créée avec succès, ID:", idRoom);

						// assigner les deux sockets a la gameRoom
						(gameRoom as any).sockets = [toSocket, ws];

						// boucle game loop et envoi des infos auz joueurs
						gameRoom.gameState.is_running = true;
						(gameRoom as any).interval = setInterval(() => {
							gameLoop(gameRoom);
							broadcastGameUpdate(gameRoom);
						}, 30);
					}
				}


				if (data.type === "player_left") {
					const disconnectedPlayerId : number = data.from;
					const gameRoom = getGameRoom(data.roomId);
					if (!gameRoom) return ;
					const gameState = gameRoom.gameState;
					const activePlayer = gameState.player1.id_player == disconnectedPlayerId ? gameState.player2 : gameState.player1;

					// set max score to remaining player to trigger end of the game in logic.ts who then call game_over
					activePlayer.score = 10;
				}


			} catch (err) {
				console.error("Message invalide :", err);
			}
		});

		// Gestion de la déconnexion
		ws.on("close", (code: number, reason: string) => {
			const userId = getId.get(ws);
			if (userId) {
				const userRoom = (db.prepare("SELECT room_id FROM users WHERE id = ?").get(userId) as { room_id: number | null } | undefined)?.room_id;
				if (userRoom) {
					const foundGameRoom = getGameRoom(userRoom);
					if (foundGameRoom) {
						handlePlayerDisconnection(foundGameRoom, userId);
					}
				}
			}

			try {
				db.prepare("UPDATE users SET is_connected = 0 WHERE id = ?").run(userId);
			} catch (dbError) {
				console.error("Erreur mise à jour statut connexion:", dbError);
			}
			console.log(`🔌 WebSocket fermée - Code: ${code}, Raison: ${reason}, User ID: ${userId}`);

			if (userId) {
				getSocket.delete(userId);
				getId.delete(ws);
			}
		});

		// Gestion des erreurs de socket
		ws.on("error", (error: any) => {
			const userId = getId.get(ws);
			console.error("Erreur WebSocket pour l'utilisateur ID:", userId || "inconnu");
			console.error("Détails de l'erreur:", error);
		});

	});

	// console.log("✅ WebSocket handler initialisé avec succès");
}



function broadcastGameUpdate(gameRoom: any) {
	const gameState = gameRoom.gameState;
	const mode = gameRoom.mode;
	const sockets = gameRoom.sockets || [];

	// P1
	if (sockets[0] && sockets[0].readyState === 1) {
		sockets[0].send(JSON.stringify({
		type: "game_update",
		gameState: gameState,
		mode: mode,
		perspective: "player1"
		}));
	}

	// P2
	if (sockets[1] && sockets[1].readyState === 1) {
		sockets[1].send(JSON.stringify({
		type: "game_update",
		gameState: gameState,
		mode: mode,
		perspective: "player2"
		}));
	}
}

export function game_over(gameRoom: GameRoom, winnerID: number, looserID: number): void {
	// stocker resultats de la game dans la DB
	if (gameRoom && gameRoom.gameState.is_running) {
		gameRoom.gameState.is_running = false;

		const player1 = gameRoom.gameState.player1;
		const player2 = gameRoom.gameState.player2;
		const score = `${player1.score}-${player2.score}`;
		const winnerId = player1.score > player2.score ? player1.id_player : player2.id_player;

		db.prepare("UPDATE games SET player_id_won = ?, score = ? WHERE player_id_left = ? AND player_id_right = ? AND player_id_won IS NULL").run(
			winnerId,
			score,
			player1.id_player,
			player2.id_player
		);

		// clear loops
		if ((gameRoom as any).interval)
			clearInterval((gameRoom as any).interval);
	}

	// verifier si le user etait dans une file d'attente matchmaking
	if (matchmakingQueue === looserID)
		matchmakingQueue = -1;
}

function handlePlayerDisconnection(foundGameRoom: GameRoom, disconnectedId: number): void {
	db.prepare("UPDATE users SET room_id = 0 WHERE id = ?").run(disconnectedId);

	// if active game
	if (foundGameRoom && foundGameRoom.gameState.is_running) {
		const winnerPlayer = foundGameRoom.player1.id_player === disconnectedId ? foundGameRoom.player2 : foundGameRoom.player1;
		// set max score to remaining player to trigger end of the game in logic.ts who then call game_over
		foundGameRoom.gameState.player1.id_player == winnerPlayer.id_player ? foundGameRoom.gameState.player1.score = 10 : foundGameRoom.gameState.player2.score = 10;
	}

	// Remove from socket maps
	const socket = getSocket.get(disconnectedId);
	if (socket) {
		getId.delete(socket);
		getSocket.delete(disconnectedId);
	}
}
