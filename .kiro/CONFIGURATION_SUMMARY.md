# GhostPipes Backend - Kiro Configuration Summary

This document provides an overview of all Kiro configurations for the GhostPipes backend project.

## 📁 Directory Structure

```
.kiro/
├── hooks/                      # Agentic hooks for automation
│   ├── on-save-run-tests.json
│   ├── on-migration-create-reminder.json
│   ├── on-env-change-warning.json
│   ├── on-spec-update-sync.json
│   ├── on-docker-build-check.json
│   ├── on-api-schema-validation.json
│   ├── manual-lint-check.json
│   ├── manual-db-reset.json
│   └── README.md
├── settings/
│   ├── mcp.json                # MCP server configuration
│   └── MCP_SETUP.md           # MCP setup guide
├── specs/                      # Feature specifications
│   ├── backend-logic/
│   │   ├── requirements.md
│   │   ├── design.md
│   │   └── tasks.md
│   ├── pipeline-builder/
│   │   ├── requirements.md
│   │   ├── design.md
│   │   └── tasks.md
│   └── [other specs...]
├── steering/                   # Coding guidelines
│   ├── 00-js-coding-guidelines.md
│   ├── 01-project-rules.md
│   ├── 02-ui-design-rules.md
│   ├── 03-web-component-patterns.md
│   └── 04-omjs-framework-rules.md
└── prompts/                    # AI prompts for features
    └── [various prompts...]
```

## 🎣 Agentic Hooks

### Automatic Hooks (8 total)

| Hook                      | Trigger                      | Action                   | Purpose                      |
| ------------------------- | ---------------------------- | ------------------------ | ---------------------------- |
| **Run Tests on Save**     | Save `.js` in `src/`         | Run test suite           | Catch bugs immediately       |
| **Migration Reminder**    | Save in `migrations/`        | Remind to run migrations | Ensure DB is up-to-date      |
| **Env Change Warning**    | Save `.env*`                 | Warn to restart server   | Prevent stale config         |
| **Spec Update Sync**      | Save in `specs/`             | Notify to review code    | Keep code aligned with specs |
| **Docker Build Check**    | Save Dockerfile/package.json | Suggest rebuild          | Keep Docker image current    |
| **API Schema Validation** | Save `schemas.js`            | Remind to validate       | Maintain API contracts       |
| **Manual Lint Check**     | Manual trigger               | Run ESLint               | Check code quality           |
| **Reset Database**        | Manual trigger               | Rollback & re-migrate    | Quick dev DB reset           |

### How to Use Hooks

1. **View hooks**: Kiro sidebar → Agent Hooks section
2. **Enable/disable**: Edit JSON file, set `"enabled": true/false`
3. **Trigger manual hooks**: Click button in Kiro UI
4. **Create new hooks**: Add JSON file to `.kiro/hooks/`

## 🔌 MCP Servers

### Configured Servers (5 total)

| Server                | Purpose            | Key Tools                                       | Auto-Approved |
| --------------------- | ------------------ | ----------------------------------------------- | ------------- |
| **AWS Documentation** | Access AWS docs    | search_aws_documentation, get_aws_documentation | ✅ Yes        |
| **AWS KB Retrieval**  | AWS best practices | retrieve_and_generate                           | ✅ Yes        |
| **Filesystem**        | Read project files | read_file, list_directory, search_files         | ✅ Yes        |
| **PostgreSQL**        | Query database     | query, list_tables, describe_table              | ✅ Yes        |
| **Git**               | Check git status   | git_status, git_diff, git_log                   | ✅ Yes        |

### MCP Setup Requirements

1. **Install uv**: `curl -LsSf https://astral.sh/uv/install.sh | sh`
2. **Set environment variables**:
   ```bash
   DATABASE_URL=postgresql://user:pass@host:5432/db
   AWS_REGION=us-east-1
   ```
3. **Reconnect servers**: Kiro sidebar → MCP Server view → Reconnect

### Common MCP Use Cases

**AWS Documentation**:

- "Search AWS docs for Aurora connection pooling"
- "Get AWS Secrets Manager API reference"
- "Find AWS CLI commands for RDS snapshots"

**Database Queries**:

- "List all tables in the database"
- "Describe the webhooks table schema"
- "Query users table for test accounts"

**File Operations**:

- "Read the auth service implementation"
- "List all migration files"
- "Search for files containing 'webhook'"

**Git Operations**:

- "Show git status"
- "What files have changed since last commit?"
- "Show recent commit history"

## 📋 Specifications

### Backend Logic Spec

- **Location**: `.kiro/specs/backend-logic/`
- **Files**: requirements.md, design.md, tasks.md
- **Status**: ✅ Complete
- **Tasks**: 24 implementation tasks

### Pipeline Builder Spec

