import { WebhookService } from "./services.js";
import { WebhookHandlers } from "./handlers.js";
import { createWebhookSchema } from "./schemas.js";

/** @param {import('fastify').FastifyInstance} fastify */
export default async function webhookRoutes(fastify) {
	const pushService = fastify.pushService;
	const webhookService = new WebhookService(fastify.db, pushService);
	const handlers = new WebhookHandlers(webhookService);

	const auth = { onRequest: [fastify.authenticate] };

	fastify.post("/", { ...auth, schema: createWebhookSchema }, handlers.create.bind(handlers));

	fastify.get("/:id", auth, handlers.get.bind(handlers));

	fastify.get("/pipeline/:pipelineId", auth, handlers.listByPipeline.bind(handlers));

	fastify.delete("/:id", auth, handlers.delete.bind(handlers));

	fastify.get("/:id/data", auth, handlers.getData.bind(handlers));
}

/** Public webhook trigger routes - separate plugin */
export async function webhookTriggerRoutes(fastify) {
	const pushService = fastify.pushService;
	const webhookService = new WebhookService(fastify.db, pushService);
	const handlers = new WebhookHandlers(webhookService);

	fastify.post("/:token", handlers.trigger.bind(handlers));
	fastify.get("/:token", handlers.trigger.bind(handlers));
	fastify.put("/:token", handlers.trigger.bind(handlers));
	fastify.delete("/:token", handlers.trigger.bind(handlers));
	fastify.patch("/:token", handlers.trigger.bind(handlers));
}
