import { AuthService } from "./service.js";
import { AuthHandlers } from "./handlers.js";
import { signupSchema, loginSchema } from "./schema.js";

/** @param {import('fastify').FastifyInstance} fastify */
export default async function authRoutes(fastify) {
	const authService = new AuthService(fastify.db);
	const handlers = new AuthHandlers(authService);

	fastify.post("/signup", { schema: signupSchema }, handlers.signup.bind(handlers));

	fastify.post("/login", { schema: loginSchema }, handlers.login.bind(handlers));

	fastify.get("/me", { onRequest: [fastify.authenticate] }, handlers.getMe.bind(handlers));
}
