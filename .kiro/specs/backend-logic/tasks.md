# Implementation Plan

- [ ] 1. Set up project structure and dependencies

  - Initialize Node.js project with package.json
  - Install Fastify, Knex, bcrypt, @fastify/jwt, @fastify/cors, @fastify/rate-limit, @block65/webcrypto-web-push, nanoid
  - Create directory structure (src/modules, src/db, src/utils)
  - Set up .env file with environment variables
  - Create .gitignore file
  - _Requirements: 12.1, 13.4_

- [ ] 2. Configure database connection and migrations

  - Create knexfile.js with PostgreSQL configuration
  - Create Knex instance in src/db/knex.js
  - Create migration for users table
  - Create migration for pipelines table
  - Create migration for webhooks table
  - Create migration for push_subscriptions table
  - Add database indexes for performance
  - _Requirements: 12.1, 12.2, 12.4_

- [ ] 3. Implement data model classes

  - Create User model class in src/models/User.js
  - Create Pipeline model class in src/models/Pipeline.js
  - Create Webhook model class in src/models/Webhook.js
  - Create PushSubscription model class in src/models/PushSubscription.js
  - Add JSDoc type annotations for all models
  - _Requirements: 1.1, 3.1, 8.1, 10.1_

- [ ] 4. Create utility functions and error classes

  - Create custom error classes in src/utils/errors.js (ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError)
  - Create helper functions in src/utils/helpers.js
  - Create error handler middleware
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 5. Implement authentication service

  - Create AuthService class in src/modules/auth/service.js
  - Implement signup method with password hashing
  - Implement login method with password verification
  - Implement getUserInfo method
  - Implement hashPassword method using bcrypt
  - Implement verifyPassword method using bcrypt
  - Implement generateToken method using JWT
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.4_

- [ ] 6. Create authentication routes and handlers

  - Create auth route schemas in src/modules/auth/schemas.js
  - Create POST /api/auth/signup handler
  - Create POST /api/auth/login handler
  - Create POST /api/auth/logout handler
  - Create GET /api/auth/me handler
  - Register auth module as Fastify plugin
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 7. Implement pipeline service

  - Create PipelineService class in src/modules/pipelines/service.js
  - Implement createPipeline method
  - Implement listPipelines method with pagination
  - Implement getPipeline method with ownership check
  - Implement updatePipeline method with ownership check
  - Implement deletePipeline method with ownership check and cascade
  - Implement syncPipelines method with conflict detection
  - Implement generateShareToken method
  - Implement getSharedPipeline method
  - Implement clonePipeline method
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 8. Create pipeline routes and handlers

  - Create pipeline route schemas in src/modules/pipelines/schemas.js
  - Create GET /api/pipelines handler with pagination
  - Create POST /api/pipelines handler
  - Create GET /api/pipelines/:id handler
  - Create PUT /api/pipelines/:id handler
  - Create DELETE /api/pipelines/:id handler
  - Create POST /api/pipelines/sync handler
  - Create POST /api/pipelines/:id/share handler
  - Create GET /api/pipelines/shared/:shareToken handler (public)
  - Create POST /api/pipelines/:id/clone handler
  - Register pipelines module as Fastify plugin
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 9. Implement push notification service

  - Create PushService class in src/modules/push/service.js
  - Implement subscribe method to store push subscriptions
  - Implement unsubscribe method to remove subscriptions
  - Implement sendPushToUser method to send notifications to all user subscriptions
  - Implement shouldSendDirectData method to check payload size
  - Implement sendNotification method using @block65/webcrypto-web-push
  - Handle 410 Gone responses by removing expired subscriptions
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 10. Create push notification routes and handlers

  - Create push route schemas in src/modules/push/schemas.js
  - Create POST /api/push/subscribe handler
  - Create DELETE /api/push/unsubscribe handler
  - Create POST /api/push/test handler
  - Register push module as Fastify plugin
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 11. Implement webhook service

  - Create WebhookService class in src/modules/webhooks/service.js
  - Implement createWebhook method with webhook key generation
  - Implement listWebhooks method
  - Implement deleteWebhook method with ownership check
  - Implement handleWebhookRequest method
  - Implement generateWebhookKey method using nanoid
  - Implement validateHmac method for optional signature verification
  - Integrate with PushService to send notifications on webhook trigger
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 12. Create webhook routes and handlers

  - Create webhook route schemas in src/modules/webhooks/schemas.js
  - Create POST /api/webhooks handler
  - Create GET /api/webhooks handler
  - Create DELETE /api/webhooks/:id handler
  - Create POST /webhook/:webhookKey handler (public, no auth)
  - Add rate limiting to public webhook endpoint (100 req/min)
  - Register webhooks module as Fastify plugin
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 13. Configure Fastify app with plugins

  - Create app.js with buildApp function
  - Register @fastify/cors with extension origin
  - Register @fastify/rate-limit with appropriate limits
  - Register @fastify/jwt with secret from environment
  - Decorate Fastify instance with Knex
  - Register all module plugins
  - Add global error handler
  - Add preHandler hook for JWT verification on protected routes
  - _Requirements: 2.5, 13.4, 14.1, 14.2, 14.3, 14.4, 14.5, 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 14. Create server entry point and health check

  - Create server.js to start Fastify server
  - Implement /health endpoint with database connection check
  - Add graceful shutdown handling
  - Add startup logging
  - _Requirements: 12.3, 12.5, 13.3_

