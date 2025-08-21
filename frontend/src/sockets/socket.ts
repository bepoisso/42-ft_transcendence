/*
	Ici je crée un singleton. Je crée une variable globale qui represente ma connexion ws.
	Même si elle est globale elle reste locale au fichier.
	Elle ne peut etre appelée que par les fonctions spécifiques.
	Je fais ça pour avoir acces a ma connexions ws. Sinon elle serait perdue.
	Par exemple ici je la crée dans dashboard.ts et la recupere plus tard dans game.ts
*/

import { friendInvit, gameInvit } from "./invite";
import { Router } from "../router";

export let socket: WebSocket | null = null;

export function getSocket(router: Router): Promise<WebSocket> {
	return new Promise((resolve, reject) => {
		console.log("🔧 getSocket() appelé - vérification de l'existence de la socket...");

		if (!socket) {
			console.log("🔌 Tentative de création d'une nouvelle connexion WebSocket vers ws://localhost:3000/ws");
			socket = new WebSocket("ws://localhost:3000/ws");

			console.log("🚀 WebSocket créée, état actuel:", socket.readyState);
			console.log("Est ce qu'on passe ici ?")

			socket.onopen = () => {
				console.log("✅ Socket connectée avec succès");
				console.log("📊 État de la socket:", socket?.readyState);
				resolve(socket!);
			};

			socket.onerror = (error) => {
				console.error("❌ Erreur de connexion WebSocket:", error);
				console.log("📊 État de la socket:", socket?.readyState);
				reject(error);
			};

			socket.onclose = (event) => {
				console.log("🔌 Socket fermée");
				console.log("📋 Code:", event.code);
				console.log("📋 Raison:", event.reason);
				console.log("📋 Clean:", event.wasClean);
				socket = null; // Reset pour permettre une reconnexion
			};

			socket.onmessage = (event) => {
				const data = JSON.parse(event.data);
				console.log("📨 Message reçu du serveur:", data);

				if (data.type === "connection_confirmed") {
					console.log("✅ Connexion WebSocket confirmée par le serveur pour l'utilisateur ID:", data.userId);
				}

				if (data.type === "info") {
					console.log("ℹ️ Info du serveur:", data.message);
				}

				if (data.type === "error") {
					console.error("❌ Erreur du serveur:", data.message);
				}

				if (data.type === "game_receive_invite") {
					console.log("Invitation reçue : ", data.from_name);
					gameInvit(socket!, data);
				}

				if (data.type === "friend_receive_invite") {
					console.log("Invitation reçue : ", data.from_name);
					friendInvit(socket!, data);
				}

				if (data.type === "room_ready") {
					console.log("Room number: ", data.roomId);
					router.navigate(`/game/${data.roomId}`);
				}

			}
		} else if (socket.readyState === WebSocket.OPEN) {
			console.log("🔄 Socket existante déjà ouverte");
			resolve(socket);
		} else if (socket.readyState === WebSocket.CONNECTING) {
			console.log("⏳ Socket existante en cours de connexion, attente...");
			socket.onopen = () => {
				console.log("✅ Socket existante maintenant connectée");
				resolve(socket!);
			};
			socket.onerror = (error) => {
				reject(error);
			};
		} else {
			console.log("🔄 Socket existante fermée, création d'une nouvelle...");
			socket = null;
			// Recursive call to create new socket
			resolve(getSocket(router));
		}
	});
}

// Fonction utilitaire pour envoyer des messages de manière sécurisée
export async function sendMessage(router: Router, message: any): Promise<void> {
	try {
		const ws = await getSocket(router);
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(message));
			console.log("📤 Message envoyé:", message);
		} else {
			console.error("❌ WebSocket n'est pas ouverte, état:", ws.readyState);
			throw new Error("WebSocket not ready");
		}
	} catch (error) {
		console.error("❌ Erreur lors de l'envoi du message:", error);
		throw error;
	}
}
