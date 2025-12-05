import { PipelineService } from "./services.js";
import { PipelineHandlers } from "./handlers.js";
import { createPipelineSchema, updatePipelineSchema, clonePipelineSchema } from "./schemas.js";

/** @param {import('fastify').FastifyInstance} fastify */
export default async function pipelineRoutes(fastify) {
	const pipelineService = new PipelineService(fastify.db);
	const handlers = new PipelineHandlers(pipelineService);

	const auth = { onRequest: [fastify.authenticate] };

	fastify.get("/", auth, handlers.list.bind(handlers));

	fastify.get("/:id", auth, handlers.get.bind(handlers));

	fastify.post("/", { ...auth, schema: createPipelineSchema }, handlers.create.bind(handlers));

	fastify.put("/:id", { ...auth, schema: updatePipelineSchema }, handlers.update.bind(handlers));

	fastify.delete("/:id", auth, handlers.delete.bind(handlers));

	fastify.post("/clone/:token", { ...auth, schema: clonePipelineSchema }, handlers.clone.bind(handlers));
}
