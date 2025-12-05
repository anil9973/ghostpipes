# API Endpoints Specification

Base URL: `https://api.ghostpipes.com` (or AWS App Runner URL)

## Authentication Endpoints

### POST /api/auth/signup

**Description**: Register new user
**Request Body**:

```json
{
	"email": "user@example.com",
	"password": "SecurePass123!",
	"displayName": "John Doe"
}
```

**Response** (201):

```json
{
	"success": true,
	"data": {
		"userId": "uuid",
		"email": "user@example.com",
		"displayName": "John Doe",
		"token": "jwt-token-here"
	}
}
```

**Validation**:

- Email: valid format, unique
- Password: min 8 chars, at least 1 uppercase, 1 number
- DisplayName: optional, max 100 chars

### POST /api/auth/login

**Description**: User login
**Request Body**:

```json
{
	"email": "user@example.com",
	"password": "SecurePass123!"
}
```

**Response** (200):

```json
{
	"success": true,
	"data": {
		"userId": "uuid",
		"email": "user@example.com",
		"displayName": "John Doe",
		"token": "jwt-token-here"
	}
}
```

### POST /api/auth/logout

**Description**: User logout (invalidate token if needed)
**Headers**: `Authorization: Bearer <token>`
**Response** (200):

```json
{
	"success": true,
	"message": "Logged out successfully"
}
```

### GET /api/auth/me

**Description**: Get current user info
**Headers**: `Authorization: Bearer <token>`
**Response** (200):

```json
{
	"success": true,
	"data": {
		"userId": "uuid",
		"email": "user@example.com",
		"displayName": "John Doe",
		"createdAt": "2025-01-01T00:00:00Z"
	}
}
```

---

## Pipeline Endpoints

### GET /api/pipelines

**Description**: List user's pipelines
**Headers**: `Authorization: Bearer <token>`
**Query Params**:

- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `isTemplate` (boolean, optional)
  **Response** (200):

```json
{
	"success": true,
	"data": {
		"pipelines": [
			{
				"pipelineId": "uuid",
				"name": "My Pipeline",
				"description": "Extract product data",
				"isPublic": false,
				"isTemplate": false,
				"version": 1,
				"createdAt": "2025-01-01T00:00:00Z",
				"updatedAt": "2025-01-01T00:00:00Z"
			}
		],
		"pagination": {
			"page": 1,
			"limit": 20,
			"total": 45
		}
	}
}
```

### POST /api/pipelines

**Request:**

```json
{
	"title": "New Pipeline",
	"summary": "Optional description",
	"trigger": {
		"type": "manual",
		"config": {}
	},
	"nodes": [
		{
			"id": "node-1",
			"type": "http_request",
			"title": "Fetch Data",
			"position": { "x": 100, "y": 100 },
			"config": { "url": "https://api.example.com" }
		}
	],
	"pipes": [
		{
			"id": "pipe-1",
			"sourceId": "node-1",
			"sourceSide": "right",
			"targetId": "node-2",
			"targetSide": "left"
		}
	],
	"isPublic": false
}
```

**Response (200):**

```json
{
  "pipeline": {
    "id": "uuid",
    "userId": "uuid",
    "title": "New Pipeline",
    "summary": "Optional description",
    "trigger": { "type": "manual", "config": {} },
    "nodes": [...],
    "pipes": [...],
    "isPublic": false,
    "shareToken": null,
    "clonedFrom": null,
    "cloneCount": 0,
    "createdAt": 1642089600000,
    "updatedAt": 1642089600000
  }
}
```

### GET /api/pipelines/:id

**Response (200):**

```json
{
	"pipeline": {
		"id": "uuid",
		"userId": "uuid",
		"title": "My Pipeline",
		"summary": "Description",
		"trigger": {
			"type": "http_request",
			"config": {
				"url": "https://api.example.com",
				"method": "GET"
			}
		},
		"nodes": [
			{
				"id": "node-1",
				"type": "http_request",
				"title": "Fetch Data",
				"summary": null,
				"position": { "x": 100, "y": 100 },
				"inputs": [],
				"outputs": [{ "nodeId": "node-2" }],
				"config": { "url": "https://api.example.com" }
			}
		],
		"pipes": [
			{
				"id": "pipe-1",
				"sourceId": "node-1",
				"sourceSide": "right",
				"targetId": "node-2",
				"targetSide": "left"
			}
		],
		"isPublic": false,
		"shareToken": null,
		"clonedFrom": null,
		"cloneCount": 0,
		"createdAt": 1642089600000,
		"updatedAt": 1642089600000
	}
}
```

### PUT /api/pipelines/:id

**Request (Partial Update):**

```json
{
  "title": "Updated Title",
  "summary": "Updated description",
  "nodes": [...], // Updated nodes array
  "isPublic": true
}
```

**Response (200):**

```json
{
	"pipeline": {
		"id": "uuid",
		"title": "Updated Title",
		"summary": "Updated description",
		"shareToken": "abc123xyz", // Generated when isPublic=true
		"updatedAt": 1642089700000
		// ... rest of pipeline
	}
}
```

### DELETE /api/pipelines/:pipelineId

**Description**: Delete pipeline
**Headers**: `Authorization: Bearer <token>`
**Response** (200):

```json
{
	"success": true,
	"message": "Pipeline deleted"
}
```

