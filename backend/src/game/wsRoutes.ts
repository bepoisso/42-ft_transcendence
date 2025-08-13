import { FastifyInstance } from "fastify";
import fastifyWebsocket from "fastify-websocket";
import { wsLocal } from "./wsLogic/wsLocal";


// Fonction pour checker le token (à true pour les tests mais il faudra le changer)
function isValidToken(token: any) {
	return (true);
}

export async function WSRoutes(fastify: FastifyInstance) {

	// Ici on ouvre WS en verifiant bien que le token correspond a une session enregistrée
	fastify.get("/ws", {websocket: true}, (connection, req) => {
		const url = new URL(req.url, `http://${req.headers.host}`);
		const token = url.searchParams.get('token');

		console.log("trying to connect with Token : ", token);

		if (!isValidToken(token)) {
			connection.socket.close(4001, "Invalid token");
			return;
		}

	// Maintenant on récupère les informations de la session pour créer une room
	connection.socket.on("message", (message: any) => {
			const msg = JSON.parse(message.toString());
			console.log("Message : ", msg);

			if (msg.type === "createRoom") {
				if (msg.mode === "local")
					return wsLocal(connection, msg.playerName, token);
				else if (msg.mode === "online")
					return wsOnline();
				else if (msg.mode === "tournament")
					return wsTournament();
				else if (msg.mode === "ai")
					return wsAI();
				//else
			}

	})



	});


}

