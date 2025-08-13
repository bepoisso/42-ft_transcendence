import { FastifyInstance } from "fastify";
import { WSRoutes } from "./game/wsRoutes";

// CE fichier sert simplement a prendre toutes les API
export async function servRoutes(fastify: FastifyInstance)
{
	fastify.post("/api/users/register", async (req, reply) => {
		const { email, password } = req.body as any;
		const result = await checkUserExist(email, password);
		reply.send(result);
	});

	// Gere WS
	WSRoutes(fastify);
}
