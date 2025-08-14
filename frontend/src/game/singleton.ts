/*
	Ici je crée un singleton. Je crée une variable globale qui represente ma connexion ws.
	Même si elle est globale elle reste locale au fichier.
	Elle ne peut etre appelée que par les fonctions spécifiques.
	Je fais ça pour avoir acces a ma connexions ws. Sinon elle serait perdue.
	Par exemple ici je la crée dans dashboard.ts et la recupere plus tard dans game.ts
*/

let ws: WebSocket | null = null;

export function initWebSocket(token: string | null): WebSocket {
	if (!ws || ws.readyState === WebSocket.CLOSED) {
		ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);
	}
	return ws;
}

export function getWebSocket(): WebSocket | null {
	return ws;
}
