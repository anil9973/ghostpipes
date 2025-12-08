# Design Document

## Overview

The Webhook Support feature enables GhostPipes pipelines to be triggered by external HTTP requests, allowing seamless integration with third-party services, APIs, and automation tools. The design implements a complete webhook lifecycle including creation, configuration, authentication, real-time triggering via web push notifications, analytics, and security features.

The architecture leverages the existing backend webhook service, extends the WebhookConfig model, creates a full-featured UI component, and integrates with the browser's Push API for real-time notification delivery. All webhook operations require authentication, and the system includes comprehensive error handling, rate limiting, and monitoring capabilities.

## Architecture

### Component Hierarchy

```
Webhook System
├── Frontend (Extension)
│   ├── WebhookNodePopup (UI Component)
│   ├── WebhookConfig (Enhanced Model)
│   ├── WebhookService (API Client)
│   └── Service Worker (Push Handler)
├── Backend (API)
│   ├── WebhookHandlers (HTTP Endpoints)
│   ├── WebhookService (Business Logic)
│   ├── WebhookRepository (Database)
│   └── PushNotificationService (Web Push)
└── External Services
    └── Third-party APIs/Services (Webhook Callers)
```

### Data Flow

```
External Service
    ↓ HTTP Request
Backend Webhook Endpoint (/wh/{token})
    ↓ Validate Token & Secret
WebhookService
    ├→ Store Webhook Call Data
    ├→ Extract Payload
    └→ Send Web Push Notification
    ↓
Browser Push API
    ↓
Extension Service Worker
    ↓ Receive Push Event
Pipeline Execution Engine
    ↓ Execute with Payload
Pipeline Nodes
    ↓
Output/Results
```

### Authentication Flow

```
User Opens Webhook Node
    ↓
Check Authentication Status
    ├→ Not Authenticated
    │   ├→ Show "Login Required"
    │   ├→ Disable Controls
    │   └→ Show Auth Dialog on Action
    └→ Authenticated
        ├→ Enable Controls
        ├→ Load Webhook Data
        └→ Display Webhook URL
```

## Components and Interfaces

### 1. Enhanced WebhookConfig Model

```javascript
class WebhookConfig extends BaseConfig {
  /** @param {Object} init */
  constructor(init = {});

  /** @type {string} Unique webhook identifier */
  webhookId;

  /** @type {WebhookMethod} HTTP method */
  method;

  /** @type {string} Optional secret for validation */
  secret;

  /** @type {Object<string, string>} Custom headers */
  customHeaders;

  /** @type {PayloadFormat} Expected payload format */
  payloadFormat;

  /** @type {RateLimitConfig} Rate limiting settings */
  rateLimitConfig;

  /** @type {boolean} Whether webhook is active */
  isActive;

  /** @type {number} Total call count */
  callCount;

  /** @type {number} Last triggered timestamp */
  lastTriggered;

  /** Validate configuration */
  validate();

  /** Get human-readable summary */
  getSummary();

  /** Serialize to JSON */
  toJSON();

  /** Deserialize from JSON */
  static fromJSON(data);
}
```

### 2. WebhookService (API Client)

```javascript
class WebhookService {
  /** @param {ApiClient} apiClient */
  constructor(apiClient);

  /**
   * Create new webhook
   * @param {string} pipelineId
   * @param {WebhookMethod} method
   * @param {string} [secret]
   * @returns {Promise<Webhook>}
   */
  async createWebhook(pipelineId, method, secret);

  /**
   * Get webhook by ID
   * @param {string} webhookId
   * @returns {Promise<Webhook>}
   */
  async getWebhook(webhookId);

  /**
   * List webhooks for pipeline
   * @param {string} pipelineId
   * @returns {Promise<Webhook[]>}
   */
  async listWebhooks(pipelineId);

  /**
   * Update webhook configuration
   * @param {string} webhookId
   * @param {Object} updates
   * @returns {Promise<Webhook>}
   */
  async updateWebhook(webhookId, updates);

  /**
   * Delete webhook
   * @param {string} webhookId
   * @returns {Promise<void>}
   */
  async deleteWebhook(webhookId);

  /**
   * Get webhook call history
   * @param {string} webhookId
   * @param {number} [limit=5]
   * @returns {Promise<WebhookCall[]>}
   */
  async getWebhookData(webhookId, limit);

  /**
   * Test webhook with sample payload
   * @param {string} webhookUrl
   * @param {Object} payload
   * @returns {Promise<TestResult>}
   */
  async testWebhook(webhookUrl, payload);

  /**
   * Get webhook analytics
   * @param {string} webhookId
   * @returns {Promise<WebhookAnalytics>}
   */
  async getAnalytics(webhookId);
}
```

