# Design Document

## Overview

The GhostPipes Backend is a modular Fastify application that provides RESTful API services for user authentication, pipeline management, webhook handling, and web push notifications. The architecture follows a domain-driven design pattern with separate modules for each major feature area. The system uses Amazon Aurora PostgreSQL for data persistence, JWT for authentication, and the Web Push protocol for real-time notifications to the Chrome extension.

## Architecture

### Modular Plugin Architecture

The application is organized into feature-based modules (Fastify plugins):

```
src/
├── app.js                 # Main Fastify app configuration
├── server.js              # Server entry point
├── modules/
│   ├── auth/             # Authentication module
│   │   ├── routes.js     # Auth routes
│   │   ├── handlers.js   # Route handlers
│   │   ├── schemas.js    # Request/response schemas
│   │   └── service.js    # Business logic
│   ├── pipelines/        # Pipeline management module
│   │   ├── routes.js
│   │   ├── handlers.js
│   │   ├── schemas.js
│   │   └── service.js
│   ├── webhooks/         # Webhook module
│   │   ├── routes.js
│   │   ├── handlers.js
│   │   ├── schemas.js
│   │   └── service.js
│   └── push/             # Web Push module
│       ├── routes.js
│       ├── handlers.js
│       ├── schemas.js
│       └── service.js
├── db/
│   ├── knex.js           # Knex configuration
│   └── migrations/       # Database migrations
└── utils/
    ├── errors.js         # Custom error classes
    └── helpers.js        # Utility functions
```

### Request Flow

1. Client sends HTTP request
2. Fastify receives request
3. CORS middleware validates origin
4. Rate limiter checks request limits
5. JWT plugin verifies authentication (if protected route)
6. Request validation against JSON schema
7. Route handler processes request
8. Service layer executes business logic
9. Database operations via Knex
10. Response formatted and returned

## Components and Interfaces

### App Configuration (app.js)

```javascript
export async function buildApp(opts = {}) {
	const app = fastify(opts);

	// Register plugins
	await app.register(cors, { origin: process.env.CORS_ORIGIN });
	await app.register(rateLimit, { max: 60, timeWindow: "1 minute" });
	await app.register(jwt, { secret: process.env.JWT_SECRET });

	// Register database
	app.decorate("knex", knex);

	// Register modules
	await app.register(authModule, { prefix: "/api/auth" });
	await app.register(pipelinesModule, { prefix: "/api/pipelines" });
	await app.register(webhooksModule, { prefix: "/api/webhooks" });
	await app.register(pushModule, { prefix: "/api/push" });

	// Health check
	app.get("/health", healthCheckHandler);

	// Error handler
	app.setErrorHandler(errorHandler);

	return app;
}
```

### Authentication Module

#### Auth Service

```javascript
export class AuthService {
	/** @param {import('knex').Knex} knex */
	constructor(knex) {}

	/** @param {string} email @param {string} password @param {string} displayName @returns {Promise<{userId: string, token: string}>} */
	async signup(email, password, displayName) {}

	/** @param {string} email @param {string} password @returns {Promise<{userId: string, email: string, displayName: string, token: string}>} */
	async login(email, password) {}

	/** @param {string} userId @returns {Promise<{userId: string, email: string, displayName: string, createdAt: number}>} */
	async getUserInfo(userId) {}

	/** @param {string} password @returns {Promise<string>} */
	async hashPassword(password) {}

	/** @param {string} plainPassword @param {string} hashedPassword @returns {Promise<boolean>} */
	async verifyPassword(plainPassword, hashedPassword) {}

	/** @param {Object} payload @returns {string} */
	generateToken(payload) {}
}
```

### Pipeline Module

#### Pipeline Service

```javascript
export class PipelineService {
	/** @param {import('knex').Knex} knex */
	constructor(knex) {}

	/** @param {string} userId @param {Object} pipelineData @returns {Promise<Object>} */
	async createPipeline(userId, pipelineData) {}

	/** @param {string} userId @param {number} page @param {number} limit @returns {Promise<{pipelines: Array, pagination: Object}>} */
	async listPipelines(userId, page, limit) {}

	/** @param {string} pipelineId @param {string} userId @returns {Promise<Object>} */
	async getPipeline(pipelineId, userId) {}

	/** @param {string} pipelineId @param {string} userId @param {Object} updates @returns {Promise<Object>} */
	async updatePipeline(pipelineId, userId, updates) {}

	/** @param {string} pipelineId @param {string} userId @returns {Promise<void>} */
	async deletePipeline(pipelineId, userId) {}

	/** @param {string} userId @param {Array<Object>} pipelines @returns {Promise<{synced: Array<string>, conflicts: Array<Object>}>} */
	async syncPipelines(userId, pipelines) {}

	/** @param {string} pipelineId @returns {string} */
	generateShareToken(pipelineId) {}

	/** @param {string} shareToken @returns {Promise<Object>} */
	async getSharedPipeline(shareToken) {}

	/** @param {string} pipelineId @param {string} userId @returns {Promise<Object>} */
	async clonePipeline(pipelineId, userId) {}
}
```

