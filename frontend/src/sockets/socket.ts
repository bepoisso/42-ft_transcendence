/*
	Ici je crée un singleton. Je crée une variable globale qui represente ma connexion ws.
	Même si elle est globale elle reste locale au fichier.
	Elle ne peut etre appelée que par les fonctions spécifiques.
	Je fais ça pour avoir acces a ma connexions ws. Sinon elle serait perdue.
	Par exemple ici je la crée dans dashboard.ts et la recupere plus tard dans game.ts
*/
import { io, Socket } from "socket.io-client";
import { sendInvite } from "./invite";
import { sendGame } from "./game";

export let socket: Socket | null = null;

export function getSocket(): Socket {
	if (!socket) {
		socket = io("http://localhost:3000", { withCredentials: true });

		socket.on("connect", () => {
			console.log("Socket connectée : ", socket!.id);
		});

		socket.on("receive_invite", (data) => {
			console.log("Invitation reçue :", data);
			sendInvite(socket!, data);
		});

		socket.on("game_ready", (data) => {
			console.log("game is ready with info: ", data);
			sendGame(socket!, data);
		})

	}
	return socket;
}
