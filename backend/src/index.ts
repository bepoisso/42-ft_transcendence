import Fastify, { fastify } from 'fastify'
import cors from "@fastify/cors";
import { Socket } from 'socket.io';
import { servRoutes } from "./servRoutes";
import { registerGoogleOAuth2Provider } from "./auth/auth_provider";
import cookie from '@fastify/cookie';
import { socketHandler } from './game/socket';
import dotenv from 'dotenv';


dotenv.config();

// Normalement rien ne doit etre touché ici avant un moment. C'est juste le lancement du serveur

const gPortBack = process.env.PORT_BACK;

// =============================================================================
//						buildServer() : configure le serveur				  ||
// =============================================================================


async function buildServer() {
		const server = Fastify({ logger: true });



		await server.register(cors, {
			origin: `http://localhost:${gPortBack}`,
			credentials: true
		});

		// Register cookie support
		await server.register(cookie);

		// Register socket handler after Socket.IO is set up
		server.ready().then(() => {
			socketHandler(server);
		});

		// Register other middleware and routes
		registerGoogleOAuth2Provider(server);
		await server.register(servRoutes);

		return server;
}


// =============================================================================
//						Ici on le lance en mode écoute						  ||
// =============================================================================

buildServer().then((server) => {
  server.listen({ port: Number(gPortBack) }, (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    console.log(`Server is running at ${address}`);
  });
});