### Webhook Module

#### Webhook Service

```javascript
export class WebhookService {
	/** @param {import('knex').Knex} knex @param {PushService} pushService */
	constructor(knex, pushService) {}

	/** @param {string} userId @param {string} pipelineId @param {Array<string>} allowedMethods @param {string} secret @returns {Promise<{webhookId: string, webhookKey: string, webhookUrl: string}>} */
	async createWebhook(userId, pipelineId, allowedMethods, secret) {}

	/** @param {string} userId @returns {Promise<Array<Object>>} */
	async listWebhooks(userId) {}

	/** @param {string} webhookId @param {string} userId @returns {Promise<void>} */
	async deleteWebhook(webhookId, userId) {}

	/** @param {string} webhookKey @param {string} method @param {Object} data @returns {Promise<void>} */
	async handleWebhookRequest(webhookKey, method, data) {}

	/** @returns {string} */
	generateWebhookKey() {}

	/** @param {Object} payload @param {string} signature @param {string} secret @returns {boolean} */
	validateHmac(payload, signature, secret) {}
}
```

### Push Notification Module

#### Push Service

```javascript
export class PushService {
	/** @param {import('knex').Knex} knex */
	constructor(knex) {}

	/** @param {string} userId @param {string} endpoint @param {Object} keys @returns {Promise<{subscriptionId: string}>} */
	async subscribe(userId, endpoint, keys) {}

	/** @param {string} userId @param {string} endpoint @returns {Promise<void>} */
	async unsubscribe(userId, endpoint) {}

	/** @param {string} userId @param {Object} payload @returns {Promise<void>} */
	async sendPushToUser(userId, payload) {}

	/** @param {Object} data @returns {boolean} */
	shouldSendDirectData(data) {}

	/** @param {Object} subscription @param {Object} payload @returns {Promise<void>} */
	async sendNotification(subscription, payload) {}
}
```

## Data Models

### User Model

```javascript
export class User {
	/** @param {Object} init */
	constructor(init = {}) {
		this.userId = init.userId || crypto.randomUUID();
		this.email = init.email;
		this.passwordHash = init.passwordHash;
		this.displayName = init.displayName || null;
		this.createdAt = init.createdAt || Date.now();
		this.updatedAt = init.updatedAt || Date.now();
	}
}
```

### Pipeline Model

```javascript
export class Pipeline {
	/** @param {Object} init */
	constructor(init = {}) {
		this.id = init.id || crypto.randomUUID();
		this.userId = init.userId;
		this.title = init.title;
		this.summary = init.summary || null;
		this.definition = init.definition; // JSONB containing trigger, nodes, pipes
		this.isPublic = init.isPublic || false;
		this.shareToken = init.shareToken || null;
		this.clonedFrom = init.clonedFrom || null;
		this.cloneCount = init.cloneCount || 0;
		this.createdAt = init.createdAt || Date.now();
		this.updatedAt = init.updatedAt || Date.now();
	}
}
```

### Webhook Model

```javascript
export class Webhook {
	/** @param {Object} init */
	constructor(init = {}) {
		this.webhookId = init.webhookId || crypto.randomUUID();
		this.userId = init.userId;
		this.pipelineId = init.pipelineId;
		this.webhookKey = init.webhookKey;
		this.allowedMethods = init.allowedMethods || ["POST"];
		this.secret = init.secret || null;
		this.isActive = init.isActive !== undefined ? init.isActive : true;
		this.requestCount = init.requestCount || 0;
		this.lastTriggeredAt = init.lastTriggeredAt || null;
		this.createdAt = init.createdAt || Date.now();
	}
}
```

### Push Subscription Model

