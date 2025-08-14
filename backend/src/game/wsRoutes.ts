import { FastifyInstance } from "fastify";
import websocket from "@fastify/websocket";
import { wsLocal } from "./wsLogic/wsLocal";


// Fonction pour checker le token (à true pour les tests mais il faudra le changer)
function isValidToken(token: any) {
	return (true);
}

export async function WSRoutes(fastify: FastifyInstance)
{

	// Ici on ouvre WS en verifiant bien que le token correspond a une session enregistrée
	fastify.get("/ws", {websocket: true}, (connection, req) =>
	{
		const url = new URL(req.url, `http://${req.headers.host}`);
		const token = url.searchParams.get('token');

		console.log("trying to connect with Token : ", token);

		if (!isValidToken(token)) { // Fonction a faire mais je sais pas exactement comment
			connection.socket.close(4001, "Invalid token");
			return;
		}

	/* On gère ici toute la logique de message.
	   On a :
			createRoom
			JoinRoom => pas besoin en local ?
			closeRoom
			autre ?
			Probleme : ici je gere toute les logiques : local, IA, online => ca va etre le bordel
					Il faudrait factoriser
	*/
		connection.socket.on("message", (message: any) =>
		{
			const msg = JSON.parse(message.toString());
			console.log("Message : ", msg);

			if (msg.type === "createRoom")
			{
				if (msg.mode === "local")
				{
					const room = wsLocal(connection.socket, msg.playerName, token);

					// Envoi d'une réponse au client pour dire que la room est créée
					connection.socket.send(JSON.stringify
					({
						type: "roomCreated",
						roomId: room.id
					}));

					// Envoie des stats de la room
					connection.socket.send(JSON.stringify({
						type: "infoRoom",
						state: room.gameState
					}));
				}
			}
		});

	});
}

