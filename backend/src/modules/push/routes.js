import fp from "fastify-plugin";
import { PushService } from "./services.js";
import { PushHandlers } from "./handlers.js";
import { subscribeSchema, unsubscribeSchema } from "./schemas.js";

/** @param {import('fastify').FastifyInstance} fastify */
export async function pushRoutes(fastify) {
	const pushService = new PushService(fastify.db);
	const handlers = new PushHandlers(pushService);

	fastify.decorate("pushService", pushService);

	const auth = { onRequest: [fastify.authenticate] };

	fastify.post("/subscribe", { ...auth, schema: subscribeSchema }, handlers.subscribe.bind(handlers));

	fastify.post("/unsubscribe", { ...auth, schema: unsubscribeSchema }, handlers.unsubscribe.bind(handlers));

	fastify.get("/vapid", handlers.getVapidKey.bind(handlers));
}

export default fp(pushRoutes);
