# GhostPipes Backend - Steering Instructions

## Phase 1: Project Setup & Database

### Step 1.1: Initialize Project
```bash
# Create project structure
mkdir -p backend/src/{config,modules,middleware,utils,db,tests,scripts}
cd backend
npm init -y
```

**Install Dependencies:**
```bash
npm install fastify @fastify/cors @fastify/rate-limit pg bcrypt jsonwebtoken web-push
```

**Set Node Version:**
```json
// package.json
{
  "type": "module",
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### Step 1.2: Create Database Schema
**File:** `db/schema.sql`

**Instructions:**
1. Enable UUID extension
2. Create all 9 tables in order:
   - users (with email index)
   - refresh_tokens
   - pipelines (with JSONB config, GIN indexes)
   - webhooks
   - webhook_logs
   - pipeline_shares
   - pipeline_clones
   - push_subscriptions
   - pipeline_executions
3. Add indexes on all foreign keys
4. Add GIN indexes on tags and config JSONB columns
5. Create `update_updated_at_column()` trigger function
6. Apply triggers to users and pipelines tables

**Validation:** SQL should run without errors on PostgreSQL 15+

### Step 1.3: Database Connection
**File:** `src/config/database.js`

**Instructions:**
1. Import `pg` package
2. Create connection pool with:
   - max: 20 connections
   - idleTimeoutMillis: 30000
   - connectionTimeoutMillis: 10000
   - SSL enabled if DB_SSL=true
3. Add event listeners for 'connect' and 'error'
4. Export `testConnection()` async function
5. Export `pool` instance

**Validation:** Test with `await pool.query('SELECT NOW()')`

### Step 1.4: Environment Config
**File:** `src/config/env.js`

**Instructions:**
1. Export `config` object with:
   - port, nodeEnv
   - db: { host, port, database, user, password, ssl, max, timeouts }
   - jwtSecret, jwtAccessExpiry, jwtRefreshExpiry
   - webPush: { publicKey, privateKey, subject }
   - aws: { region, accessKeyId, secretAccessKey }
   - rateLimit: { max, timeWindow }
   - cors: { origin, credentials }
2. Use `process.env.*` with fallback defaults
3. No hardcoded secrets

**Validation:** All environment variables accessible via `config` object

---

## Phase 2: Utilities & Middleware

### Step 2.1: Crypto Utilities
**File:** `src/utils/crypto.js`

**Instructions:**
1. Implement `hashPassword(password)` using bcrypt with 12 rounds
2. Implement `verifyPassword(password, hash)` using bcrypt.compare
3. Implement `generateToken(bytes=32)` returning hex string
4. Implement `hashToken(token)` using SHA-256
5. Implement `encrypt(text, secret)` using AES-256-GCM:
   - Generate random IV (16 bytes)
   - Derive key with scrypt (32 bytes)
   - Return format: `iv:authTag:encrypted` (all hex)
6. Implement `decrypt(encrypted, secret)` reversing above

**Validation:** 
- Hashed passwords should verify correctly
- Encrypted data should decrypt to original
- All functions should handle errors gracefully

### Step 2.2: Authentication Middleware
**File:** `src/middleware/auth.middleware.js`

**Instructions:**
1. Export `authenticate` async function
2. Extract token from `Authorization: Bearer <token>` header
3. Verify JWT with `config.jwtSecret`
4. Check token type is "access"
5. Set `request.userId` from decoded payload
6. On error, send 401 response with proper format

**Validation:** Should reject invalid/expired tokens

### Step 2.3: Error Middleware
**File:** `src/middleware/error.middleware.js`

**Instructions:**
1. Create global error handler for Fastify
2. Log error with `request.log.error()`
3. Return standard error format:
   ```javascript
   {
     success: false,
     error: error.message || "Internal server error"
   }
   ```
4. Use `error.statusCode || 500` for status code

**Validation:** Should handle all uncaught errors gracefully

---

## Phase 3: Authentication Module

### Step 3.1: Auth Service
**File:** `src/modules/auth/auth.service.js`

**Instructions:**
1. Create `AuthService` class with static methods
2. **register({ email, password, displayName })**:
   - Check if email exists (throw error if yes)
   - Hash password with bcrypt
   - Insert into users table
   - Return user data (no password)
3. **login({ email, password })**:
   - Query user by email
   - Verify password
   - Check is_active flag
   - Update last_login timestamp
   - Generate access and refresh tokens
   - Store refresh token in database (hashed)
   - Return user + tokens
4. **generateTokens(userId)**:
   - Create JWT access token (15min)
   - Generate random refresh token
   - Return both
5. **storeRefreshToken(userId, token)**:
   - Hash token with SHA-256
   - Insert into refresh_tokens with 7-day expiry
6. **refreshTokens(refreshToken)**:
   - Hash and query token
   - Check not revoked and not expired
   - Generate new tokens
   - Revoke old token
   - Store new refresh token
   - Return new tokens
7. **logout(refreshToken)**:
   - Hash token
   - Mark as revoked in database

**Validation:** All methods should handle errors and edge cases

### Step 3.2: Auth Handlers
**File:** `src/modules/auth/auth.handlers.js`

**Instructions:**
1. Import AuthService
2. Create handler functions:
   - `registerHandler(request, reply)`
   - `loginHandler(request, reply)`
   - `refreshHandler(request, reply)`
   - `logoutHandler(request, reply)`
3. Each handler should:
   - Try/catch service method
   - Return standard response format
   - Use appropriate status codes (201 for register, 200 for others)
   - Send 400/401 on errors

**Validation:** Should integrate with AuthService correctly

### Step 3.3: Auth Schemas
**File:** `src/modules/auth/auth.schema.js`

**Instructions:**
1. Export JSON Schema objects for Fastify validation:
   - `registerSchema`: email (format: email), password (minLength: 8), displayName (optional, maxLength: 100)
   - `loginSchema`: email, password (both required)
   - `refreshSchema`: refreshToken (required)
2. Use `body` property for request schemas

**Validation:** Should enforce validation rules correctly

### Step 3.4: Auth Routes
**File:** `src/modules/auth/auth.routes.js`

**Instructions:**
1. Export default async function for Fastify plugin
2. Register routes:
   - POST /register (with registerSchema)
   - POST /login (with loginSchema)
   - POST /refresh (with refreshSchema)
   - POST /logout (with refreshSchema)
3. Attach handlers to each route

**Validation:** Routes should be accessible at `/api/auth/*`

---

## Phase 4: Pipelines Module

### Step 4.1: Pipelines Service
**File:** `src/modules/pipelines/pipelines.service.js`

**Instructions:**
1. Create `PipelineService` class with static methods
2. **create({ userId, name, description, config, category, tags, isPublic })**:
   - Insert into pipelines table
   - Stringify config to JSON
   - Return created pipeline
3. **getById(pipelineId, userId)**:
   - Query pipeline with JOIN to users for owner_name
   - Check user owns it OR is_public=true
   - Throw error if not found/no access
4. **list({ userId, category, isPublic, search, limit=50, offset=0 })**:
   - Build dynamic query with filters
   - Filter by user_id if not public
   - Add category and search filters
   - ILIKE search on name and description
   - Order by created_at DESC
   - Apply LIMIT and OFFSET
5. **update(pipelineId, userId, updates)**:
   - Build SET clause dynamically
   - Only allow: name, description, config, category, tags, is_public
   - Check user ownership
   - Update updated_at
6. **delete(pipelineId, userId)**:
   - Check ownership
   - Delete from pipelines
7. **clone(pipelineId, userId)**:
   - Get original pipeline
   - Insert new pipeline with "(Clone)" suffix
   - Insert into pipeline_clones
   - Increment original's clone_count
   - Return new pipeline_id

**Validation:** All database operations should use parameterized queries

### Step 4.2: Pipelines Handlers
**File:** `src/modules/pipelines/pipelines.handlers.js`

**Instructions:**
1. Create handlers for:
   - `createPipelineHandler` (201 status)
   - `getPipelineHandler`
   - `listPipelinesHandler` (include meta with total/limit/offset)
   - `updatePipelineHandler`
   - `deletePipelineHandler`
   - `clonePipelineHandler` (201 status)
2. Extract userId from `request.userId` (set by auth middleware)
3. Use standard response format
4. Send notification on pipeline create (optional)

**Validation:** Should work with PipelineService methods

### Step 4.3: Pipelines Schemas
**File:** `src/modules/pipelines/pipelines.schema.js`

**Instructions:**
1. Export schemas:
   - `createPipelineSchema`: name (required, 1-255), description (max 1000), config (required, object), category (max 50), tags (array), isPublic (boolean)
   - `listPipelinesSchema`: querystring with category, isPublic, search, limit (1-100), offset (min 0)

**Validation:** Should enforce all constraints

### Step 4.4: Pipelines Routes
**File:** `src/modules/pipelines/pipelines.routes.js`

**Instructions:**
1. Register routes with authenticate middleware:
   - POST / (createPipelineSchema)
   - GET / (listPipelinesSchema)
   - GET /:id
   - PUT /:id
   - DELETE /:id
   - POST /:id/clone
2. All routes require authentication via preHandler

**Validation:** Should require Bearer token for all endpoints

---

## Phase 5: Webhooks Module

### Step 5.1: Webhooks Service
**File:** `src/modules/webhooks/webhooks.service.js`

**Instructions:**
1. Create `WebhookService` class
2. **create({ pipelineId, userId, method, secret })**:
   - Generate UUID for webhook_id
   - Create webhook_url: `/webhooks/${webhookId}`
   - Encrypt secret if provided (AES-256-GCM)
   - Insert into webhooks table
3. **getByUrl(webhookUrl)**:
   - Query webhook with JOIN to pipelines for config
   - Check is_active=true
   - Return webhook + pipeline_config
4. **trigger({ webhookUrl, method, headers, body })**:
   - Get webhook by URL
   - Verify method matches
   - If secret exists:
     - Decrypt secret
     - Extract signature from X-Webhook-Signature header
     - Compute HMAC-SHA256 of body
     - Compare using crypto.timingSafeEqual()
   - Execute pipeline (placeholder for now)
   - Log to webhook_logs (request/response/timing)
   - Update last_triggered and trigger_count
   - Return status and response body
5. **verifySignature(payload, secret, signature)**:
   - Compute HMAC-SHA256(secret, JSON.stringify(payload))
   - Use timing-safe comparison
6. **list({ userId, pipelineId })**:
   - Filter by user_id
   - Optionally filter by pipeline_id
7. **delete(webhookId, userId)**:
   - Check ownership
   - Delete webhook

**Validation:** HMAC signature verification should work correctly

### Step 5.2: Webhooks Handlers & Routes
**File:** `src/modules/webhooks/webhooks.handlers.js`
**File:** `src/modules/webhooks/webhooks.routes.js`

**Instructions:**
1. Create handlers for create, list, delete (with auth)
2. Create `triggerWebhookHandler` (NO auth - public endpoint)
3. Register routes:
   - POST /api/webhooks (authenticated)
   - GET /api/webhooks (authenticated)
   - DELETE /api/webhooks/:id (authenticated)
   - POST /webhooks/:id (public trigger route)

**Validation:** Public trigger should work without token

### Step 5.3: Webhooks Schema
**File:** `src/modules/webhooks/webhooks.schema.js`

**Instructions:**
1. Export `createWebhookSchema`:
   - pipelineId (UUID format)
   - method (enum: GET, POST, PUT, DELETE, PATCH)
   - secret (optional, minLength: 16)

**Validation:** Should validate webhook creation requests

---

## Phase 6: Sharing Module

### Step 6.1: Sharing Service
**File:** `src/modules/sharing/sharing.service.js`

**Instructions:**
1. Create `SharingService` class
2. **createShare({ pipelineId, userId, accessLevel, expiresInDays })**:
   - Generate 64-char hex token
   - Calculate expires_at if expiresInDays provided
   - Insert into pipeline_shares
3. **getByToken(shareToken)**:
   - Query share with JOINs to pipelines and users
   - Check not expired
   - Increment access_count and update last_accessed
   - Return share + pipeline data + owner_name
4. **list({ userId, pipelineId })**:
   - Filter by shared_by user_id
   - Optionally filter by pipeline_id
5. **revoke(shareId, userId)**:
   - Check ownership (shared_by)
   - Delete share

**Validation:** Share token should be unique and secure

### Step 6.2: Sharing Handlers & Routes
**File:** `src/modules/sharing/sharing.handlers.js`
**File:** `src/modules/sharing/sharing.routes.js`

**Instructions:**
1. Create handlers:
   - `createShareHandler` (201 status)
   - `getSharedPipelineHandler` (NO auth)
   - `cloneSharedPipelineHandler` (requires auth, check accessLevel)
   - `listSharesHandler`
   - `revokeShareHandler`
2. Register routes:
   - POST / (authenticated)
   - GET / (authenticated)
   - GET /:token (public)
   - POST /:token/clone (authenticated)
   - DELETE /:id (authenticated)

**Validation:** Should enforce access levels correctly

### Step 6.3: Sharing Schema
**File:** `src/modules/sharing/sharing.schema.js`

**Instructions:**
1. Export schemas:
   - `createShareSchema`: pipelineId (UUID), accessLevel (enum: view, clone, edit), expiresInDays (1-365, optional)
   - `getSharedSchema`: params with token (minLength: 32)

**Validation:** Should validate share requests

---

## Phase 7: Notifications Module

### Step 7.1: Notifications Service
**File:** `src/modules/notifications/notifications.service.js`

**Instructions:**
1. Import `web-push` package
2. Configure VAPID:
   ```javascript
   webpush.setVapidDetails(
     config.webPush.subject,
     config.webPush.publicKey,
     config.webPush.privateKey
   );
   ```
3. **subscribe({ userId, subscription })**:
   - Extract endpoint, keys from subscription
   - INSERT or UPDATE push_subscriptions
   - ON CONFLICT update last_used
4. **sendNotification({ userId, title, body, data })**:
   - Query all subscriptions for user
   - Build Web Push payload:
     ```javascript
     {
       title,
       body,
       data,
       icon: "/assets/icon-192.png",
       badge: "/assets/badge-72.png"
     }
     ```
   - Send to each subscription
   - Handle 410 Gone (delete subscription)
   - Update last_used on success
5. **unsubscribe({ userId, endpoint })**:
   - Delete matching subscription

**Validation:** Should integrate with web-push library correctly

### Step 7.2: Notifications Handlers & Routes
**File:** `src/modules/notifications/notifications.handlers.js`
**File:** `src/modules/notifications/notifications.routes.js`

**Instructions:**
1. Create handlers for subscribe and unsubscribe
2. Register routes (both require auth):
   - POST /subscribe
   - POST /unsubscribe

**Validation:** Should save subscriptions to database

---

## Phase 8: Main Application

### Step 8.1: Fastify App
**File:** `src/app.js`

**Instructions:**
1. Create `buildApp()` async function
2. Initialize Fastify with logger (in development only)
3. Register plugins:
   - @fastify/cors (with config.cors)
   - @fastify/rate-limit (with config.rateLimit)
4. Register all route modules:
   - authRoutes at `/api/auth`
   - pipelineRoutes at `/api/pipelines`
   - webhookRoutes at `/api/webhooks`
   - webhookTriggerRoute at `/webhooks`
   - sharingRoutes at `/api/shares`
   - notificationRoutes at `/api/notifications`
5. Add health check: `GET /health` returning `{ status: "ok", timestamp: Date }`
6. Register global error handler
7. Export buildApp function

**Validation:** App should start without errors

### Step 8.2: Server Entry Point
**File:** `src/server.js`

**Instructions:**
1. Import buildApp and config
2. Import testConnection
3. Create `start()` async function:
   - Test database connection
   - Build Fastify app
   - Listen on config.port and 0.0.0.0
   - Log success message with port
4. Catch errors and exit(1)
5. Call start()

**Validation:** Server should start and connect to database

---

## Phase 9: Testing

### Step 9.1: Auth Tests
**File:** `tests/auth.test.js`

**Instructions:**
1. Import Node.js test runner (`node:test`)
2. Create test suite with before/after hooks
3. Test cases:
   - POST /register creates user (201)
   - POST /register rejects duplicate email (400)
   - POST /login returns tokens (200)
   - POST /login rejects invalid password (401)
   - POST /refresh refreshes tokens (200)
   - POST /logout revokes token (200)

**Validation:** All tests should pass

### Step 9.2: Pipelines Tests
**File:** `tests/pipelines.test.js`

**Instructions:**
1. Setup: Create user and login before tests
2. Test cases:
   - POST /pipelines creates pipeline (201)
   - GET /pipelines lists pipelines (200)
   - GET /pipelines/:id returns details (200)
   - PUT /pipelines/:id updates (200)
   - POST /pipelines/:id/clone clones (201)
   - DELETE /pipelines/:id deletes (200)

**Validation:** All CRUD operations should work

### Step 9.3: Webhooks Tests
**File:** `tests/webhooks.test.js`

**Instructions:**
1. Setup: Create user, pipeline, webhook
2. Test cases:
   - POST /webhooks creates webhook (201)
   - POST /webhooks/:id triggers with valid signature (200)
   - POST /webhooks/:id rejects invalid signature (400)
   - GET /webhooks lists webhooks (200)
   - DELETE /webhooks/:id deletes (200)

**Validation:** HMAC verification should work

---

## Phase 10: Scripts & Deployment

### Step 10.1: Migration Script
**File:** `scripts/migrate.js`

**Instructions:**
1. Read `db/schema.sql` file
2. Execute SQL against database
3. Log success/error
4. Exit with appropriate code

**Validation:** Should create all tables

### Step 10.2: Seed Script
**File:** `scripts/seed.js`

**Instructions:**
1. Create demo user with known credentials
2. Create 2-3 template pipelines (public, is_template=true)
3. Log credentials for demo user
4. Exit with success code

**Validation:** Should populate database with sample data

### Step 10.3: Package.json Scripts
**File:** `package.json`

**Instructions:**
Add scripts:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js",
    "db:migrate": "node scripts/migrate.js",
    "db:seed": "node scripts/seed.js",
    "test": "node --test tests/*.test.js"
  }
}
```

**Validation:** All npm scripts should work

### Step 10.4: Environment Template
**File:** `.env.example`

**Instructions:**
1. Copy all required environment variables
2. Use placeholder values (no real secrets)
3. Add comments explaining each variable
4. Include VAPID key generation command

**Validation:** Should document all config options

### Step 10.5: README
**File:** `README.md`

**Instructions:**
1. Project overview
2. Tech stack
3. Setup instructions:
   - Install dependencies
   - Configure .env
   - Run migrations
   - Generate VAPID keys
   - Start server
4. API documentation (brief)
5. Testing instructions
6. Deployment guide
7. AWS setup steps

**Validation:** Should be clear for new developers

---

## Phase 11: AWS Deployment (Optional)

### Step 11.1: AWS Setup Script
**File:** `scripts/aws-setup.sh`

**Instructions:**
1. Make executable: `chmod +x`
2. Create Aurora Serverless v2 cluster
3. Create security groups
4. Create IAM roles
5. Create Elastic Beanstalk application
6. Store secrets in Secrets Manager
7. Configure environment variables
8. Run migrations
9. Generate VAPID keys
10. Deploy application

**Validation:** Should provision all AWS resources

---

## Common Pitfalls to Avoid

1. **Forgot to stringify JSON**: Always `JSON.stringify()` when inserting JSONB
2. **SQL injection**: Always use parameterized queries (`$1, $2`)
3. **Missing await**: All database calls are async
4. **Token in quotes**: Fastify schemas don't need quotes around values
5. **CORS issues**: Must whitelist extension origin
6. **HMAC timing attack**: Use `crypto.timingSafeEqual()` not `===`
7. **Password in response**: Never return password_hash to client
8. **Forgot to hash refresh token**: Store SHA-256 hash, not plaintext
9. **No error handling**: Wrap all async operations in try/catch
10. **Hardcoded secrets**: Use environment variables for all secrets

---

## Implementation Order Summary

1. ✅ Project setup + Database schema
2. ✅ Config + Database connection
3. ✅ Crypto utilities + Middleware
4. ✅ Authentication module (complete)
5. ✅ Pipelines module (complete)
6. ✅ Webhooks module (complete)
7. ✅ Sharing module (complete)
8. ✅ Notifications module (complete)
9. ✅ Main app + Server
10. ✅ Tests for all modules
11. ✅ Scripts + Deployment
12. ✅ Documentation

---

## Testing Checklist

- [ ] Health check returns 200
- [ ] Register creates user
- [ ] Login returns JWT tokens
- [ ] Refresh token works
- [ ] Protected routes require auth
- [ ] Pipeline CRUD operations work
- [ ] Webhook triggers with HMAC
- [ ] Share links work (public access)
- [ ] Clone from share respects access level
- [ ] Web Push subscriptions save
- [ ] Rate limiting triggers at 100 requests
- [ ] Invalid JWT returns 401
- [ ] SQL injection blocked
- [ ] CORS allows extension origin
- [ ] Database connection pool works

---

## Final Validation

1. Start server: `npm start`
2. Run tests: `npm test` (all should pass)
3. Test health: `curl http://localhost:3000/health`
4. Register user via POST /api/auth/register
5. Login and get JWT
6. Create pipeline with JWT
7. Create webhook for pipeline
8. Trigger webhook (no auth)
9. Create share link
10. Access share link (public)
11. Subscribe to notifications
12. Check database for all records

---

## Success Metrics

- All API endpoints respond correctly
- All tests pass (100% coverage of happy paths)
- Database schema matches specification
- JWT authentication works end-to-end
- Webhooks trigger successfully with HMAC
- Rate limiting prevents abuse
- Error handling returns proper formats
- CORS configured for extension
- Deployed to AWS (optional but recommended)
- README clear and complete

---

## Emergency Fixes

**Database won't connect:**
- Check DB_HOST, DB_PORT, DB_PASSWORD
- Verify Aurora security group allows inbound 5432
- Test with psql command line

**JWT verification fails:**
- Ensure JWT_SECRET matches between sign and verify
- Check token hasn't expired
- Verify Authorization header format: `Bearer <token>`

**HMAC signature fails:**
- Ensure consistent JSON.stringify (no extra whitespace)
- Use same secret for sign and verify
- Compare hex strings, not buffers

**CORS errors:**
- Check CORS_ORIGIN includes extension ID
- Use correct format: `chrome-extension://xxx`
- Enable credentials: true

**Rate limit too strict:**
- Increase max requests in config
- Exclude health check from rate limit
- Use Redis for distributed rate limiting (optional)