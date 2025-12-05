import knex from "knex";
import config from "./env.js";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

async function loadDbConfig() {
	const secret_name = "rds!cluster-880f7018-ead1-4ceb-8780-ff038117dc96";
	const client = new SecretsManagerClient({ region: "us-east-1" });
	const command = new GetSecretValueCommand({ SecretId: secret_name, VersionStage: "AWSCURRENT" });
	const secret = await client.send(command);
	return JSON.parse(secret.SecretString);
}

const creds = await loadDbConfig();

export const db = knex({
	client: "pg",
	connection: {
		host: config.database.host,
		port: +config.database.port || 5432,
		database: config.database.database,
		user: creds.username,
		password: creds.password,
		ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
	},
	pool: { min: 0, max: 2 },
	migrations: {
		directory: "./src/db/migrations",
		tableName: "knex_migrations",
	},
});

/* async function testConnection() {
	console.log("testing...");
	try {
		await db.raw("SELECT 1+1 AS result");
		console.log("✅ Database connected successfully!");
	} catch (err) {
		console.error("❌ Database connection failed:", err.message);
	} finally {
		db.destroy(); // optional: close connection after test
	}
	console.log("testing done");
}

testConnection(); */
