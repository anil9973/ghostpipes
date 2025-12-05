import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import config from "./src/config/env.js";

async function loadDbConfig() {
	const secret_name = "rds!cluster-880f7018-ead1-4ceb-8780-ff038117dc96";
	const client = new SecretsManagerClient({ region: "us-east-1" });
	const command = new GetSecretValueCommand({ SecretId: secret_name, VersionStage: "AWSCURRENT" });
	const secret = await client.send(command);
	return JSON.parse(secret.SecretString);
}

const creds = await loadDbConfig();

/** @type {import('knex').Knex.Config} */
export default {
	client: "pg",
	connection: {
		host: config.database.host,
		port: +config.database.port || 5432,
		database: config.database.database,
		user: creds.username,
		password: creds.password,
		ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
	},
	pool: { min: 2, max: 10 },
	migrations: {
		directory: "./src/db/migrations",
		tableName: "knex_migrations",
	},
};
