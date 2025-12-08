# Implementation Plan

- [-] 1. Enhance WebhookConfig model

  - [x] 1.1 Add new properties to WebhookConfig

    - Add customHeaders object property
    - Add payloadFormat property (JSON, form-data, raw)
    - Add rateLimitConfig property
    - Add isActive boolean property
    - Add callCount number property
    - Add lastTriggered timestamp property
    - _Requirements: 1.1, 1.5, 1.6, 1.7_

  - [ ] 1.2 Update validation logic

    - Validate customHeaders structure
    - Validate payloadFormat enum
    - Validate rateLimitConfig values
    - Update getSchema() method
    - _Requirements: 1.2, 1.3, 1.4, 1.8_

  - [ ] 1.3 Update serialization methods
    - Update toJSON() to include new properties
    - Create fromJSON() static method
    - Update getSummary() to show new info
    - _Requirements: 1.8, 1.9, 1.10_

- [ ] 2. Create WebhookService API client

  - [ ] 2.1 Create WebhookService class

    - Implement constructor with ApiClient
    - Add error handling wrapper
    - Add retry logic with exponential backoff
    - _Requirements: 4.7, 4.8_

  - [ ] 2.2 Implement CRUD operations

    - Implement createWebhook(pipelineId, method, secret)
    - Implement getWebhook(webhookId)
    - Implement listWebhooks(pipelineId)
    - Implement updateWebhook(webhookId, updates)
    - Implement deleteWebhook(webhookId)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.10_

  - [ ] 2.3 Implement data and analytics methods

    - Implement getWebhookData(webhookId, limit)
    - Implement getAnalytics(webhookId)
    - Implement testWebhook(webhookUrl, payload)
    - _Requirements: 4.6, 7.1, 7.2, 8.1-8.10_

  - [ ] 2.4 Add response validation
    - Validate webhook response schema
    - Validate analytics response schema
    - Handle malformed responses
    - _Requirements: 4.9_

- [ ] 3. Create WebhookAuthGuard utility

  - [ ] 3.1 Implement authentication checks

    - Implement isAuthenticated() method
    - Implement getToken() method from chrome.storage
    - Implement isTokenExpired() validation
    - _Requirements: 3.1, 3.9, 3.10_

  - [ ] 3.2 Implement token management

    - Implement refreshToken() method
    - Implement automatic token refresh on expiry
    - Store tokens securely in chrome.storage
    - _Requirements: 3.6, 3.8, 10.6_

  - [ ] 3.3 Implement auth dialog integration
    - Implement showAuthDialog() method
    - Listen for auth-success event
    - Return promise that resolves on success
    - _Requirements: 3.3, 3.4, 3.7_

- [-] 4. Create WebhookNodePopup component

  - [ ] 4.1 Create component structure

    - Extend HTMLDialogElement
    - Set up constructor with PipeNode
    - Initialize WebhookService
    - Initialize state properties
    - _Requirements: 2.1-2.11_

  - [ ] 4.2 Implement authentication check

    - Check auth status in connectedCallback
    - Render auth required state if not authenticated
    - Render webhook config if authenticated
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

  - [ ] 4.3 Implement webhook URL display

    - Display full webhook URL in readonly input
    - Add copy button with clipboard API
    - Show success message on copy
    - Handle copy failures gracefully
    - _Requirements: 2.1, 2.2, 11.5, 11.10_

  - [ ] 4.4 Implement method selector

    - Create dropdown with GET, POST, PUT, DELETE, PATCH
    - Handle method change event
    - Update config on change
    - _Requirements: 2.4_

  - [ ] 4.5 Implement secret management

    - Display secret with hide/reveal toggle
    - Add regenerate secret button
    - Confirm before regenerating
    - Update backend on regenerate
    - _Requirements: 2.3, 2.10_

  - [ ] 4.6 Implement webhook testing

    - Add "Test Webhook" button
    - Create test payload dialog
    - Send test request via WebhookService
    - Display test results (success/error)
    - Show request and response details
    - _Requirements: 2.5, 2.6, 7.1-7.10_

  - [ ] 4.7 Implement recent calls display

    - Load last 5 calls from backend
    - Display method, status code, timestamp
    - Show success/error indicators
    - Allow expanding for full details
    - Auto-refresh on new calls
    - _Requirements: 2.7, 8.5, 8.6, 8.7, 8.8_

  - [ ] 4.8 Implement analytics display

    - Load analytics from backend
    - Display total calls, success rate, avg response time
    - Display calls by time period (24h, 7d)
    - Add "Clear History" button
    - _Requirements: 2.9, 8.1, 8.2, 8.3, 8.4, 8.9_

  - [ ] 4.9 Implement status indicator

    - Show active/inactive status badge
    - Update status based on webhook data
    - Show last triggered time
    - _Requirements: 2.8_

  - [ ] 4.10 Implement webhook deletion

    - Add "Delete Webhook" button
    - Show confirmation dialog
    - Call WebhookService.deleteWebhook()
    - Close popup on success
    - _Requirements: 2.11_

  - [ ] 4.11 Add save functionality
    - Add "Save" button
    - Validate configuration
    - Update webhook via API
    - Show success/error message
    - _Requirements: 4.10_

