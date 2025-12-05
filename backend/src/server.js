import { buildApp } from "./app.js";
import config from "./config/env.js";

const start = async () => {
	try {
		const app = await buildApp();

		await app.listen({
			port: config.port,
			host: config.host,
		});

		console.log(`🚀 Server listening on ${config.host}:${config.port}`);
	} catch (err) {
		console.error("Failed to start server:", err);
		process.exit(1);
	}
};

start();
