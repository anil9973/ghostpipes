import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import config from "./config/env.js";
import corsPlugin from "./plugins/cors.js";
import authPlugin from "./plugins/auth.js";
import databasePlugin from "./plugins/database.js";

import authRoutes from "./modules/auth/routes.js";
import pipelineRoutes from "./modules/pipelines/routes.js";
import webhookRoutes, { webhookTriggerRoutes } from "./modules/webhooks/routes.js";
import pushRoutes from "./modules/push/routes.js";

import { AppError } from "./utils/errors.js";

export async function buildApp(opts = {}) {
	const fastify = Fastify({
		logger: config.nodeEnv === "development",
		...opts,
	});

	fastify.decorate("config", config);

	await fastify.register(rateLimit, {
		max: 100,
		timeWindow: "1 minute",
	});

	await fastify.register(corsPlugin);
	await fastify.register(authPlugin);
	await fastify.register(databasePlugin);

	await fastify.register(pushRoutes, { prefix: "/api/push" });
	await fastify.register(authRoutes, { prefix: "/api/auth" });
	await fastify.register(pipelineRoutes, { prefix: "/api/pipelines" });
	await fastify.register(webhookRoutes, { prefix: "/api/webhooks" });
	await fastify.register(webhookTriggerRoutes, { prefix: "/wh" });

	fastify.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

	fastify.setErrorHandler((error, request, reply) => {
		if (error instanceof AppError) {
			return reply.status(error.statusCode).send({
				error: error.code,
				message: error.message,
			});
		}

		if (error.validation) {
			return reply.status(400).send({
				error: "VALIDATION_ERROR",
				message: "Request validation failed",
				details: error.validation,
			});
		}

		fastify.log.error(error);
		return reply.status(500).send({
			error: "INTERNAL_ERROR",
			message: config.nodeEnv === "development" ? error.message : "Internal server error",
		});
	});

	return fastify;
}