```javascript
export class PushSubscription {
	/** @param {Object} init */
	constructor(init = {}) {
		this.subscriptionId = init.subscriptionId || crypto.randomUUID();
		this.userId = init.userId;
		this.endpoint = init.endpoint;
		this.p256dhKey = init.p256dhKey;
		this.authSecret = init.authSecret;
		this.isActive = init.isActive !== undefined ? init.isActive : true;
		this.lastUsedAt = init.lastUsedAt || null;
		this.createdAt = init.createdAt || Date.now();
	}
}
```

## Database Schema

### users table

```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
```

### pipelines table

```sql
CREATE TABLE pipelines (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  definition JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  share_token VARCHAR(50) UNIQUE,
  cloned_from UUID REFERENCES pipelines(id),
  clone_count INTEGER DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE INDEX idx_pipelines_user_id ON pipelines(user_id);
CREATE INDEX idx_pipelines_share_token ON pipelines(share_token);
CREATE INDEX idx_pipelines_is_public ON pipelines(is_public);
```

### webhooks table

```sql
CREATE TABLE webhooks (
  webhook_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  webhook_key VARCHAR(50) UNIQUE NOT NULL,
  allowed_methods TEXT[] DEFAULT ARRAY['POST'],
  secret VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  request_count INTEGER DEFAULT 0,
  last_triggered_at BIGINT,
  created_at BIGINT NOT NULL
);

CREATE INDEX idx_webhooks_webhook_key ON webhooks(webhook_key);
CREATE INDEX idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX idx_webhooks_pipeline_id ON webhooks(pipeline_id);
```

### push_subscriptions table

