# Requirements Document

## Introduction

This document specifies the requirements for implementing webhook support in GhostPipes. Webhooks enable pipelines to be triggered by external HTTP requests, allowing integration with third-party services, APIs, and automation tools. The implementation includes webhook creation, configuration, authentication, payload handling, and real-time notification delivery via web push.

## Glossary

- **Webhook**: An HTTP endpoint that triggers a pipeline when called by external services
- **Webhook Token**: A unique identifier in the webhook URL used for routing and authentication
- **Webhook Secret**: An optional password for additional security validation
- **Web Push**: Browser notification mechanism for delivering webhook trigger events to the extension
- **Service Worker**: Background script that receives web push notifications and triggers pipelines
- **Webhook Payload**: The data sent in the HTTP request body when triggering a webhook
- **Webhook Method**: The HTTP verb (GET, POST, PUT, DELETE, PATCH) accepted by the webhook
- **WebhookConfig**: Configuration model for webhook input nodes
- **WebhookNodePopup**: UI component for configuring webhook nodes
- **ApiClient**: Service for communicating with the backend API

## Requirements

### Requirement 1: Webhook Configuration Model

**User Story:** As a developer, I want a robust webhook configuration model, so that all webhook settings are properly validated and stored.

#### Acceptance Criteria

1. THE WebhookConfig class SHALL support webhookId, method, secret, customHeaders, payloadFormat, and rateLimitConfig properties
2. THE WebhookConfig class SHALL validate that webhookId is a non-empty string
3. THE WebhookConfig class SHALL validate that method is one of GET, POST, PUT, DELETE, or PATCH
4. THE WebhookConfig class SHALL allow secret to be optional
5. THE WebhookConfig class SHALL support custom headers as key-value pairs
6. THE WebhookConfig class SHALL support payload format options (JSON, form-data, raw)
7. THE WebhookConfig class SHALL include rate limiting configuration (requests per minute)
8. THE WebhookConfig class SHALL provide a getSummary() method that returns a human-readable description
9. THE WebhookConfig class SHALL serialize to JSON for storage
10. THE WebhookConfig class SHALL deserialize from JSON for loading

### Requirement 2: Webhook Node UI Component

**User Story:** As a pipeline designer, I want an intuitive UI for configuring webhooks, so that I can easily set up external triggers.

#### Acceptance Criteria

1. WHEN a webhook node is opened THEN the WebhookNodePopup SHALL display the full webhook URL
2. THE WebhookNodePopup SHALL provide a copy button to copy the webhook URL to clipboard
3. WHEN the webhook has a secret THEN the WebhookNodePopup SHALL display it with a hide/reveal toggle
4. THE WebhookNodePopup SHALL provide a method selector dropdown for GET, POST, PUT, DELETE, and PATCH
5. THE WebhookNodePopup SHALL provide a "Test Webhook" button that sends a sample payload
6. WHEN the test button is clicked THEN the system SHALL send a test request and display the result
7. THE WebhookNodePopup SHALL display the last 5 webhook calls with timestamps and status codes
8. THE WebhookNodePopup SHALL show a status indicator (active/inactive) based on webhook registration
9. THE WebhookNodePopup SHALL display webhook analytics including total calls and error count
10. THE WebhookNodePopup SHALL allow users to regenerate the webhook secret
11. THE WebhookNodePopup SHALL allow users to delete the webhook

### Requirement 3: Authentication Integration

**User Story:** As a user, I want webhooks to require authentication, so that only I can create and manage my webhook endpoints.

#### Acceptance Criteria

1. WHEN a user attempts to create a webhook without authentication THEN the system SHALL display "Login Required" message
2. WHEN a user is not authenticated THEN the system SHALL disable webhook creation controls
3. WHEN a user clicks "Create Webhook" without auth THEN the system SHALL show the UserAuthDialog
4. WHEN a user successfully authenticates THEN the system SHALL enable webhook creation
5. WHEN a user successfully authenticates THEN the system SHALL display the webhook URL
6. THE system SHALL handle token refresh automatically when tokens expire
7. WHEN authentication fails THEN the system SHALL display an error message
8. THE system SHALL store authentication tokens securely in chrome.storage
9. WHEN a user logs out THEN the system SHALL disable webhook functionality
10. THE system SHALL validate authentication before making webhook API calls

### Requirement 4: Webhook Backend Integration