### 3. WebhookNodePopup Component

```javascript
class WebhookNodePopup extends HTMLDialogElement {
  /** @param {PipeNode} pipeNode */
  constructor(pipeNode);

  /** @type {WebhookConfig} */
  config;

  /** @type {WebhookService} */
  webhookService;

  /** @type {boolean} */
  isAuthenticated;

  /** @type {Webhook} */
  webhookData;

  /** @type {WebhookCall[]} */
  recentCalls;

  /** Initialize component */
  async connectedCallback();

  /** Load webhook data from backend */
  async loadWebhookData();

  /** Handle webhook creation */
  async handleCreate();

  /** Handle method change */
  handleMethodChange(method);

  /** Handle secret regeneration */
  async handleRegenerateSecret();

  /** Handle webhook testing */
  async handleTest();

  /** Handle webhook deletion */
  async handleDelete();

  /** Copy webhook URL to clipboard */
  handleCopyUrl();

  /** Toggle secret visibility */
  toggleSecretVisibility();

  /** Render component */
  render();

  /** Render authentication required state */
  renderAuthRequired();

  /** Render webhook configuration */
  renderWebhookConfig();

  /** Render recent calls */
  renderRecentCalls();

  /** Render analytics */
  renderAnalytics();
}
```

### 4. PushNotificationHandler (Service Worker)

```javascript
class PushNotificationHandler {
  /**
   * Subscribe to push notifications
   * @returns {Promise<PushSubscription>}
   */
  static async subscribe();

  /**
   * Send subscription to backend
   * @param {PushSubscription} subscription
   * @returns {Promise<void>}
   */
  static async sendSubscriptionToBackend(subscription);

  /**
   * Handle push event
   * @param {PushEvent} event
   */
  static async handlePush(event);

  /**
   * Extract webhook data from push
   * @param {PushEvent} event
   * @returns {WebhookPushData}
   */
  static extractWebhookData(event);

  /**
   * Trigger pipeline execution
   * @param {string} pipelineId
   * @param {Object} payload
   * @returns {Promise<void>}
   */
  static async triggerPipeline(pipelineId, payload);

  /**
   * Show browser notification
   * @param {string} title
   * @param {string} body
   */
  static showNotification(title, body);
}
```

### 5. WebhookAuthGuard

```javascript
class WebhookAuthGuard {
  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>}
   */
  static async isAuthenticated();

  /**
   * Get authentication token
   * @returns {Promise<string|null>}
   */
  static async getToken();

  /**
   * Show authentication dialog
   * @returns {Promise<boolean>} True if auth successful
   */
  static async showAuthDialog();

  /**
   * Handle token refresh
   * @returns {Promise<string>}
   */
  static async refreshToken();

  /**
   * Validate token expiration
   * @param {string} token
   * @returns {boolean}
   */
  static isTokenExpired(token);
}
```

## Data Models

### Webhook

```javascript
class Webhook {
  /** @type {string} Unique identifier */
  id;

  /** @type {string} User ID */
  userId;

  /** @type {string} Pipeline ID */
  pipelineId;

  /** @type {string} Webhook token (in URL) */
  token;

  /** @type {WebhookMethod} HTTP method */
  method;

  /** @type {string} Optional secret */
  secret;

  /** @type {Object<string, string>} Custom headers */
  customHeaders;

  /** @type {PayloadFormat} Payload format */
  payloadFormat;

  /** @type {RateLimitConfig} Rate limit config */
  rateLimitConfig;

  /** @type {boolean} Active status */
  isActive;

  /** @type {number} Created timestamp */
  createdAt;

  /** @type {number} Updated timestamp */
  updatedAt;

  /** @type {number} Last triggered timestamp */
  lastTriggered;

  /** Get full webhook URL */
  getUrl();
}
```

### WebhookCall

