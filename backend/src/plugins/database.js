import fp from "fastify-plugin";
import { db } from "../config/database.js";

/** @param {import('fastify').FastifyInstance} fastify */
async function databasePlugin(fastify) {
	fastify.decorate("db", db);

	fastify.addHook("onClose", async () => {
		await db.destroy();
	});
}

export default fp(databasePlugin);
