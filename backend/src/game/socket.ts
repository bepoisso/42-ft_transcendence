import { FastifyInstance } from "fastify";
import { Server } from "socket.io";
import { getNextRoomId } from "./interface";
import cookie from "cookie";


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
	const io = new Server(fastify.server, {
		cors: {
		origin: "http://localhost:5173", // faudra le changer plus tard
		credentials: true,
		},
	});

	const userSockets = new Map<string, string>(); // userId -> socket.id

	io.on("connection", async (socket) => {
		console.log(`Utilisateur connecté : ${socket.id}`);

		// ================ A check mais normalement si on passe par cookie cela devrait fonctionner ========================
		// const cookies = cookie.parse(socket.handshake.headers.cookie || "");
		// const token = cookies["jwt"]; // si ton cookie s'appelle "jwt"

		// try {
		// 	const payload = jwt.verify(token, process.env.JWT_SECRET);
		// 	const userId = payload.sub;

		// 	// tu stocks le userId dans socket.data pour l’avoir partout
		// 	socket.data.userId = userId;

		// 	userSockets.set(userId, socket.id);



		// 	await db.user.update({
		// 	where: { id: userId },
		// 	data: { isConnected: true }
		// 	});
		//  } catch (err) {
		// 	console.log("JWT invalide");
		// 	socket.disconnect();
  		// }
		// ===================. Fin de la logique cookie ===============================================================


		// logique en cas d'invitation
		socket.on("send_invite", (data) => {
			const toSocketId = userSockets.get(data.to); // cherche la socket du destinataire
			if (toSocketId) {
				io.to(toSocketId).emit("receive_invite", { from: socket.data.userId }); // envoie l'invitation
			}
		});

		socket.on("send_friend_invite", (data) => {
			const toSocketId = userSockets.get(data.to); // cherche la socket du destinataire
			if (toSocketId) {
				io.to(toSocketId).emit("friend_request", { from: socket.data.userId }); // envoie l'invitation
			}
		});

		// maintenant il faut gerer l'acceptation en ami /!\/!\
		socket.on("accept_friend", (data) => {

		socket.on("accept_invite", (data) => {
			const idRoom = getNextRoomId();
			socket.join(idRoom.toString());
			const fromSocket = io.sockets.sockets.get(data.from);
			if (fromSocket) {fromSocket.join(idRoom.toString());}

			io.to(idRoom.toString()).emit("game_ready", { idRoom });
		});

		socket.on("decline_invite", (data) => {
			// Je pense qu'on a meme pas besoin d'ecouter si le mec decline
		});

		// logique en cas de local ou IA
		socket.on("start_game", (data) => {
			const idRoom = getNextRoomId(); // crée une room
			socket.join(idRoom.toString()); // link la socket à cette room
			io.to(idRoom.toString()).emit("game_ready", { idRoom }); // envoie à tte les sockets de la room
		});

		socket.on("disconnect", async () => {
				userSockets.delete(socket.data.userId);

				// await db.user.update({
				// 	where: { id: socket.data.userId },
				// 	data: { isConnected: false }
				// });
			});

		});
	});
}