```javascript
class WebhookCall {
  /** @type {string} Call ID */
  id;

  /** @type {string} Webhook ID */
  webhookId;

  /** @type {WebhookMethod} HTTP method */
  method;

  /** @type {number} Status code */
  statusCode;

  /** @type {Object} Request payload */
  payload;

  /** @type {Object<string, string>} Request headers */
  headers;

  /** @type {Object} Query parameters */
  query;

  /** @type {string} Source IP address */
  sourceIp;

  /** @type {number} Response time (ms) */
  responseTime;

  /** @type {string} Error message if failed */
  error;

  /** @type {number} Timestamp */
  timestamp;

  /** Check if call was successful */
  isSuccess();
}
```

### WebhookAnalytics

```javascript
class WebhookAnalytics {
  /** @type {string} Webhook ID */
  webhookId;

  /** @type {number} Total calls */
  totalCalls;

  /** @type {number} Successful calls */
  successfulCalls;

  /** @type {number} Failed calls */
  failedCalls;

  /** @type {number} Average response time (ms) */
  avgResponseTime;

  /** @type {number} Last 24h calls */
  callsLast24h;

  /** @type {number} Last 7d calls */
  callsLast7d;

  /** @type {Object<number, number>} Calls by status code */
  callsByStatus;

  /** @type {number} Last call timestamp */
  lastCallTime;

  /** Calculate success rate */
  getSuccessRate();
}
```

### WebhookPushData

```javascript
class WebhookPushData {
	/** @type {string} Webhook ID */
	webhookId;

	/** @type {string} Pipeline ID */
	pipelineId;

	/** @type {Object} Webhook payload */
	payload;

	/** @type {WebhookMethod} HTTP method */
	method;

	/** @type {Object<string, string>} Headers */
	headers;

	/** @type {Object} Query parameters */
	query;

	/** @type {number} Timestamp */
	timestamp;
}
```

### RateLimitConfig

```javascript
class RateLimitConfig {
  /** @type {number} Requests per minute */
  requestsPerMinute;

  /** @type {number} Burst allowance */
  burstSize;

  /** @type {string[]} IP whitelist */
  ipWhitelist;

  /** @type {boolean} Enable rate limiting */
  enabled;

  /** Get default config */
  static getDefault();
}
```

## Enums

### WebhookMethod

```javascript
const WebhookMethod = Object.freeze({
	GET: "GET",
	POST: "POST",
	PUT: "PUT",
	DELETE: "DELETE",
	PATCH: "PATCH",
});
```

### PayloadFormat

```javascript
const PayloadFormat = Object.freeze({
	JSON: "json",
	FORM_DATA: "form-data",
	RAW: "raw",
});
```

### WebhookStatus

