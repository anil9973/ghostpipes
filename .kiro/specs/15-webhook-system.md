# Webhook System Specification

## Webhook Creation

1. User creates webhook via API
2. Server generates unique `webhookKey` (e.g., `gh_abc123def456`)
3. Server returns full URL: `https://api.ghostpipes.com/webhook/{webhookKey}`
4. User configures third-party service to POST to this URL

## Webhook Key Generation

```javascript
import { nanoid } from "nanoid";

const webhookKey = "gh_" + nanoid(16); // gh_V1StGXR8_Z5jdHi6
```

## Webhook Reception Flow

1. Third-party service sends HTTP request to `/webhook/:webhookKey`
2. Server validates:
   - Webhook exists
   - Webhook is active
   - HTTP method is allowed
   - Optional: Validate HMAC signature if secret provided
3. Server logs request (optional, for debugging)
4. Server sends Web Push notification to user's extension
5. Server returns 200 OK immediately

## Web Push Notification Strategy

### Option A: Direct Data Push (Preferred)

- Check payload size < 4KB
- If yes: Send full webhook data in push message
- If no: Send notification to fetch data from server

**Push Payload**:

```json
{
	"type": "webhook_trigger",
	"webhookId": "uuid",
	"pipelineId": "uuid",
	"data": {
		/* webhook request data */
	},
	"timestamp": "2025-01-01T00:00:00Z"
}
```

### Option B: Always Fetch

- Always send minimal notification
- Extension fetches data from GET /api/webhooks/:webhookId/last-request

**Recommendation**: Use Option A (direct push if < 4KB)

- Faster for small payloads
- Reduces server load
- Extension can still fetch if needed

## Webhook Data Storage

Store last 10 webhook requests per webhook:

```sql
CREATE TABLE webhook_requests (
  request_id UUID PRIMARY KEY,
  webhook_id UUID REFERENCES webhooks(webhook_id),
  request_data JSONB,
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cleanup old requests
DELETE FROM webhook_requests
WHERE webhook_id = ?
AND request_id NOT IN (
  SELECT request_id FROM webhook_requests
  WHERE webhook_id = ?
  ORDER BY received_at DESC
  LIMIT 10
);
```

## HMAC Validation (Optional)

If webhook has a secret:

```javascript
import crypto from "crypto";

function validateHmac(payload, signature, secret) {
	const expectedSignature = crypto.createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex");

	return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
```

## Rate Limiting

- Public webhook endpoint: 100 requests/minute per webhook
- Use @fastify/rate-limit plugin
- Return 429 if exceeded

## Error Handling

- Webhook not found: 404
- Webhook inactive: 403
- Invalid method: 405
- Rate limit: 429
- Server error: 500

## Webhook Lifecycle

1. Created → Active
2. Can be paused (is_active = false)
3. Can be deleted (cascade to logs)
4. Can expire (expires_at timestamp)