### POST /api/pipelines/:pipelineId/share

**Description**: Generate shareable link
**Headers**: `Authorization: Bearer <token>`
**Request Body**:

```json
{
	"expiresInDays": 30
}
```

**Response** (200):

```json
{
	"success": true,
	"data": {
		"shareToken": "abc123def456",
		"shareUrl": "https://ghostpipes.com/share/abc123def456",
		"expiresAt": "2025-02-01T00:00:00Z"
	}
}
```

### GET /api/pipelines/shared/:shareToken

**Description**: Get shared pipeline (no auth required)
**Response** (200):

```json
{
	"success": true,
	"data": {
		"pipelineId": "uuid",
		"name": "Shared Pipeline",
		"description": "Description",
		"pipelineData": {
			/* Full Pipeline JSON */
		},
		"sharedBy": "John Doe",
		"accessCount": 42
	}
}
```

### POST /api/pipelines/:pipelineId/clone

**Description**: Clone a public or shared pipeline
**Headers**: `Authorization: Bearer <token>`
**Response** (201):

```json
{
	"success": true,
	"data": {
		"pipelineId": "new-uuid",
		"name": "My Pipeline (Copy)",
		"clonedFrom": "original-uuid"
	}
}
```

### POST /api/pipelines/sync

**Description**: Bulk sync pipelines from extension
**Headers**: `Authorization: Bearer <token>`
**Request Body**:

```json
{
	"pipelines": [
		{
			"pipelineId": "uuid",
			"name": "Pipeline 1",
			"pipelineData": {
				/* JSON */
			},
			"clientUpdatedAt": "2025-01-01T00:00:00Z",
			"version": 1
		}
	]
}
```

**Response** (200):

```json
{
	"success": true,
	"data": {
		"synced": ["uuid1", "uuid2"],
		"conflicts": [
			{
				"pipelineId": "uuid3",
				"serverVersion": 5,
				"clientVersion": 3
			}
		]
	}
}
```

---

## Webhook Endpoints

### POST /api/webhooks

**Description**: Create webhook endpoint for pipeline
**Headers**: `Authorization: Bearer <token>`
**Request Body**:

```json
{
	"pipelineId": "uuid",
	"allowedMethods": ["POST", "GET"],
	"secret": "optional-hmac-secret"
}
```

**Response** (201):

```json
{
	"success": true,
	"data": {
		"webhookId": "uuid",
		"webhookKey": "gh_abc123def456",
		"webhookUrl": "https://api.ghostpipes.com/webhook/gh_abc123def456",
		"secret": "secret-if-provided"
	}
}
```

### GET /api/webhooks

**Description**: List user's webhooks
**Headers**: `Authorization: Bearer <token>`
**Response** (200):

```json
{
	"success": true,
	"data": {
		"webhooks": [
			{
				"webhookId": "uuid",
				"pipelineId": "uuid",
				"webhookKey": "gh_abc123def456",
				"webhookUrl": "https://api.ghostpipes.com/webhook/gh_abc123def456",
				"isActive": true,
				"requestCount": 42,
				"lastTriggeredAt": "2025-01-01T00:00:00Z"
			}
		]
	}
}
```

### DELETE /api/webhooks/:webhookId

**Description**: Delete webhook
**Headers**: `Authorization: Bearer <token>`
**Response** (200):

```json
{
	"success": true,
	"message": "Webhook deleted"
}
```

### POST /webhook/:webhookKey (PUBLIC)

**Description**: Receive webhook from third-party service
**No authentication required**
**Request Body**: Any JSON/form data
**Response** (200):

```json
{
	"success": true,
	"message": "Webhook received",
	"webhookId": "uuid"
}
```

**Behavior**:

1. Validate webhook exists and is active
2. Log request (optional)
3. Send Web Push notification to user's extension
4. Return 200 immediately

---

## Web Push Endpoints

### POST /api/push/subscribe

**Description**: Subscribe extension to push notifications
**Headers**: `Authorization: Bearer <token>`
**Request Body**:

```json
{
	"endpoint": "https://fcm.googleapis.com/fcm/send/...",
	"keys": {
		"p256dh": "public-key-base64",
		"auth": "auth-secret-base64"
	}
}
```

**Response** (201):

```json
{
	"success": true,
	"data": {
		"subscriptionId": "uuid",
		"message": "Subscribed to push notifications"
	}
}
```

### DELETE /api/push/unsubscribe

**Description**: Unsubscribe from push notifications
**Headers**: `Authorization: Bearer <token>`
**Request Body**:

```json
{
	"endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

**Response** (200):

```json
{
	"success": true,
	"message": "Unsubscribed"
}
```

### POST /api/push/test

**Description**: Test push notification
**Headers**: `Authorization: Bearer <token>`
**Response** (200):

```json
{
	"success": true,
	"message": "Test notification sent"
}
```

---

## Error Response Format

All errors follow this structure:

```json
{
	"success": false,
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "Invalid email format",
		"details": {
			"field": "email",
			"value": "invalid-email"
		}
	}
}
```

## Common Error Codes

- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_ERROR` (500)

## Rate Limiting

- Auth endpoints: 5 requests/minute
- Webhook endpoints: 100 requests/minute
- API endpoints: 60 requests/minute
- Public share: 30 requests/minute