```javascript
const WebhookStatus = Object.freeze({
	ACTIVE: "active",
	INACTIVE: "inactive",
	SUSPENDED: "suspended",
	EXPIRED: "expired",
});
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property Reflection

After analyzing all acceptance criteria, the following properties capture the essential correctness requirements:

Property 1: Webhook creation requires authentication
_For any_ webhook creation attempt, the operation should only succeed if the user has a valid authentication token
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

Property 2: Webhook URLs are unique and immutable
_For any_ created webhook, the URL should be unique across all webhooks and should never change after creation
**Validates: Requirements 11.1, 11.2, 11.3, 11.4**

Property 3: Webhook secret validation
_For any_ webhook with a secret configured, incoming requests without the correct secret should be rejected with HTTP 401
**Validates: Requirements 5.2, 9.5**

Property 4: Rate limiting enforcement
_For any_ webhook, when the number of requests exceeds the configured rate limit within the time window, subsequent requests should be rejected with HTTP 429
**Validates: Requirements 9.1, 9.2, 9.3**

Property 5: Payload format parsing
_For any_ webhook with a specified payload format, the backend should parse the payload according to that format and reject invalid payloads with HTTP 400
**Validates: Requirements 13.2, 13.3, 13.4, 13.5**

Property 6: Web push notification delivery
_For any_ successful webhook trigger, a web push notification should be sent to the user's browser with the webhook data
**Validates: Requirements 6.4, 6.5, 6.6**

Property 7: Pipeline execution with payload
_For any_ webhook trigger that results in pipeline execution, the webhook payload should be passed as input to the pipeline
**Validates: Requirements 5.10**

Property 8: Webhook call history persistence
_For any_ webhook call (successful or failed), the call data should be stored and retrievable via the analytics API
**Validates: Requirements 8.5, 8.6, 8.7**

Property 9: Custom header validation
_For any_ webhook with required custom headers, incoming requests missing those headers should be rejected with HTTP 400
**Validates: Requirements 12.3, 12.6**

Property 10: Authentication token refresh
_For any_ expired authentication token, the system should automatically refresh the token before making API calls
**Validates: Requirements 3.6, 10.6**

Property 11: Webhook test isolation
_For any_ webhook test request, the test should not increment production call counters or trigger actual pipeline execution
**Validates: Requirements 7.10**

Property 12: Error retry logic
_For any_ failed web push notification, the system should retry up to 3 times with exponential backoff before giving up
**Validates: Requirements 10.3, 10.4**

## Error Handling

### Authentication Errors

1. **Token Expired**: Automatically refresh token, retry operation
2. **Invalid Token**: Show auth dialog, require re-authentication
3. **Auth Dialog Closed**: Cancel operation, show message
4. **Network Error During Auth**: Retry with exponential backoff

### Webhook Creation Errors

1. **Backend Unreachable**: Queue operation, retry when online
2. **Invalid Configuration**: Show validation errors inline
3. **Duplicate Webhook**: Offer to use existing or create new
4. **Rate Limit Exceeded**: Show error with retry time

### Webhook Trigger Errors

1. **Invalid Token**: Return HTTP 404 Not Found
2. **Invalid Secret**: Return HTTP 401 Unauthorized
3. **Rate Limit Exceeded**: Return HTTP 429 with Retry-After header
4. **Invalid Payload**: Return HTTP 400 with error details
5. **Pipeline Not Found**: Return HTTP 404, log error
6. **Execution Failure**: Return HTTP 500, store for retry

### Web Push Errors

1. **Subscription Failed**: Show error, offer manual retry
2. **Push Not Supported**: Show warning, disable webhooks
3. **Permission Denied**: Show instructions to enable notifications
4. **Notification Delivery Failed**: Retry up to 3 times, then queue

### UI Errors

1. **Failed to Load Webhook Data**: Show retry button
2. **Copy to Clipboard Failed**: Show manual copy option
3. **Test Webhook Failed**: Display error details
4. **Network Timeout**: Show timeout message, offer retry

## Testing Strategy

### Unit Testing Approach

Unit tests will verify individual components:

1. **WebhookConfig Tests**

   - Test validation for all properties
   - Test serialization/deserialization
   - Test getSummary() output
   - Test default values

2. **WebhookService Tests**

   - Mock API client
   - Test all CRUD operations
   - Test error handling
   - Test retry logic

3. **WebhookAuthGuard Tests**

   - Test authentication checks
   - Test token refresh
   - Test token expiration detection

4. **PushNotificationHandler Tests**
   - Mock Push API
   - Test subscription flow
   - Test push event handling
   - Test pipeline triggering

### Integration Testing

Integration tests will verify end-to-end workflows:

1. **Webhook Creation Flow**

   - User authenticates
   - Creates webhook
   - Webhook registered in backend
   - URL displayed in UI

2. **Webhook Trigger Flow**

   - External service calls webhook
   - Backend validates and processes
   - Web push sent
   - Service worker receives
   - Pipeline executes

3. **Webhook Testing Flow**

   - User clicks test button
   - Test request sent
   - Response displayed
   - No production side effects

4. **Analytics Flow**
   - Webhook triggered multiple times
   - Call history stored
   - Analytics calculated
   - UI displays correct stats

### Security Testing

Security tests will verify protection mechanisms:

1. **Authentication Tests**

   - Unauthenticated requests rejected
   - Expired tokens refreshed
   - Invalid tokens rejected

2. **Secret Validation Tests**

   - Correct secret accepted
   - Incorrect secret rejected
   - Timing attack resistance

3. **Rate Limiting Tests**

   - Requests within limit accepted
   - Requests over limit rejected
   - Rate limit resets correctly

4. **Payload Sanitization Tests**
   - Injection attempts blocked
   - Oversized payloads rejected
   - Malformed payloads rejected

## Implementation Notes

### Performance Optimizations

1. **Webhook Call Caching**: Cache recent calls in memory for fast display
2. **Lazy Loading**: Load analytics only when analytics tab opened
3. **Debounced Updates**: Debounce config updates to reduce API calls
4. **Batch Operations**: Batch multiple webhook operations when possible

### Security Considerations

1. **Constant-Time Comparison**: Use constant-time comparison for secrets
2. **HTTPS Only**: Enforce HTTPS for all webhook URLs
3. **Token Entropy**: Use cryptographically secure random tokens (32+ chars)
4. **Payload Size Limits**: Enforce 1MB maximum payload size
5. **IP Logging**: Log source IPs for security auditing
6. **Secret Storage**: Store secrets hashed in backend database

### Browser Compatibility

- Target: Chrome 140+ (Manifest V3)
- Use native Push API
- Use native Notification API
- Service Worker for background processing
- chrome.storage for token storage

### Code Organization

```
extension/pipelines/
├── models/
│   └── configs/
│       └── input/
│           └── WebhookConfig.js (enhanced)
├── services/
│   ├── WebhookService.js (new)
│   └── WebhookAuthGuard.js (new)
├── components/
│   └── editor/
│       └── nodes/
│           └── input/
│               └── webhook-node.js (new)
└── background/
    └── push-handler.js (new)