- [ ] 5. Implement web push notification subscription

  - [ ] 5.1 Create PushNotificationHandler

    - Create class in background/push-handler.js
    - Implement subscribe() method
    - Check Push API support
    - Request notification permission
    - _Requirements: 6.1, 6.2_

  - [ ] 5.2 Implement subscription flow

    - Subscribe to push notifications on auth
    - Get PushSubscription from browser
    - Send subscription to backend via POST /push/subscribe
    - Store subscription status
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 5.3 Handle subscription errors
    - Handle permission denied
    - Handle Push API not supported
    - Show user-friendly error messages
    - Provide fallback options
    - _Requirements: 10.6_

- [ ] 6. Implement service worker push handler

  - [ ] 6.1 Set up service worker listener

    - Add push event listener in service worker
    - Extract webhook data from push event
    - Validate push data structure
    - _Requirements: 6.6, 6.7_

  - [ ] 6.2 Implement pipeline triggering

    - Extract pipelineId and payload from push
    - Trigger pipeline execution with payload
    - Pass webhook data as pipeline input
    - Handle execution errors
    - _Requirements: 6.8, 5.9, 5.10_

  - [ ] 6.3 Implement browser notifications

    - Show browser notification on webhook trigger
    - Include pipeline name and webhook info
    - Make notification optional (user setting)
    - Handle notification click to open pipeline
    - _Requirements: 6.9_

  - [ ] 6.4 Handle push subscription expiration
    - Detect expired subscriptions
    - Re-subscribe automatically
    - Update backend with new subscription
    - _Requirements: 6.10_

- [ ] 7. Enhance backend webhook service

  - [ ] 7.1 Add custom headers support

    - Update webhook model to store customHeaders
    - Validate custom headers on webhook trigger
    - Support required vs optional headers
    - Return HTTP 400 for missing required headers
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [ ] 7.2 Add payload format handling

    - Update webhook model to store payloadFormat
    - Parse JSON payloads
    - Parse form-data payloads
    - Handle raw text payloads
    - Return HTTP 400 for invalid payloads
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ] 7.3 Add rate limiting

    - Implement rate limiter middleware
    - Default to 60 requests per minute
    - Support custom rate limits per webhook
    - Return HTTP 429 with Retry-After header
    - Log rate limit violations
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ] 7.4 Enhance security

    - Use constant-time comparison for secrets
    - Sanitize payloads to prevent injection
    - Enforce 1MB payload size limit
    - Log source IPs for auditing
    - Support IP whitelisting
    - _Requirements: 9.5, 9.6, 9.7, 9.8, 9.9_

  - [ ] 7.5 Add webhook analytics

    - Store webhook call data in database
    - Calculate success rates
    - Calculate average response times
    - Track calls by time period
    - Provide analytics API endpoint
    - _Requirements: 8.1-8.10_

  - [ ] 7.6 Implement webhook expiration
    - Track last triggered timestamp
    - Mark webhooks inactive after 90 days
    - Send notification before expiration
    - Allow manual reactivation
    - _Requirements: 9.10_

- [ ] 8. Implement web push notification sending

  - [ ] 8.1 Create PushNotificationService

    - Create service in backend
    - Initialize web push library
    - Configure VAPID keys
    - _Requirements: 6.4_

  - [ ] 8.2 Implement push sending

    - Send push notification on webhook trigger
    - Include webhookId, pipelineId, payload
    - Handle push failures
    - Retry failed pushes up to 3 times
    - _Requirements: 6.4, 6.5, 10.3, 10.4_

  - [ ] 8.3 Add push subscription management
    - Store push subscriptions in database
    - Associate subscriptions with users
    - Handle subscription updates
    - Clean up expired subscriptions
    - _Requirements: 6.3_

