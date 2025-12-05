## Database Schema (Revised)

### pipelines

- id (uuid, PK)
- user_id (uuid, FK → users)
- title (string) - Human-readable pipeline name
- summary (text, nullable) - Description of pipeline purpose
- definition (jsonb) - Complete pipeline structure containing:

```json
{
	"trigger": { "type": "manual", "config": {} },
	"nodes": [
		{
			"id": "node-1",
			"type": "http_request",
			"title": "Fetch Data",
			"summary": "Gets data from API",
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
	]
}
```

- is_public (boolean)
- share_token (string, unique, nullable)
- cloned_from (uuid, FK → pipelines, nullable)
- clone_count (integer)
- created_at (bigint) - Unix timestamp in milliseconds
- updated_at (bigint) - Unix timestamp in milliseconds