**User Story:** As a developer, I want seamless integration with the backend webhook service, so that webhooks are properly registered and managed.

#### Acceptance Criteria

1. WHEN a webhook node is created THEN the system SHALL call POST /webhooks to register the webhook
2. THE system SHALL send pipelineId, method, and optional secret in the registration request
3. WHEN registration succeeds THEN the system SHALL store the webhookId in the node config
4. WHEN a webhook is deleted THEN the system SHALL call DELETE /webhooks/:id
5. THE system SHALL call GET /webhooks/pipeline/:pipelineId to list webhooks for a pipeline
6. THE system SHALL call GET /webhooks/:id/data to retrieve recent webhook calls
7. THE system SHALL handle backend errors gracefully with user-friendly messages
8. THE system SHALL retry failed requests with exponential backoff
9. THE system SHALL validate webhook responses match expected schema
10. THE system SHALL update webhook configuration via PUT /webhooks/:id when settings change

### Requirement 5: Webhook Triggering and Payload Handling

**User Story:** As a pipeline designer, I want webhooks to trigger my pipeline with the received data, so that I can process external events.

#### Acceptance Criteria

1. WHEN an external service calls the webhook URL THEN the backend SHALL validate the token
2. WHEN the webhook secret is set THEN the backend SHALL validate the secret in the request
3. WHEN validation succeeds THEN the backend SHALL extract the payload from the request
4. THE backend SHALL support JSON, form-data, and raw text payloads
5. THE backend SHALL extract query parameters from GET requests
6. THE backend SHALL extract headers from the request
7. THE backend SHALL send a web push notification to the user's browser
8. THE web push notification SHALL include the webhookId and payload data
9. WHEN the extension service worker receives the notification THEN it SHALL trigger the associated pipeline
10. THE system SHALL pass the webhook payload as input to the pipeline execution

### Requirement 6: Web Push Notification Delivery

**User Story:** As a user, I want to receive real-time notifications when my webhooks are triggered, so that my pipelines execute immediately.

#### Acceptance Criteria

1. WHEN a user authenticates THEN the system SHALL subscribe to web push notifications
2. THE system SHALL send the push subscription to the backend via POST /push/subscribe
3. THE backend SHALL store the push subscription associated with the user
4. WHEN a webhook is triggered THEN the backend SHALL send a web push notification
5. THE web push notification SHALL include webhookId, pipelineId, and payload
6. THE extension service worker SHALL listen for push events
7. WHEN a push event is received THEN the service worker SHALL extract the webhook data
8. THE service worker SHALL trigger the pipeline execution with the webhook payload
9. THE system SHALL display a browser notification to the user (optional setting)
10. THE system SHALL handle push subscription expiration and re-subscribe automatically

### Requirement 7: Webhook Testing

**User Story:** As a pipeline designer, I want to test my webhooks before deploying, so that I can verify they work correctly.

#### Acceptance Criteria

1. WHEN a user clicks "Test Webhook" THEN the system SHALL send a sample POST request to the webhook URL
2. THE test request SHALL include a sample JSON payload with test data
3. THE test request SHALL include the webhook secret if configured
4. WHEN the test succeeds THEN the system SHALL display "Test successful" with response details
5. WHEN the test fails THEN the system SHALL display the error message and status code
6. THE system SHALL show the test request and response in a collapsible section
7. THE system SHALL allow users to customize the test payload
8. THE system SHALL validate that the pipeline executes with the test data
9. THE system SHALL display execution results in the UI
10. THE system SHALL log test requests separately from production webhook calls

### Requirement 8: Webhook Analytics and Monitoring

**User Story:** As a pipeline designer, I want to see webhook usage statistics, so that I can monitor performance and troubleshoot issues.

#### Acceptance Criteria

1. THE WebhookNodePopup SHALL display total webhook call count
2. THE WebhookNodePopup SHALL display successful call count
3. THE WebhookNodePopup SHALL display failed call count
4. THE WebhookNodePopup SHALL display average response time
5. THE WebhookNodePopup SHALL display the last 5 webhook calls with timestamps
6. WHEN displaying recent calls THEN the system SHALL show method, status code, and timestamp
7. WHEN a call failed THEN the system SHALL display the error message
8. THE system SHALL allow users to view full request and response details for each call
9. THE system SHALL provide a "Clear History" button to reset analytics
10. THE system SHALL update analytics in real-time when new webhook calls occur

