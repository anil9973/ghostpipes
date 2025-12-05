# MCP (Model Context Protocol) Setup Guide

This document explains the MCP servers configured for the GhostPipes backend project.

## Prerequisites

Install `uv` (Python package manager) to use MCP servers:

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or with Homebrew
brew install uv

# Or with pip
pip install uv
```

After installation, `uvx` will be available to run MCP servers.

## Configured MCP Servers

### 1. AWS Documentation Server

**Purpose**: Access AWS documentation for Aurora, Secrets Manager, CLI, and other services

**Configuration**:

```json
{
	"command": "uvx",
	"args": ["awslabs.aws-documentation-mcp-server@latest"]
}
```

**Available Tools**:

- `search_aws_documentation`: Search AWS docs by keyword
- `get_aws_documentation`: Get specific AWS documentation pages

**Usage Examples**:

- "Search AWS docs for Aurora PostgreSQL connection strings"
- "Get AWS Secrets Manager best practices documentation"
- "Find AWS CLI commands for RDS management"

**Auto-approved**: Yes (search and get operations)

### 2. AWS Knowledge Base Retrieval

**Purpose**: Retrieve AWS-specific knowledge and best practices

**Configuration**:

```json
{
	"command": "uvx",
	"args": ["mcp-server-aws-kb-retrieval"],
	"env": {
		"AWS_REGION": "us-east-1"
	}
}
```

**Available Tools**:

- `retrieve_and_generate`: Query AWS knowledge base

**Usage Examples**:

- "What are best practices for Aurora Serverless v2 scaling?"
- "How to configure AWS App Runner with custom domains?"
- "Security recommendations for RDS in production"

**Auto-approved**: Yes

### 3. Filesystem Server

**Purpose**: Read and navigate project files

**Configuration**:

```json
{
	"command": "uvx",
	"args": ["mcp-server-filesystem", "${workspaceFolder}"]
}
```

**Available Tools**:

- `read_file`: Read file contents
- `list_directory`: List directory contents
- `search_files`: Search for files by pattern

**Usage Examples**:

- "Read the database migration file"
- "List all files in src/modules/"
- "Search for files containing 'webhook'"

**Auto-approved**: Yes (read-only operations)

### 4. PostgreSQL Server

**Purpose**: Query and inspect the database schema

**Configuration**:

```json
{
	"command": "uvx",
	"args": ["mcp-server-postgres"],
	"env": {
		"POSTGRES_CONNECTION_STRING": "${env:DATABASE_URL}"
	}
}
```

**Available Tools**:

- `query`: Execute SQL queries
- `list_tables`: List all database tables
- `describe_table`: Get table schema details

**Usage Examples**:

- "List all tables in the database"
- "Describe the pipelines table schema"
- "Query the users table for test data"

**Auto-approved**: Yes (read operations)

**⚠️ Important**: Set `DATABASE_URL` environment variable before using this server.

### 5. Git Server

**Purpose**: Check git status and history

**Configuration**:

```json
{
	"command": "uvx",
	"args": ["mcp-server-git"]
}
```

**Available Tools**:

- `git_status`: Check working directory status
- `git_diff`: View changes in files
- `git_log`: View commit history

**Usage Examples**:

- "Show git status"
- "What files have changed?"
- "Show recent commits"

**Auto-approved**: Yes (read-only operations)

## Using MCP Servers in Kiro

### Viewing Available Servers

1. Open Kiro command palette (Cmd/Ctrl+Shift+P)
2. Search for "MCP"
3. Select "MCP: List Servers"

### Reconnecting Servers

If a server fails to connect:

1. Open the MCP Server view in Kiro sidebar
2. Click the reconnect button next to the server
3. Check the logs for error messages

### Disabling Servers

To disable a server temporarily, edit `.kiro/settings/mcp.json`:

```json
{
	"mcpServers": {
		"server-name": {
			"disabled": true
		}
	}
}
```

## Environment Variables

Some MCP servers require environment variables:

### For PostgreSQL Server

```bash
# .env
DATABASE_URL=postgresql://user:password@host:5432/database
```

### For AWS Servers

```bash
# .env (optional, uses default AWS credentials)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

## Troubleshooting

### Server Won't Start

1. Check if `uv` is installed: `uv --version`
2. Check if the server package exists: `uvx --help`
3. View server logs in Kiro MCP panel

### Connection Errors

1. Verify environment variables are set
2. Check network connectivity
3. Ensure credentials are valid

### Auto-Approval Not Working

1. Check the `autoApprove` array in mcp.json
2. Ensure tool names match exactly
3. Restart Kiro after configuration changes

## Adding New MCP Servers

To add a new MCP server:

1. Edit `.kiro/settings/mcp.json`
2. Add a new entry under `mcpServers`:

```json
{
	"mcpServers": {
		"new-server": {
			"command": "uvx",
			"args": ["package-name"],
			"env": {},
			"disabled": false,
			"autoApprove": []
		}
	}
}
```

3. Save the file
4. Reconnect servers in Kiro

## Best Practices

1. **Use auto-approve for read-only operations**: Safe operations like reading docs or querying data
2. **Don't auto-approve write operations**: Always review before modifying data
3. **Set appropriate environment variables**: Use `.env` files for sensitive data
4. **Monitor server logs**: Check for errors and performance issues
5. **Disable unused servers**: Reduce resource usage by disabling servers you don't need

## AWS-Specific Tips

### Aurora PostgreSQL

- Use AWS docs server to find connection string formats
- Check best practices for connection pooling
- Review security group configuration

### Secrets Manager

- Store database credentials securely
- Use AWS CLI to retrieve secrets in deployment
- Rotate secrets regularly

### App Runner

- Review deployment configuration options
- Check health check requirements
- Understand auto-scaling settings

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [AWS Documentation MCP Server](https://github.com/awslabs/aws-documentation-mcp-server)
- [Kiro MCP Guide](https://docs.kiro.ai/mcp)