- [ ] 15. Create Dockerfile for containerization

  - Create Dockerfile with Node.js 22 Alpine base
  - Copy package files and install production dependencies
  - Copy source code
  - Expose port 8080
  - Add health check command
  - Set CMD to start server
  - Create .dockerignore file
  - _Requirements: 13.1, 13.2, 13.3_

- [ ] 16. Add rate limiting configuration

  - Configure auth endpoints with 5 req/min limit
  - Configure webhook endpoints with 100 req/min limit
  - Configure API endpoints with 60 req/min limit
  - Configure public share endpoints with 30 req/min limit
  - _Requirements: 2.3, 9.5_

- [ ] 17. Implement request validation schemas

  - Create JSON schemas for all request bodies
  - Add schema validation to all route handlers
  - Create response schemas for documentation
  - _Requirements: 14.1, 15.5_

- [ ] 18. Add comprehensive error handling

  - Ensure all errors return consistent JSON format
  - Add error logging for 500 errors
  - Add validation error details
  - Test error responses for all error codes
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 19. Create database seed data for testing

  - Create seed file with sample users
  - Create seed file with sample pipelines
  - Create seed file with sample webhooks
  - Add npm script to run seeds
  - _Requirements: Testing support_

- [ ] 20. Write unit tests for services

  - Write tests for AuthService (signup, login, password hashing, token generation)
  - Write tests for PipelineService (CRUD, sync, conflict detection)
  - Write tests for WebhookService (creation, key generation, HMAC validation)
  - Write tests for PushService (subscription management, notification sending)
  - _Requirements: All service requirements_

- [ ] 21. Write integration tests for API endpoints

  - Write tests for auth flow (signup → login → protected route)
  - Write tests for pipeline CRUD operations
  - Write tests for pipeline sync with conflicts
  - Write tests for webhook creation and triggering
  - Write tests for push notification subscription
  - Write tests for share and clone functionality
  - _Requirements: All API requirements_

- [ ] 22. Write end-to-end tests

  - Test complete user journey (signup → create pipeline → create webhook → trigger → push)
  - Test multi-device sync scenario
  - Test share and clone workflow
  - Test error handling scenarios
  - _Requirements: All requirements_

- [ ] 23. Create deployment documentation

  - Document environment variables
  - Document database setup steps
  - Document Docker build and run commands
  - Document AWS App Runner deployment steps
  - Create README.md with setup instructions
  - _Requirements: 13.4, 13.5_

- [ ] 24. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
