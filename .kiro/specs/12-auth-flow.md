# Authentication Flow Specification

## JWT Strategy

- Use @fastify/jwt plugin
- No need for separate auth middleware (plugin handles it)
- Token stored in extension's chrome.storage.local

## Token Structure

```json
{
	"userId": "uuid",
	"email": "user@example.com",
	"iat": 1234567890,
	"exp": 1234567890
}
```

## Token Expiration

- Access token: 7 days (604800 seconds)
- No refresh token for hackathon simplicity
- User must re-login after expiration

## Password Hashing

Use bcrypt with 10 rounds:

```javascript
import bcrypt from "bcrypt";

const saltRounds = 10;
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

## Protected Routes

Use Fastify's `preHandler` hook:

```javascript
fastify.addHook("preHandler", async (request, reply) => {
	await request.jwtVerify();
});
```

## Extension Auth Flow

### 1. User Opens Extension

- Check if token exists in chrome.storage.local
- If yes, validate with GET /api/auth/me
- If no or invalid, show login dialog

### 2. Login Dialog UI

**Location**: Center of screen
**Size**: 400-500px width, auto height
**Style**: Modern CSS nesting, spooky theme
**Fields**:

- Email (type="email", required)
- Password (type="password", required, show/hide toggle)
- Remember me (checkbox, optional)
- "Don't have an account? Sign up" link

### 3. Signup Dialog UI

**Fields**:

- Display Name (optional)
- Email (type="email", required)
- Password (type="password", required, show strength meter)
- Confirm Password (must match)
- Terms acceptance (checkbox, required)
- "Already have an account? Login" link

### 4. After Successful Login

- Store token in chrome.storage.local
- Store user info (userId, email, displayName)
- Close dialog
- Enable auto-sync
- Subscribe to Web Push

### 5. Logout Flow

- Call POST /api/auth/logout
- Remove token from chrome.storage.local
- Remove user info
- Unsubscribe from Web Push
- Stop auto-sync
- Show login dialog

## Error Handling

- Invalid credentials: "Email or password is incorrect"
- Email already exists: "This email is already registered"
- Network error: "Connection failed. Please try again."
- Token expired: Redirect to login, preserve unsaved work

## Security Considerations

- Never log passwords
- Clear password fields after submission
- Use HTTPS only
- Validate on both client and server
- Rate limit auth endpoints (5 req/min)
