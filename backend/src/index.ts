import Fastify from 'fastify'
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { servRoutes } from "./servRoutes";
import { registerGoogleOAuth2Provider } from "./auth/auth_provider";
import cookie from '@fastify/cookie';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Normalement rien ne doit etre touché ici avant un moment. C'est juste le lancement du serveur

const gPortBack = process.env.PORT_BACK || 3000;

// =============================================================================
//						buildServer() : configure le serveur				  ||
// =============================================================================

async function buildServer() {

	// Configuration HTTPS
	const httpsOptions = {
		key: fs.readFileSync(path.join(__dirname, '../certs/server-key.pem')),
		cert: fs.readFileSync(path.join(__dirname, '../certs/server-cert.pem'))
	};

	const server = Fastify({
		logger: true,
		https: httpsOptions
	});


	await server.register(cors, {
		origin: [
			`${process.env.ADRESS || 'https://127.0.0.1'}:${process.env.PORT_FRONT || '5173'}`,
			`${process.env.ADRESS || 'https://127.0.0.1'}:${process.env.PORT_BACK || '3000'}`
		],
		credentials: true,
		methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cookie'] // Important pour les cookies
	});

	// On instaure Websocket ici
	await server.register(websocket);

	// Register cookie support
	await server.register(cookie);

	// Enregistre le fournisseur Google OAuth2
	registerGoogleOAuth2Provider(server);
	// Ici on ajoute le fichier de route qui contient toute les API + WS
	await server.register(servRoutes);

	return server;
}


// =============================================================================
//						Ici on le lance en mode écoute						  ||
// =============================================================================

buildServer().then((server) => {
  server.listen({ port: Number(gPortBack), host: '0.0.0.0' }, (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    console.log(`🚀 HTTPS Server is running at ${address}`);
    console.log(`📁 Serving on https://localhost:${gPortBack}`);
  });
});

