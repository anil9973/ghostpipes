import "dotenv/config";
export default {
	port: +process.env.PORT || 3000,
	host: "0.0.0.0",
	nodeEnv: process.env.NODE_ENV || "development",

	// Aurora PostgreSQL
	database: {
		host: process.env.DB_HOST,
		port: process.env.DB_PORT || 5432,
		database: process.env.DB_NAME,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		ssl: process.env.DB_SSL === "true",
		max: 20, // connection pool size
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 10000,
	},

	// JWT
	jwt: {
		secret: process.env.JWT_SECRET,
		expiresIn: process.env.JWT_EXPIRES_IN || "7d",
	},

	vapid: {
		publicKey: process.env.VAPID_PUBLIC_KEY,
		privateKey: process.env.VAPID_PRIVATE_KEY,
		subject: process.env.VAPID_SUBJECT,
	},

	// AWS
	aws: {
		region: process.env.AWS_REGION || "us-east-1",
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},

	// Rate limiting
	rateLimit: {
		max: 100,
		timeWindow: "15 minutes",
	},

	// CORS
	cors: {
		origin: process.env.CORS_ORIGIN || "*",
		credentials: true,
	},
};
