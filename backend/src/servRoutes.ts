import { FastifyInstance } from "fastify";
import { WSRoutes } from "./game/wsRoutes";
import { ping, register, login } from "./auth/auth";
import { googleOauth } from "./auth/auth_provider";
import { request } from "http";
import { Script } from "vm";

// CE fichier sert simplement a prendre toutes les API
export async function servRoutes(fastify: FastifyInstance)
{
	// // J'ai donné ici à titre d'exemple en gros c'est la structure attendue
	// fastify.post("/api/users/register", async (req, reply) => {
	// 	const { email, password } = req.body as any;
	// 	const result = await checkUserExist(email, password);
	// 	reply.send(result);
	// });

	// /// Ca donne quelque chose comme :
	// fastify.post("/api/etc", async (req, reply) => { // req = le full objet que je recupere donc le protocole HTTP || reply = l'objet que je renvoie (generalement un JSON)
	// 	const {params1, params2} = req.body as any; // params1/2/3/etc = les objets que je recupere du body de la requete
	// 	const result = await maFonction(params1, params2) // Ces params ce sont ceux que j'utilise dans ma fonction qui se trouve dans son emplacement
	// 	reply.send(result); // c'est le return de ma fonction en gros
	// })

	fastify.get("/ping", async (request, reply) => {
		const result = await ping();
		reply.send(result);
	});

	fastify.post("/register", async (request, reply) => {
		const { username, email, password } = request.body as any;
		const result = await register(username, email, password);
		reply.send(result);
	});

	fastify.post("/login", async (request, reply) => {
		const { email, password } = request.body as any;
		const result = await login(email, password);
		reply.send(result);
	});

	fastify.get("/auth/google/callback", async (request, reply) => {
		const result = await googleOauth(request, reply, fastify);
		reply.type("test/html").send(`
			<script>
				localStorage.setItem("jwt", ${result.token});
				window.location.href = "/";
			</script>
		`);
	});

	// Gere WS
	WSRoutes(fastify);
}