- [ ] 9. Add error handling and recovery

  - [ ] 9.1 Implement frontend error handling

    - Handle webhook creation failures
    - Handle authentication errors
    - Handle network timeouts
    - Show user-friendly error messages
    - _Requirements: 10.1, 10.6, 10.7_

  - [ ] 9.2 Implement backend error handling

    - Handle invalid tokens (HTTP 404)
    - Handle invalid secrets (HTTP 401)
    - Handle rate limits (HTTP 429)
    - Handle invalid payloads (HTTP 400)
    - Handle execution failures (HTTP 500)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 9.3 Implement retry logic

    - Retry failed API calls with exponential backoff
    - Retry failed push notifications
    - Queue operations when offline
    - Process queue when online
    - _Requirements: 10.3, 10.4, 10.7, 10.8_

  - [ ] 9.4 Add manual retry options

    - Allow manual retry of failed webhook calls
    - Show retry button in UI
    - Display retry status
    - _Requirements: 10.5_

  - [ ] 9.5 Add troubleshooting guidance
    - Provide error-specific help text
    - Link to documentation
    - Show example requests
    - Suggest common fixes
    - _Requirements: 10.10_

- [ ] 10. Add webhook URL utilities

  - [ ] 10.1 Implement URL generation

    - Generate cryptographically secure tokens (32+ chars)
    - Format URL as https://api.example.com/wh/{token}
    - Validate URL format
    - _Requirements: 11.1, 11.2, 11.3, 11.7, 11.8_

  - [ ] 10.2 Add URL display features
    - Display full URL in UI
    - Add QR code generation (optional)
    - Provide example curl commands
    - Handle URL encoding
    - _Requirements: 11.5, 11.6, 11.9, 11.10_

- [ ] 11. Add CSS styling

  - [ ] 11.1 Style WebhookNodePopup

    - Create webhook-node.css file
    - Style dialog layout
    - Style URL display with copy button
    - Style method selector
    - Style secret field with toggle
    - Style test button
    - _Requirements: All UI requirements_

  - [ ] 11.2 Style recent calls section

    - Style call list items
    - Add success/error indicators
    - Style expandable details
    - Add hover effects
    - _Requirements: 2.7, 8.5-8.8_

  - [ ] 11.3 Style analytics section

    - Style metrics display
    - Add visual indicators (badges, colors)
    - Style charts/graphs (if added)
    - _Requirements: 2.9, 8.1-8.4_

  - [ ] 11.4 Style authentication required state

    - Center content
    - Style lock icon
    - Style login button
    - _Requirements: 3.1, 3.2_

  - [ ] 11.5 Add responsive design
    - Ensure dialog works on different screen sizes
    - Make sections collapsible on mobile
    - Adjust font sizes for readability
    - _Requirements: All UI requirements_

- [ ] 12. Add accessibility features

  - [ ] 12.1 Add ARIA labels

    - Label all form controls
    - Label buttons with descriptive text
    - Label status indicators
    - _Requirements: All UI requirements_

  - [ ] 12.2 Add keyboard navigation

    - Ensure tab order is logical
    - Add keyboard shortcuts for common actions
    - Support Enter to submit, Escape to close
    - _Requirements: All UI requirements_

  - [ ] 12.3 Add screen reader support
    - Announce status changes
    - Announce test results
    - Announce errors
    - _Requirements: All UI requirements_

- [ ] 13. Checkpoint - Ensure core webhook functionality works

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Add advanced features

  - [ ] 14.1 Add custom headers UI

    - Create header editor component
    - Allow adding/removing headers
    - Mark headers as required/optional
    - Support header value patterns
    - _Requirements: 12.1-12.10_

  - [ ] 14.2 Add payload format selector

    - Add dropdown for JSON/form-data/raw
    - Show format-specific examples
    - Validate payloads against format
    - _Requirements: 13.1-13.10_

  - [ ] 14.3 Add rate limit configuration

    - Add rate limit editor
    - Show current rate limit
    - Allow custom limits
    - Show rate limit status
    - _Requirements: 9.1-9.4_

  - [ ] 14.4 Add IP whitelisting
    - Add IP whitelist editor
    - Validate IP addresses
    - Show whitelisted IPs
    - _Requirements: 9.7_

- [ ] 15. Add documentation and examples

  - [ ] 15.1 Add inline help text

    - Add tooltips for all fields
    - Add help icons with explanations
    - Add links to documentation
    - _Requirements: All_

  - [ ] 15.2 Add example payloads

    - Provide JSON example
    - Provide form-data example
    - Provide curl examples
    - Show example responses
    - _Requirements: 11.10, 13.10_

  - [ ] 15.3 Add webhook templates
    - Create templates for common services
    - GitHub webhook template
    - Stripe webhook template
    - Generic REST API template
    - _Requirements: Future enhancement_

- [ ] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