backend/src/modules/webhooks/
├── handlers.js (existing)
├── service.js (enhance)
├── repository.js (enhance)
└── push-service.js (new)
```

## UI Design

### WebhookNodePopup Layout

```
┌─────────────────────────────────────────────┐
│ 🔗 Webhook Configuration              [×]  │
├─────────────────────────────────────────────┤
│                                             │
│ Webhook URL:                                │
│ ┌─────────────────────────────────────┐    │
│ │ https://api.example.com/wh/abc123   │[📋]│
│ └─────────────────────────────────────┘    │
│                                             │
│ Method:  [POST ▾]                           │
│                                             │
│ Secret:  [••••••••••••••]  [👁️] [🔄]       │
│                                             │
│ [🧪 Test Webhook]                           │
│                                             │
│ ┌─ Recent Calls (5) ──────────────────┐    │
│ │ ✓ POST 200 - 2 minutes ago          │    │
│ │ ✓ POST 200 - 5 minutes ago          │    │
│ │ ✗ POST 401 - 10 minutes ago         │    │
│ │ ✓ POST 200 - 15 minutes ago         │    │
│ │ ✓ POST 200 - 20 minutes ago         │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ ┌─ Analytics ─────────────────────────┐    │
│ │ Total Calls: 127                    │    │
│ │ Success Rate: 98.4%                 │    │
│ │ Avg Response: 45ms                  │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ [Save]  [Delete Webhook]                   │
└─────────────────────────────────────────────┘
```

### Authentication Required State

```
┌─────────────────────────────────────────────┐
│ 🔗 Webhook Configuration              [×]  │
├─────────────────────────────────────────────┤
│                                             │
│         🔒 Login Required                   │
│                                             │
│  Webhooks require authentication to         │
│  create and manage endpoints.               │
│                                             │
│         [🔓 Log In / Sign Up]               │
│                                             │
└─────────────────────────────────────────────┘
```

## Dependencies

### Existing Dependencies

- ApiClient (for backend communication)
- UserAuthDialog (for authentication)
- BaseConfig (for config model)
- PipeNode (for node data)
- Pipeline execution engine

### New Dependencies

- None (uses native browser APIs)

### Browser APIs Used

- Push API (for web push notifications)
- Notification API (for browser notifications)
- Service Worker API (for background processing)
- Clipboard API (for copy to clipboard)
- chrome.storage API (for token storage)

## Migration Strategy

1. **Phase 1**: Enhance WebhookConfig model
2. **Phase 2**: Implement WebhookService and API integration
3. **Phase 3**: Create WebhookNodePopup UI component
4. **Phase 4**: Implement web push notification handling
5. **Phase 5**: Add analytics and monitoring
6. **Phase 6**: Add testing and error handling

## Future Enhancements

1. **Webhook Templates**: Pre-configured webhooks for popular services (GitHub, Stripe, etc.)
2. **Webhook Transformations**: Transform incoming payloads before pipeline execution
3. **Webhook Routing**: Route to different pipelines based on payload content
4. **Webhook Replay**: Replay failed webhook calls
5. **Webhook Logs**: Detailed logging with search and filtering
6. **Webhook Metrics**: Advanced metrics and charts
7. **Webhook Alerts**: Email/SMS alerts for webhook failures
8. **Webhook Versioning**: Support multiple webhook versions
