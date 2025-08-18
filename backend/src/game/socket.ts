import { FastifyInstance } from "fastify";
import { Server } from "socket.io";
import { getNextRoomId } from "./interface";


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

	io.on("connection", (socket) => {
		console.log(`Utilisateur connecté : ${socket.id}`);

		socket.on("send_invite", (data) => { // Quand ce client (socket) envoie send invite
			io.to(data.to).emit("receive_invite", { from: data.from }); // ce receveur (data.to) recupere receive_invit request
		});


		socket.on("start_game", (data) => {
			const idRoom = getNextRoomId(); // crée une room
			socket.join(idRoom.toString()); // link la socket à cette room
			io.to(idRoom.toString()).emit("game_ready", { idRoom }); // envoie à tte les sockets de la room
		});



	});
}

