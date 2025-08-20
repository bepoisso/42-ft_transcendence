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

export function getSocket(router: Router): WebSocket {
	if (!socket) {
		socket = new WebSocket("ws://localhost:3000");

		socket.onopen = () => {
			console.log("Socket connectée");
		};

		socket.onmessage = (event) => {
			const data = JSON.parse(event.data);

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
	}
	return socket!;
}
