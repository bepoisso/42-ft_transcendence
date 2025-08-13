import Fastify from 'fastify'
import cors from "@fastify/cors";
import fastifyWebsocket from "fastify-websocket";
import { servRoutes } from "./servRoutes";


const PORT = 3000;

// =============================================================================
//						buildServer() : configure le serveur				  ||
// =============================================================================

async function buildServer() {

	const server = Fastify({ logger: true });


	await server.register(cors, {
		origin: "http://localhost:3000", // en prod il faudra mettre le nom du serv
	});

	// On instaure Websocket ici
	await server.register(fastifyWebsocket);

	// Ici on ajoute le fichier de route qui contient toute les API + WS
	await server.register(servRoutes);

	return server;
}


// =============================================================================
//						Ici on le lance en mode écoute						  ||
// =============================================================================

buildServer().then((server) => {
  server.listen({ port: Number(PORT) }, (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    console.log(`Server is running at ${address}`);
  });
});

