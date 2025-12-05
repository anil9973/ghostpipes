# Requirements Document

## Introduction

The GhostPipes Backend is a RESTful API server that provides authentication, pipeline management, webhook handling, and web push notification services for the GhostPipes Chrome extension. The system enables users to create, sync, and share automation pipelines while receiving real-time notifications when webhooks are triggered. The backend is built with Fastify, uses Amazon Aurora PostgreSQL for data persistence, and deploys on AWS App Runner.

## Glossary

- **Backend Server**: The Fastify-based Node.js application serving the REST API
- **Pipeline**: A user-created automation workflow consisting of nodes and pipes
- **Webhook**: An HTTP endpoint that receives requests from third-party services and triggers pipeline execution
- **Web Push**: Browser push notifications sent to the Chrome extension service worker
- **VAPID**: Voluntary Application Server Identification for Web Push protocol
- **JWT**: JSON Web Token used for user authentication
- **Sync**: The process of synchronizing pipeline data between the extension and server
- **Share Token**: A unique identifier allowing public access to a pipeline
- **Aurora PostgreSQL**: Amazon's managed PostgreSQL database service
- **App Runner**: AWS service for deploying containerized applications

## Requirements

### Requirement 1

**User Story:** As a user, I want to register an account with email and password, so that I can save my pipelines to the cloud.

#### Acceptance Criteria

1. WHEN a user submits valid registration data THEN the system SHALL create a new user account with hashed password
2. WHEN a user submits an email that already exists THEN the system SHALL return a conflict error with message "This email is already registered"
3. WHEN a user submits an invalid email format THEN the system SHALL return a validation error
4. WHEN a user submits a password shorter than 8 characters THEN the system SHALL return a validation error
5. WHEN a user successfully registers THEN the system SHALL return a JWT token valid for 7 days

### Requirement 2

**User Story:** As a user, I want to log in with my email and password, so that I can access my saved pipelines.

#### Acceptance Criteria

1. WHEN a user submits valid login credentials THEN the system SHALL return a JWT token and user information
2. WHEN a user submits incorrect credentials THEN the system SHALL return an unauthorized error with message "Email or password is incorrect"
3. WHEN a user makes more than 5 login attempts within 1 minute THEN the system SHALL rate limit the requests
4. WHEN a user logs in successfully THEN the system SHALL include userId, email, and displayName in the response
5. WHEN a user provides a valid JWT token THEN the system SHALL authenticate protected route requests

### Requirement 3

**User Story:** As a user, I want to create and save pipelines to the server, so that I can access them from any device.

#### Acceptance Criteria

1. WHEN a user creates a new pipeline THEN the system SHALL store the pipeline with a unique ID and timestamp
2. WHEN a user creates a pipeline THEN the system SHALL validate that the pipeline definition contains required fields (title, nodes, pipes)
3. WHEN a user creates a pipeline THEN the system SHALL associate the pipeline with the authenticated user
4. WHEN a user creates a pipeline THEN the system SHALL return the complete pipeline object including generated ID
5. WHEN a user creates a pipeline with isPublic set to true THEN the system SHALL generate a unique share token

### Requirement 4

**User Story:** As a user, I want to retrieve my saved pipelines, so that I can view and edit them.

#### Acceptance Criteria

1. WHEN a user requests their pipelines THEN the system SHALL return only pipelines owned by that user
2. WHEN a user requests pipelines with pagination THEN the system SHALL return results limited by the specified page and limit parameters
3. WHEN a user requests a specific pipeline by ID THEN the system SHALL return the complete pipeline definition
4. WHEN a user requests a pipeline they do not own THEN the system SHALL return a forbidden error
5. WHEN a user requests a non-existent pipeline THEN the system SHALL return a not found error

### Requirement 5

**User Story:** As a user, I want to update my existing pipelines, so that I can modify my automation workflows.

#### Acceptance Criteria

1. WHEN a user updates a pipeline THEN the system SHALL save the changes and update the updatedAt timestamp
2. WHEN a user updates a pipeline they do not own THEN the system SHALL return a forbidden error
3. WHEN a user updates a pipeline with invalid data THEN the system SHALL return a validation error
4. WHEN a user sets isPublic to true on update THEN the system SHALL generate a share token if one does not exist
5. WHEN a user updates a pipeline THEN the system SHALL return the updated pipeline object

### Requirement 6

**User Story:** As a user, I want to delete pipelines I no longer need, so that I can keep my workspace organized.

#### Acceptance Criteria

1. WHEN a user deletes a pipeline THEN the system SHALL remove the pipeline from the database
2. WHEN a user deletes a pipeline THEN the system SHALL also delete associated webhooks
3. WHEN a user deletes a pipeline they do not own THEN the system SHALL return a forbidden error
4. WHEN a user deletes a non-existent pipeline THEN the system SHALL return a not found error
5. WHEN a user deletes a pipeline THEN the system SHALL return a success confirmation

### Requirement 7

**User Story:** As a user, I want to sync my pipelines between the extension and server automatically, so that my work is always backed up.

#### Acceptance Criteria

1. WHEN the extension sends a sync request with multiple pipelines THEN the system SHALL process each pipeline and return sync results
2. WHEN a pipeline has been modified on both client and server THEN the system SHALL detect the conflict and return conflict information
3. WHEN a pipeline sync succeeds THEN the system SHALL include the pipeline ID in the synced array
4. WHEN a pipeline has a version mismatch THEN the system SHALL include the pipeline in the conflicts array with server and client versions
5. WHEN the sync request contains invalid pipeline data THEN the system SHALL return a validation error