```sql
CREATE TABLE push_subscriptions (
  subscription_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at BIGINT,
  created_at BIGINT NOT NULL
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Password hashing is irreversible

_For any_ user registration or password update, the stored password hash should not be reversible to the original plaintext password.

**Validates: Requirements 1.1**

### Property 2: JWT tokens contain valid user information

_For any_ generated JWT token, decoding the token should yield a payload containing userId, email, iat, and exp fields.

**Validates: Requirements 1.5, 2.1**

### Property 3: Authentication protects user-specific resources

_For any_ protected route request, the system should only allow access if a valid JWT token is provided and the requested resource belongs to the authenticated user.

**Validates: Requirements 2.5, 4.1, 4.4**

### Property 4: Pipeline ownership is enforced

_For any_ pipeline operation (read, update, delete), the system should verify that the authenticated user is the owner of the pipeline before allowing the operation.

**Validates: Requirements 4.4, 5.2, 6.3**

### Property 5: Sync conflict detection is accurate

_For any_ sync request where a pipeline has been modified on both client and server, the system should detect the conflict and include it in the conflicts array.

**Validates: Requirements 7.2, 7.4**

### Property 6: Webhook keys are unique and unpredictable

_For any_ created webhook, the webhook key should be unique across all webhooks and should not be predictable from other webhook keys.

**Validates: Requirements 8.1**

### Property 7: Webhook rate limiting prevents abuse

_For any_ webhook endpoint, when more than 100 requests are received within a 1-minute window, subsequent requests should be rejected with a 429 status code.

**Validates: Requirements 9.5**

### Property 8: Push notifications are sent to all active subscriptions

_For any_ user with multiple active push subscriptions, when a webhook is triggered, push notifications should be sent to all active subscriptions for that user.

**Validates: Requirements 10.2**

### Property 9: Expired push subscriptions are removed

_For any_ push notification that returns a 410 Gone status, the system should remove the expired subscription from the database.

**Validates: Requirements 10.5**

### Property 10: Share tokens enable public access

_For any_ pipeline with a share token, accessing the shared pipeline endpoint should return the pipeline data without requiring authentication.

**Validates: Requirements 11.2**

### Property 11: Cloning creates independent copies

_For any_ cloned pipeline, the new pipeline should have a different ID, be owned by the cloning user, and reference the original pipeline in the clonedFrom field.

**Validates: Requirements 11.3, 11.4**

### Property 12: Database connection is verified on startup

_For any_ application startup, the system should verify the database connection is active before accepting requests.

**Validates: Requirements 12.1, 12.3**

### Property 13: Error responses follow consistent format

_For any_ error condition, the system should return a JSON response with success: false, error code, and error message.

**Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5**

### Property 14: CORS allows extension requests

_For any_ request from the Chrome extension origin, the system should include appropriate CORS headers to allow the request.

**Validates: Requirements 15.4**

## Error Handling

### Validation Errors (400)

- Invalid email format
- Password too short
- Missing required fields
- Invalid JSON in request body

### Authentication Errors (401)

- Missing JWT token
- Invalid JWT token
- Expired JWT token
- Incorrect login credentials

### Authorization Errors (403)

- Accessing another user's pipeline
- Webhook is inactive
- Disallowed HTTP method on webhook

### Not Found Errors (404)

- Pipeline does not exist
- Webhook does not exist
- User does not exist
- Share token not found

### Conflict Errors (409)

- Email already registered
- Duplicate webhook key (should not happen with proper generation)

### Rate Limit Errors (429)

- Too many auth requests
- Too many webhook requests
- Too many API requests

### Internal Server Errors (500)

- Database connection failure
- Unexpected errors during processing
- Push notification send failure

## Testing Strategy

### Unit Testing

- **Auth Service**: Test password hashing, token generation, user creation
- **Pipeline Service**: Test CRUD operations, sync logic, conflict detection
- **Webhook Service**: Test webhook key generation, HMAC validation, request handling
- **Push Service**: Test subscription management, notification sending, payload size checking

### Integration Testing

- **Auth Flow**: Test signup → login → protected route access
- **Pipeline Sync**: Test create → sync → update → sync with conflicts
- **Webhook Flow**: Test create webhook → receive request → send push → extension receives
- **Share Flow**: Test make public → generate token → access shared → clone

### Property-Based Testing

The system will use a JavaScript property-based testing library to verify correctness properties. Each property-based test will run a minimum of 100 iterations with randomly generated inputs.

Key property-based tests:

1. **Password hashing**: Generate random passwords and verify hashes are unique and verifiable
2. **JWT tokens**: Generate random user data and verify tokens encode/decode correctly
3. **Webhook keys**: Generate multiple webhook keys and verify uniqueness
4. **Sync conflicts**: Generate random pipeline versions and verify conflict detection
5. **Rate limiting**: Generate rapid requests and verify rate limits are enforced

### End-to-End Testing

- Complete user journey: signup → create pipeline → create webhook → trigger webhook → receive push
- Multi-device sync: Create pipeline on device A → sync → access on device B
- Share and clone: Create pipeline → share → clone by another user

## Performance Optimizations

### Database Indexing

- Index on users.email for fast login lookups
- Index on pipelines.user_id for fast user pipeline queries
- Index on webhooks.webhook_key for fast webhook lookups
- Index on push_subscriptions.user_id for fast subscription queries

### Connection Pooling

```javascript
const knex = Knex({
	client: "pg",
	connection: process.env.DATABASE_URL,
	pool: {
		min: 2,
		max: 10,
	},
});
```

### Caching (Optional for Hackathon)

- Cache user info after authentication
- Cache pipeline data for frequently accessed pipelines
- Cache webhook lookups

### Async Processing

- Send push notifications asynchronously (don't block webhook response)
- Process sync operations in parallel where possible

## Security Considerations

### Password Security

- Use bcrypt with 10 salt rounds
- Never log passwords
- Enforce minimum password requirements

### JWT Security

- Use strong secret key (minimum 32 characters)
- Set reasonable expiration (7 days)
- Validate token on every protected route

### CORS Security

- Whitelist only extension origin
- Don't allow wildcard origins in production

### Rate Limiting

- Protect auth endpoints (5 req/min)
- Protect webhook endpoints (100 req/min)
- Protect API endpoints (60 req/min)

### Input Validation

- Validate all request bodies against JSON schemas
- Sanitize user input before database queries
- Use parameterized queries (Knex handles this)

### HTTPS Only

- Enforce HTTPS in production
- Set secure cookie flags
- Use HSTS headers

## Deployment Configuration

### Environment Variables

```
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://user:pass@host:5432/ghostpipes
JWT_SECRET=your-secret-key
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@ghostpipes.com
CORS_ORIGIN=chrome-extension://extension-id
```

### Health Check Endpoint

```javascript
app.get("/health", async (request, reply) => {
	try {
		await app.knex.raw("SELECT 1");
		return {
			status: "healthy",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			database: "connected",
		};
	} catch (error) {
		reply.code(503);
		return {
			status: "unhealthy",
			error: error.message,
		};
	}
});
```

### Docker Configuration

- Use Node.js 22 Alpine base image
- Expose port 8080
- Include health check in Dockerfile
- Copy only necessary files

### AWS App Runner Configuration

- CPU: 1 vCPU
- Memory: 2 GB
- Auto-scaling: 1-10 instances
- Health check path: /health
- Health check interval: 10 seconds