### Requirement 9: Rate Limiting and Security

**User Story:** As a system administrator, I want rate limiting on webhooks, so that the system is protected from abuse.

#### Acceptance Criteria

1. THE backend SHALL enforce rate limits on webhook endpoints
2. THE default rate limit SHALL be 60 requests per minute per webhook
3. WHEN rate limit is exceeded THEN the backend SHALL return HTTP 429 Too Many Requests
4. THE system SHALL allow users to configure custom rate limits in WebhookConfig
5. THE system SHALL validate webhook secrets using constant-time comparison
6. THE system SHALL log suspicious activity (repeated failed authentications)
7. THE system SHALL support IP whitelisting for webhook endpoints (optional)
8. THE system SHALL sanitize webhook payloads to prevent injection attacks
9. THE system SHALL limit payload size to 1MB maximum
10. THE system SHALL expire unused webhooks after 90 days of inactivity

### Requirement 10: Error Handling and Recovery

**User Story:** As a pipeline designer, I want robust error handling, so that webhook failures don't break my pipelines.

#### Acceptance Criteria

1. WHEN webhook registration fails THEN the system SHALL display a clear error message
2. WHEN a webhook trigger fails THEN the backend SHALL log the error
3. THE backend SHALL retry failed web push notifications up to 3 times
4. WHEN all retries fail THEN the backend SHALL store the webhook call for later processing
5. THE system SHALL allow users to manually retry failed webhook calls
6. WHEN authentication expires THEN the system SHALL prompt for re-authentication
7. WHEN the backend is unreachable THEN the system SHALL queue webhook operations
8. THE system SHALL process queued operations when connectivity is restored
9. WHEN a pipeline execution fails THEN the system SHALL log the error with webhook context
10. THE system SHALL provide troubleshooting guidance for common webhook errors

### Requirement 11: Webhook URL Format

**User Story:** As a developer, I want predictable webhook URLs, so that I can easily integrate with external services.

#### Acceptance Criteria

1. THE webhook URL SHALL follow the format: `https://api.example.com/wh/{token}`
2. THE token SHALL be a cryptographically secure random string
3. THE token SHALL be at least 32 characters long
4. THE webhook URL SHALL be immutable once created
5. THE system SHALL display the full webhook URL in the UI
6. THE system SHALL provide a QR code for the webhook URL (optional)
7. THE webhook URL SHALL support HTTPS only
8. THE system SHALL validate webhook URLs before displaying them
9. THE system SHALL handle URL encoding for special characters in tokens
10. THE system SHALL provide example curl commands for testing webhooks

### Requirement 12: Custom Headers Support

**User Story:** As a pipeline designer, I want to configure custom headers, so that I can validate requests from specific services.

#### Acceptance Criteria

1. THE WebhookConfig SHALL support a customHeaders object with key-value pairs
2. THE WebhookNodePopup SHALL provide a UI for adding custom headers
3. WHEN a webhook is triggered THEN the backend SHALL validate required custom headers
4. THE system SHALL support common headers like X-API-Key, Authorization, and User-Agent
5. THE system SHALL allow users to mark headers as required or optional
6. WHEN a required header is missing THEN the backend SHALL return HTTP 400 Bad Request
7. THE system SHALL support header value patterns using regex
8. THE system SHALL log header validation failures
9. THE system SHALL allow users to test webhooks with custom headers
10. THE system SHALL sanitize header values to prevent injection attacks

### Requirement 13: Payload Format Options

**User Story:** As a pipeline designer, I want to specify the expected payload format, so that data is parsed correctly.

#### Acceptance Criteria

1. THE WebhookConfig SHALL support payloadFormat options: JSON, form-data, and raw
2. WHEN payloadFormat is JSON THEN the backend SHALL parse the body as JSON
3. WHEN payloadFormat is form-data THEN the backend SHALL parse the body as URL-encoded form data
4. WHEN payloadFormat is raw THEN the backend SHALL pass the body as a string
5. WHEN JSON parsing fails THEN the backend SHALL return HTTP 400 Bad Request
6. THE system SHALL validate JSON payloads against a schema if provided
7. THE system SHALL support nested JSON objects and arrays
8. THE system SHALL handle empty payloads gracefully
9. THE system SHALL log payload parsing errors
10. THE system SHALL provide payload examples in the UI for each format