### Requirement 8

**User Story:** As a user, I want to create webhooks for my pipelines, so that third-party services can trigger my automations.

#### Acceptance Criteria

1. WHEN a user creates a webhook THEN the system SHALL generate a unique webhook key with prefix "gh\_"
2. WHEN a user creates a webhook THEN the system SHALL return the full webhook URL
3. WHEN a user creates a webhook THEN the system SHALL associate it with the specified pipeline
4. WHEN a user creates a webhook with allowed methods THEN the system SHALL store the method restrictions
5. WHEN a user creates a webhook with a secret THEN the system SHALL store the secret for HMAC validation

### Requirement 9

**User Story:** As a third-party service, I want to send HTTP requests to webhook URLs, so that I can trigger pipeline executions.

#### Acceptance Criteria

1. WHEN a request is sent to a valid webhook URL THEN the system SHALL accept the request and return 200 OK
2. WHEN a request is sent to an inactive webhook THEN the system SHALL return a forbidden error
3. WHEN a request is sent with a disallowed HTTP method THEN the system SHALL return a method not allowed error
4. WHEN a webhook receives a request THEN the system SHALL send a web push notification to the user's extension
5. WHEN a webhook receives more than 100 requests per minute THEN the system SHALL rate limit and return 429

### Requirement 10

**User Story:** As a user, I want to receive push notifications in my extension when webhooks are triggered, so that I can execute pipelines in real-time.

#### Acceptance Criteria

1. WHEN a user subscribes to push notifications THEN the system SHALL store the subscription endpoint and keys
2. WHEN a webhook is triggered THEN the system SHALL send a push notification to all active subscriptions for that user
3. WHEN a push notification payload is smaller than 4KB THEN the system SHALL include the webhook data directly in the notification
4. WHEN a push notification payload exceeds 4KB THEN the system SHALL send a fetch instruction instead of direct data
5. WHEN a push subscription returns a 410 Gone error THEN the system SHALL remove the expired subscription from the database

### Requirement 11

**User Story:** As a user, I want to share my pipelines publicly, so that others can view and clone them.

#### Acceptance Criteria

1. WHEN a user makes a pipeline public THEN the system SHALL generate a unique share token
2. WHEN anyone accesses a shared pipeline URL THEN the system SHALL return the pipeline data without requiring authentication
3. WHEN a user clones a shared pipeline THEN the system SHALL create a new pipeline owned by the cloning user
4. WHEN a user clones a pipeline THEN the system SHALL set the clonedFrom field to the original pipeline ID
5. WHEN a pipeline is cloned THEN the system SHALL increment the clone count on the original pipeline

### Requirement 12

**User Story:** As a developer, I want the backend to use Amazon Aurora PostgreSQL, so that the application demonstrates AWS integration for the hackathon.

#### Acceptance Criteria

1. WHEN the application starts THEN the system SHALL connect to an Amazon Aurora PostgreSQL database
2. WHEN database queries are executed THEN the system SHALL use Knex.js as the query builder
3. WHEN the database connection fails THEN the system SHALL log the error and prevent the server from starting
4. WHEN database migrations are run THEN the system SHALL create all required tables with proper indexes
5. WHEN the health check endpoint is called THEN the system SHALL verify the database connection is active

### Requirement 13

**User Story:** As a developer, I want the backend to deploy on AWS App Runner, so that the application is scalable and easy to manage.

#### Acceptance Criteria

1. WHEN the application is containerized THEN the system SHALL use a Dockerfile with Node.js 22 Alpine base image
2. WHEN the container starts THEN the system SHALL expose port 8080 for HTTP traffic
3. WHEN the health check endpoint is called THEN the system SHALL return status 200 with health information
4. WHEN environment variables are configured THEN the system SHALL read DATABASE_URL, JWT_SECRET, and VAPID keys
5. WHEN the application is deployed THEN the system SHALL be accessible via the App Runner service URL

### Requirement 14

**User Story:** As a developer, I want comprehensive error handling, so that API consumers receive clear error messages.

#### Acceptance Criteria

1. WHEN a validation error occurs THEN the system SHALL return a 400 status with error code "VALIDATION_ERROR"
2. WHEN an authentication error occurs THEN the system SHALL return a 401 status with error code "UNAUTHORIZED"
3. WHEN a forbidden action is attempted THEN the system SHALL return a 403 status with error code "FORBIDDEN"
4. WHEN a resource is not found THEN the system SHALL return a 404 status with error code "NOT_FOUND"
5. WHEN an internal server error occurs THEN the system SHALL return a 500 status with error code "INTERNAL_ERROR" and log the error

### Requirement 15

**User Story:** As a developer, I want the API to follow RESTful conventions, so that it is intuitive and consistent.

#### Acceptance Criteria

1. WHEN defining routes THEN the system SHALL use appropriate HTTP methods (GET, POST, PUT, DELETE)
2. WHEN returning successful responses THEN the system SHALL use appropriate status codes (200, 201, 204)
3. WHEN returning data THEN the system SHALL use consistent JSON response format with success and data fields
4. WHEN handling CORS THEN the system SHALL allow requests from the Chrome extension origin
5. WHEN processing requests THEN the system SHALL validate request bodies against JSON schemas
