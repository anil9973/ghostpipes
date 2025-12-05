# Web Push Notification Specification

## Library: @block65/webcrypto-web-push

## VAPID Keys Generation

Generate once, store in environment variables:

```javascript
import { generateVAPIDKeys } from "@block65/webcrypto-web-push";

const vapidKeys = await generateVAPIDKeys();
console.log("VAPID_PUBLIC_KEY:", vapidKeys.publicKey);
console.log("VAPID_PRIVATE_KEY:", vapidKeys.privateKey);
```

Store in .env:

```
VAPID_PUBLIC_KEY=BG3xfz...
VAPID_PRIVATE_KEY=9i8h7g...
VAPID_SUBJECT=mailto:admin@ghostpipes.com
```

## Extension Service Worker Setup

### 1. Request Notification Permission

```javascript
// In extension popup or background script
const permission = await Notification.requestPermission();
if (permission === "granted") {
	subscribeToWebPush();
}
```

### 2. Subscribe to Push Manager

```javascript
async function subscribeToWebPush() {
	const registration = await navigator.serviceWorker.ready;

	const subscription = await registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
	});

	// Send subscription to server
	await fetch("https://api.ghostpipes.com/api/push/subscribe", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			endpoint: subscription.endpoint,
			keys: {
				p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
				auth: arrayBufferToBase64(subscription.getKey("auth")),
			},
		}),
	});
}
```

### 3. Listen for Push Events

```javascript
// In service worker (service-worker.js)
self.addEventListener("push", (event) => {
	const data = event.data.json();

	console.log("Push notification received:", data);

	if (data.type === "webhook_trigger") {
		// Handle webhook trigger
		handleWebhookTrigger(data);
	}

	// Show notification
	event.waitUntil(
		self.registration.showNotification("GhostPipes", {
			body: `Webhook triggered: ${data.pipelineId}`,
			icon: "/icons/icon-128.png",
			badge: "/icons/badge-72.png",
			data: data,
		})
	);
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	// Open extension or specific pipeline
	event.waitUntil(clients.openWindow(`/pipeline-builder.html?id=${event.notification.data.pipelineId}`));
});
```

## Backend Push Sending

### Send Push Notification

```javascript
import { sendNotification } from "@block65/webcrypto-web-push";

async function sendPushToUser(userId, payload) {
	// Get user's push subscriptions from database
	const subscriptions = await db("push_subscriptions").where({ user_id: userId, is_active: true });

	const vapidKeys = {
		publicKey: process.env.VAPID_PUBLIC_KEY,
		privateKey: process.env.VAPID_PRIVATE_KEY,
		subject: process.env.VAPID_SUBJECT,
	};

	for (const sub of subscriptions) {
		try {
			await sendNotification(
				{
					endpoint: sub.endpoint,
					keys: {
						p256dh: sub.p256dh_key,
						auth: sub.auth_secret,
					},
				},
				JSON.stringify(payload),
				vapidKeys
			);

			// Update last_used_at
			await db("push_subscriptions")
				.where({ subscription_id: sub.subscription_id })
				.update({ last_used_at: new Date() });
		} catch (error) {
			if (error.statusCode === 410) {
				// Subscription expired, remove it
				await db("push_subscriptions").where({ subscription_id: sub.subscription_id }).delete();
			} else {
				console.error("Push send error:", error);
			}
		}
	}
}
```

## Payload Size Strategy

### Check Payload Size

```javascript
function shouldSendDirectData(data) {
	const payloadSize = Buffer.byteLength(JSON.stringify(data), "utf8");
	const MAX_SIZE = 4096; // 4KB
	return payloadSize < MAX_SIZE;
}

async function sendWebhookNotification(userId, webhookData) {
	let payload;

	if (shouldSendDirectData(webhookData)) {
		// Send full data
		payload = {
			type: "webhook_trigger",
			webhookId: webhookData.webhookId,
			pipelineId: webhookData.pipelineId,
			data: webhookData.requestData,
			timestamp: new Date().toISOString(),
		};
	} else {
		// Send fetch instruction
		payload = {
			type: "webhook_trigger",
			webhookId: webhookData.webhookId,
			pipelineId: webhookData.pipelineId,
			fetchFrom: `/api/webhooks/${webhookData.webhookId}/last-request`,
			timestamp: new Date().toISOString(),
		};
	}

	await sendPushToUser(userId, payload);
}
```

## Extension Handling

### Handle Push with Fetch

```javascript
async function handleWebhookTrigger(data) {
let webhookData;
if (data.data) {
// Direct data included
webhookData = data.data;
} else if (data.fetchFrom) {
// Fetch from server
const response = await fetch(https://api.ghostpipes.com${data.fetchFrom}, {
headers: {
'Authorization': Bearer ${await getStoredToken()}
}
});
webhookData = await response.json();
}
// Trigger pipeline execution
await executePipeline(data.pipelineId, webhookData);
}

```

## Subscription Management

### Auto-Resubscribe on Token Change

```javascript
// When user logs in
chrome.storage.local.set({ authToken: token }, async () => {
	await subscribeToWebPush();
});

// When user logs out
chrome.storage.local.remove("authToken", async () => {
	await unsubscribeFromWebPush();
});
```

### Unsubscribe

```javascript
async function unsubscribeFromWebPush() {
	const registration = await navigator.serviceWorker.ready;
	const subscription = await registration.pushManager.getSubscription();

	if (subscription) {
		// Notify server
		await fetch("https://api.ghostpipes.com/api/push/unsubscribe", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				endpoint: subscription.endpoint,
			}),
		});

		// Unsubscribe locally
		await subscription.unsubscribe();
	}
}
```

## Testing Push Notifications

### Test Endpoint

```javascript
// POST /api/push/test
async function testPushHandler(request, reply) {
	const { userId } = request.user;

	await sendPushToUser(userId, {
		type: "test",
		message: "Test notification from GhostPipes",
		timestamp: new Date().toISOString(),
	});

	return { success: true, message: "Test notification sent" };
}
```

## Error Handling

- Subscription not found: Create new subscription
- 410 Gone: Remove expired subscription from database
- Network error: Retry with exponential backoff
- Invalid VAPID keys: Log error, alert admin