- **Location**: `.kiro/specs/pipeline-builder/`
- **Files**: requirements.md, design.md, tasks.md
- **Status**: ✅ Complete
- **Tasks**: 17 implementation tasks

### Other Specs

- Homepage specification
- Execution architecture
- Node specifications
- API endpoints
- Auth flow
- Web push notifications
- Webhook system
- Database schema
- Sync logic
- AWS deployment

## 🎯 Steering Rules

### Coding Guidelines (5 files)

1. **00-js-coding-guidelines.md**: Modern JavaScript patterns, no switch statements, concise code
2. **01-project-rules.md**: Project structure, naming conventions, architecture patterns
3. **02-ui-design-rules.md**: UI design philosophy, layout rules, interaction patterns
4. **03-web-component-patterns.md**: Web component structure, event handling, best practices
5. **04-omjs-framework-rules.md**: Om.js reactive framework rules, component structure

### Key Principles

- **Concise code**: Use ternary operators, object lookups instead of switch
- **Classes over typedefs**: Define data structures as classes
- **Modern JS**: Use Chrome 140+ features, no polyfills needed
- **Separation of concerns**: Modular architecture with clear boundaries
- **Performance**: 60fps target, requestAnimationFrame for animations

## 🚀 Quick Start Workflow

### 1. Initial Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Run migrations
npm run migrate

# Seed database (optional)
npm run seed
```

### 2. Development Workflow

```bash
# Start development server
npm run dev

# In another terminal, watch tests
npm run test:watch

# Hooks will automatically:
# - Run tests when you save files
# - Remind you to run migrations
# - Warn about env changes
```

### 3. Using Kiro Features

**Specs**:

1. Open `.kiro/specs/backend-logic/tasks.md`
2. Click "Start task" next to a task
3. Kiro will guide you through implementation

**MCP Servers**:

1. Ask Kiro: "Search AWS docs for Aurora best practices"
2. Ask Kiro: "List all database tables"
3. Ask Kiro: "Show git status"

**Hooks**:

1. Save a file → Tests run automatically
2. Modify .env → Get restart reminder
3. Click "Manual Lint Check" → Run ESLint

### 4. Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js

# Run with coverage
npm run test:coverage
```

### 5. Deployment

```bash
# Build Docker image
docker build -t ghostpipes-backend .

# Test locally
docker run -p 8080:8080 --env-file .env ghostpipes-backend

# Deploy to AWS App Runner
# (See .kiro/specs/18-deploy-on-aws.md)
```

## 📚 Documentation Links

- **Hooks Guide**: `.kiro/hooks/README.md`
- **MCP Setup**: `.kiro/settings/MCP_SETUP.md`
- **Backend Spec**: `.kiro/specs/backend-logic/`
- **API Endpoints**: `.kiro/specs/11-api-endpoints.md`
- **AWS Deployment**: `.kiro/specs/18-deploy-on-aws.md`

## 🔧 Customization

### Adding New Hooks

1. Create JSON file in `.kiro/hooks/`
2. Define trigger and action
3. Set enabled to true
4. Test the hook

### Adding New MCP Servers

1. Edit `.kiro/settings/mcp.json`
2. Add server configuration
3. Save and reconnect in Kiro
4. Test the server tools

### Updating Specs

1. Edit spec files in `.kiro/specs/`
2. Hook will notify to review implementation
3. Update code to match new specs
4. Update tasks.md if needed

## 💡 Tips & Best Practices

1. **Use hooks wisely**: Disable hooks that slow down your workflow
2. **Leverage MCP**: Ask Kiro to search AWS docs instead of browsing manually
3. **Follow specs**: Specs are the source of truth for implementation
4. **Run tests often**: Hooks make this automatic
5. **Keep docs updated**: Update specs when requirements change
6. **Use manual hooks**: Lint check and DB reset are powerful tools
7. **Monitor MCP logs**: Check for connection issues
8. **Set env vars**: Required for PostgreSQL and AWS MCP servers

## 🐛 Troubleshooting

### Hooks Not Working

- Check if hook is enabled in JSON file
- Verify file pattern matches your files
- Check Kiro logs for errors

### MCP Server Connection Failed

- Ensure `uv` is installed: `uv --version`
- Check environment variables are set
- Reconnect server in Kiro UI
- View logs in MCP Server panel

### Tests Failing

- Check if migrations are up-to-date
- Verify database connection
- Review test output for specific errors
- Use manual lint check to find code issues

### Docker Build Issues

- Ensure Dockerfile is correct
- Check .dockerignore excludes node_modules
- Verify all dependencies are in package.json
- Test build locally before deploying

## 📞 Support

For issues or questions:

1. Check documentation in `.kiro/` folder
2. Review spec files for requirements
3. Check Kiro logs for errors
4. Use MCP servers to search AWS docs
5. Ask Kiro for help with specific tasks
