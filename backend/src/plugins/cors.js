import fp from "fastify-plugin";
import cors from "@fastify/cors";

/** @param {import('fastify').FastifyInstance} fastify */
async function corsPlugin(fastify) {
	await fastify.register(cors, {
		origin: true,
		credentials: true,
	});
}

export default fp(corsPlugin);
