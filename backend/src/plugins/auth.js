import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import config from "../config/env.js";
import { UnauthorizedError } from "../utils/errors.js";

/** @param {import('fastify').FastifyInstance} fastify */
async function authPlugin(fastify) {
	await fastify.register(jwt, {
		secret: config.jwt.secret,
		sign: { expiresIn: config.jwt.expiresIn },
	});

	fastify.decorate("authenticate", async (request, reply) => {
		try {
			await request.jwtVerify();
		} catch (err) {
			throw new UnauthorizedError("Invalid or expired token");
		}
	});
}

export default fp(authPlugin);
