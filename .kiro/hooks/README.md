# Agentic Hooks for GhostPipes Backend

This directory contains automated hooks that trigger actions based on file changes or manual invocation.

## Automatic Hooks

### 1. Run Tests on Save

**File**: `on-save-run-tests.json`
**Trigger**: When any `.js` file in `src/` is saved
**Action**: Runs the test suite automatically
**Purpose**: Catch bugs immediately during development

### 2. Migration Creation Reminder

**File**: `on-migration-create-reminder.json`
**Trigger**: When a new migration file is created in `src/db/migrations/`
**Action**: Sends a reminder message to run migrations
**Purpose**: Ensure migrations are applied after creation

### 3. Environment Variable Change Warning

**File**: `on-env-change-warning.json`
**Trigger**: When any `.env*` file is modified
**Action**: Warns to restart the server
**Purpose**: Prevent confusion from stale environment variables

### 4. Spec Update Sync

**File**: `on-spec-update-sync.json`
**Trigger**: When any spec file in `.kiro/specs/` is updated
**Action**: Notifies to review implementation alignment
**Purpose**: Keep implementation in sync with specifications

### 5. Docker Build Check

**File**: `on-docker-build-check.json`
**Trigger**: When `Dockerfile`, `package.json`, or `package-lock.json` changes
**Action**: Suggests rebuilding Docker image
**Purpose**: Ensure Docker image is up-to-date

### 6. API Schema Validation

**File**: `on-api-schema-validation.json`
**Trigger**: When any `schemas.js` file in modules is modified
**Action**: Reminds to validate API schemas and update documentation
**Purpose**: Maintain API contract integrity

## Manual Hooks

### 7. Manual Lint Check

**File**: `manual-lint-check.json`
**Trigger**: Manual invocation
**Action**: Runs ESLint on the codebase
**Purpose**: Check code quality on demand

### 8. Reset Database

**File**: `manual-db-reset.json`
**Trigger**: Manual invocation
**Action**: Rolls back all migrations, re-runs them, and seeds the database
**Purpose**: Quick database reset during development
**⚠️ Warning**: Only use in development environment!

## How to Use

### Viewing Hooks

1. Open the Kiro sidebar
2. Navigate to "Agent Hooks" section
3. View all configured hooks

### Enabling/Disabling Hooks

Edit the hook JSON file and set `"enabled": true` or `"enabled": false`

### Creating New Hooks

1. Create a new JSON file in `.kiro/hooks/`
2. Define the trigger and action
3. Set enabled to true
4. Hooks are automatically detected by Kiro

## Hook Configuration Format

```json
{
  "name": "Hook Name",
  "description": "What this hook does",
  "trigger": {
    "type": "onFileSave" | "manual" | "onMessage" | "onExecutionComplete",
    "filePattern": "glob pattern (for onFileSave)"
  },
  "action": {
    "type": "executeCommand" | "sendMessage",
    "command": "shell command (for executeCommand)",
    "message": "message text (for sendMessage)"
  },
  "enabled": true
}
```

## Best Practices

1. **Keep hooks focused**: Each hook should do one thing well
2. **Use descriptive names**: Make it clear what the hook does
3. **Test hooks carefully**: Ensure they don't interfere with workflow
4. **Disable when not needed**: Turn off hooks that aren't useful for current work
5. **Document custom hooks**: Add comments explaining complex logic
