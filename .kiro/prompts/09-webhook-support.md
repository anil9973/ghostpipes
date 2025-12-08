## TASK 2: Webhook Support Implementation

**Objective:** Enable webhooks as pipeline triggers with proper authentication.

**Requirements:**

1. **Backend Integration**

   - Review `/backend/src/modules/webhooks/handlers.js`
   - Understand webhook registration flow
   - Understand webhook payload handling

2. **Config Model Review**

   - Review `/extension/pipelines/models/configs/input/WebhookConfig.js`
   - Check if improvements needed:
     - Webhook secret validation
     - Custom headers support
     - Payload format options
     - Rate limiting config
     - CORS settings

3. **Webhook Node UI**

   - Implement `WebhookNodePopup` at `/extension/pipelines/components/editor/nodes/input/webhook-node.js`
   - Display webhook URL (copy button)
   - Show webhook secret (hide/reveal toggle)
   - Method selector (GET, POST, PUT, DELETE, PATCH)
   - Test webhook button (send sample payload)
   - Show recent webhook calls (last 5)
   - Status indicator (active/inactive)

4. **Authentication Flow**

   - Integrate with existing auth dialog at `/extension/pipelines/components/station/auth-dialog.js`
   - Show "Login Required" message if not authenticated
   - Disable webhook creation until logged in
   - Display webhook URL only after successful auth
   - Handle token refresh

5. **Webhook Receiving**
   - Backend sends web push notification to extension when webhook triggered
   - Extension service worker receives notification
   - Trigger pipeline execution with webhook payload
   - Show notification to user (optional setting)

**Questions for Specs:**

- How to handle webhook failures/retries?
- Should users see webhook analytics (call count, errors)?
- Rate limiting strategy for free vs paid users?
