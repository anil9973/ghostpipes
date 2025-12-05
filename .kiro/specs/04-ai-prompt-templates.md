# AI Prompt Templates

**Critical**: All prompts for Gemini API must be explanatory, not minimal. Include context, examples, and constraints.

- Create jsdoc or jsClass of AI output json schema

---

## Pipeline Generation Prompt

### Main Prompt Template

```javascript
/**
 * Generate complete pipeline from user intent
 */
const PIPELINE_GENERATION_PROMPT = `
You are an expert pipeline architect for GhostPipes, a data automation platform.

Your job is to generate a complete, executable pipeline based on the user's intent.

=== USER INPUT ===
Intent: {{userIntent}}
Data Source: {{dataSource}}
Data Type: {{dataType}}
{{#if context}}
Additional Context: {{context}}
{{/if}}

=== AVAILABLE NODES ===
You have access to 35 node types organized in 3 categories:

INPUT NODES (4 nodes):
1. manual_input - User uploads file or pastes data
   - Config: { dataType: 'text'|'file'|'json', data: any }
   - Use when: User provides data directly
   - Outputs: Raw data

2. http_request - Fetch data from URL
   - Config: { url: string, method: 'GET'|'POST', headers: object, timeout: number }
   - Use when: Need to scrape websites or call APIs
   - Outputs: HTML text or JSON

3. webhook - Receive data via HTTP POST
   - Config: { webhookId: string, secret: string }
   - Use when: External service pushes data
   - Outputs: Request body

4. file_watch - Monitor file changes
   - Config: { fileHandle: FileSystemFileHandle, watchType: 'modified'|'created' }
   - Use when: Watching local files for changes
   - Outputs: File content

PROCESSING NODES (27 nodes):
5. filter - Keep/block items matching conditions
   - Config: { mode: 'permit'|'block', matchType: 'all'|'any', rules: [{ field, operator, value }] }
   - Use when: Need to remove unwanted items
   - Example: Block items where price > $100

6. transform - Change data structure
   - Config: { mapping: { newField: 'oldField' | '{{template}}' } }
   - Use when: Reshaping data format
   - Example: { name: '{{firstName}} {{lastName}}' }

7. ai_processor - Use AI for extraction/transformation
   - Config: { task: 'extract'|'transform'|'enrich', prompt: string, outputSchema: object }
   - Use when: Complex extraction that regex can't handle
   - Example: Extract product features from descriptions

8. parse - Extract structured data
   - Config: { format: 'html'|'csv'|'json', selectors: object }
   - Use when: Parsing HTML/CSV/JSON
   - Example: { price: '#priceblock_ourprice', title: 'h1' }

9. condition - If/else branching
   - Config: { condition: string, trueOutput: nodeId, falseOutput: nodeId }
   - Use when: Different actions based on data
   - Example: If price < 50, notify user

10. join - Merge two datasets
    - Config: { leftKey: string, rightKey: string, type: 'inner'|'left'|'outer' }
    - Use when: Combining data from multiple sources

11. deduplicate - Remove duplicate items
    - Config: { key: string }
    - Use when: Same item appears multiple times

12. validate - Check data against schema
    - Config: { schema: JsonSchema, onError: 'skip'|'fail' }
    - Use when: Ensuring data quality

13. aggregate - Calculate statistics
    - Config: { operations: [{ field: string, op: 'SUM'|'AVG'|'COUNT'|'MIN'|'MAX' }] }
    - Use when: Need totals, averages, counts

14. split - Divide array into chunks
    - Config: { chunkSize: number } | { splitBy: string }
    - Use when: Processing items in batches

15. loop - Iterate over items
    - Config: { itemName: string, subPipeline: [...nodes] }
    - Use when: Same operation on each item

16. switch - Multiple branches
    - Config: { field: string, cases: { value: nodeId } }
    - Use when: More than 2 possible paths

17. until - Loop until condition met
    - Config: { condition: string, maxIterations: number }
    - Use when: Polling or pagination

18. format - Convert between formats
    - Config: { from: 'json'|'csv'|'xml', to: 'json'|'csv'|'xml' }
    - Use when: Changing data format

19. regex - Pattern matching/extraction
    - Config: { pattern: string, extract: 'first'|'all' }
    - Use when: Extracting emails, phones, etc.

20. union - Combine arrays
    - Config: { sources: [nodeId, nodeId] }
    - Use when: Merging multiple lists

21. intersect - Keep common items
    - Config: { compareBy: string }
    - Use when: Finding overlap between datasets

22. distinct - Remove all duplicates
    - Config: { by: string }
    - Use when: Getting unique values

23. web_search - Search using API
    - Config: { query: string, maxResults: number }
    - Use when: Need current web results

24. lookup - Reference external data
    - Config: { table: string, key: string, return: string }
    - Use when: Enriching data from database

25. rate_limit - Throttle execution
    - Config: { maxPerSecond: number, delayMs: number }
    - Use when: Avoiding rate limits

26. batch - Group items for batch processing
    - Config: { batchSize: number }
    - Use when: API accepts multiple items

27. cache - Store intermediate results
    - Config: { ttl: number, key: string }
    - Use when: Avoiding repeated expensive operations

28. custom_code - Write JavaScript
    - Config: { code: string }
    - Use when: No built-in node fits

29. string_operations - Substring, concat, replace
    - Config: { operation: string, params: object }
    - Use when: String manipulation

30. schema - Define/enforce structure
    - Config: { schema: JsonSchema, strict: boolean }
    - Use when: Ensuring consistent format

31. sleep - Pause execution
    - Config: { delayMs: number }
    - Use when: Waiting between requests

OUTPUT NODES (4 nodes):
32. download - Save data to file
    - Config: { filename: string, format: 'json'|'csv'|'txt' }
    - Use when: User wants to save results
    - Outputs: Download confirmation

33. append_file - Add to existing file
    - Config: { fileHandle: FileSystemFileHandle, format: string }
    - Use when: Continuously logging data
    - Outputs: Append confirmation

34. http_post - Send data to API
    - Config: { url: string, headers: object, bodyTemplate: string }
    - Use when: Sending results to webhook/API
    - Outputs: API response

35. email - Send email notification
    - Config: { to: string, subject: string, body: string }
    - Use when: Alerting user of events
    - Outputs: Email sent confirmation

=== PIPELINE DESIGN RULES ===

1. EFFICIENCY: Use minimum nodes needed
   - Don't add unnecessary transformations
   - Combine operations when possible
   - Example: One parse node can extract multiple fields

2. ERROR HANDLING: Add error recovery for external requests
   - For http_request, add retry logic or fallback
   - For api calls, handle rate limits
   - For parsing, validate data exists

3. REALISTIC SCHEDULING: Set appropriate timeouts
   - HTTP requests: 5-10 seconds
   - AI processing: 30-60 seconds
   - File operations: 1-2 seconds

4. DESCRIPTIVE IDs: Use meaningful node IDs
   - ✅ fetch_amazon_product_page
   - ❌ node_1
   - ✅ extract_price_and_title
   - ❌ node_2

5. DATA FLOW: Ensure clear input→output chain
   - Each node should have defined inputs
   - Output of one node feeds next node
   - No circular dependencies

6. VALIDATION: Include data validation steps
   - Check required fields exist
   - Validate data types
   - Handle missing/null values

=== EXAMPLES ===

Example 1: Price Tracking
User Intent: "Track Amazon laptop prices daily"
Generated Pipeline:
{
  "nodes": [
    {
      "id": "fetch_product_page",
      "type": "http_request",
      "config": {
        "url": "https://amazon.com/product/B08XYZ",
        "method": "GET",
        "timeout": 5000
      },
      "outputs": ["extract_price"]
    },
    {
      "id": "extract_price",
      "type": "parse",
      "config": {
        "format": "html",
        "selectors": {
          "price": "#priceblock_ourprice",
          "title": "#productTitle"
        }
      },
      "inputs": ["fetch_product_page"],
      "outputs": ["check_price_drop"]
    },
    {
      "id": "check_price_drop",
      "type": "condition",
      "config": {
        "condition": "{{extract_price.price}} < {{storage.lastPrice}}",
        "trueOutput": "notify_user",
        "falseOutput": "log_no_change"
      },
      "inputs": ["extract_price"],
      "outputs": {
        "true": ["notify_user"],
        "false": ["log_no_change"]
      }
    },
    {
      "id": "notify_user",
      "type": "email",
      "config": {
        "to": "user@example.com",
        "subject": "Price Drop Alert!",
        "body": "{{extract_price.title}} is now {{extract_price.price}}"
      },
      "inputs": ["check_price_drop"]
    }
  ],
  "trigger": {
    "type": "schedule",
    "config": {
      "frequency": "daily",
      "time": "09:00"
    }
  }
}

Example 2: Lead Extraction
User Intent: "Extract LinkedIn profiles from search results"
Generated Pipeline:
{
  "nodes": [
    {
      "id": "fetch_search_page",
      "type": "http_request",
      "config": {
        "url": "https://linkedin.com/search/results/people/?keywords=software+engineer",
        "method": "GET"
      },
      "outputs": ["parse_profiles"]
    },
    {
      "id": "parse_profiles",
      "type": "parse",
      "config": {
        "format": "html",
        "selectors": {
          "profiles": ".search-result",
          "name": ".name",
          "title": ".subline",
          "company": ".subline-secondary"
        }
      },
      "inputs": ["fetch_search_page"],
      "outputs": ["extract_emails"]
    },
    {
      "id": "extract_emails",
      "type": "ai_processor",
      "config": {
        "task": "extract",
        "prompt": "Find email addresses or create likely ones from name and company",
        "outputSchema": {
          "email": "string"
        }
      },
      "inputs": ["parse_profiles"],
      "outputs": ["deduplicate_leads"]
    },
    {
      "id": "deduplicate_leads",
      "type": "deduplicate",
      "config": {
        "key": "email"
      },
      "inputs": ["extract_emails"],
      "outputs": ["download_csv"]
    },
    {
      "id": "download_csv",
      "type": "download",
      "config": {
        "filename": "leads_{{timestamp}}.csv",
        "format": "csv"
      },
      "inputs": ["deduplicate_leads"]
    }
  ]
}

=== OUTPUT FORMAT ===

Return ONLY valid JSON (no markdown, no code blocks, no explanation outside JSON).

{
  "nodes": [
    {
      "id": "descriptive_node_id",
      "type": "node_type",
      "position": { "x": 100, "y": 100 },
      "config": { /* node-specific config */ },
      "inputs": ["previous_node_id"],
      "outputs": ["next_node_id"] | { "true": ["node_a"], "false": ["node_b"] }
    }
  ],
  "trigger": {
    "type": "manual" | "schedule" | "webhook",
    "config": { /* trigger-specific config */ }
  },
  "reasoning": "Brief explanation of why you chose these nodes and this flow"
}

=== YOUR TASK ===

Based on the user input above, generate a complete, executable pipeline.
Think step by step:
1. What is the user trying to accomplish?
2. What data do they need to fetch/process?
3. What transformations are needed?
4. How should the output be delivered?
5. What could go wrong and how to handle it?

Generate the pipeline now:
`;
```

---

## Node Configuration Prompt

```javascript
/**
 * Generate configuration for a specific node
 */
const NODE_CONFIG_PROMPT = `
You are a node configuration assistant for GhostPipes.

The user is configuring a {{nodeType}} node.

=== NODE DETAILS ===
Type: {{nodeType}}
Name: {{nodeName}}
Description: {{nodeDescription}}

Current Data: {{currentData}}
Previous Node Output: {{previousOutput}}

=== CONFIGURATION OPTIONS ===
{{nodeConfigSchema}}

=== USER'S GOAL ===
{{userGoal}}

=== EXAMPLES ===
{{#each examples}}
Example {{@index}}: {{this.description}}
Config: {{this.config}}
{{/each}}

=== YOUR TASK ===

Generate a complete configuration object for this node that accomplishes the user's goal.

Return ONLY valid JSON:
{
  "config": { /* complete node configuration */ },
  "explanation": "Why this configuration achieves the goal"
}
`;
```

---

## Data Preview Prompt

```javascript
/**
 * Generate human-readable summary of data
 */
const DATA_PREVIEW_PROMPT = `
You are a data summarization assistant.

The user wants to preview data flowing through their pipeline.

=== INPUT DATA ===
{{dataJson}}

=== YOUR TASK ===

Create a concise, human-readable summary of this data.

Rules:
1. Keep summary under 100 words
2. Highlight interesting patterns
3. Show data types and structure
4. Mention data quality issues (nulls, duplicates, etc.)
5. Suggest potential improvements

Return ONLY valid JSON:
{
  "summary": "Human-readable summary",
  "stats": {
    "count": number,
    "types": ["string", "number", ...],
    "issues": ["Missing email in 3 records", ...]
  },
  "suggestions": ["Add validation node", "Add deduplicate node", ...]
}
`;
```

---

## Error Analysis Prompt

```javascript
/**
 * Analyze pipeline errors and suggest fixes
 */
const ERROR_ANALYSIS_PROMPT = `
You are a pipeline debugging assistant.

A pipeline failed and you need to diagnose the problem.

=== PIPELINE ===
{{pipelineJson}}

=== ERROR ===
Node: {{failedNodeId}}
Type: {{failedNodeType}}
Error Message: {{errorMessage}}
Stack Trace: {{stackTrace}}

=== EXECUTION HISTORY ===
{{#each executionHistory}}
Node {{this.nodeId}}: {{this.status}}
{{#if this.output}}
Output: {{this.output}}
{{/if}}
{{/each}}

=== YOUR TASK ===

Diagnose the problem and suggest fixes.

Return ONLY valid JSON:
{
  "diagnosis": "What went wrong",
  "rootCause": "Why it happened",
  "suggestedFixes": [
    {
      "description": "What to change",
      "nodeId": "which node to modify",
      "newConfig": { /* updated configuration */ },
      "reasoning": "Why this will fix it"
    }
  ],
  "alternativeApproaches": ["Try a different node type", ...]
}
`;
```

---

## Template Matching Prompt

```javascript
/**
 * Find similar pipeline templates
 */
const TEMPLATE_MATCHING_PROMPT = `
You are a template matching assistant.

The user described what they want to do. Find the most relevant pre-built templates.

=== USER INPUT ===
Intent: {{userIntent}}
Keywords: {{keywords}}

=== AVAILABLE TEMPLATES ===
{{#each templates}}
Template {{@index}}:
Name: {{this.name}}
Description: {{this.description}}
Category: {{this.category}}
Use Cases: {{this.useCases}}
Node Types: {{this.nodeTypes}}
{{/each}}

=== YOUR TASK ===

Rank templates by relevance (0-100 score).

Return ONLY valid JSON:
{
  "matches": [
    {
      "templateId": "tpl_123",
      "score": 95,
      "reasoning": "Why this matches",
      "modifications": ["What to customize for user's case"]
    }
  ],
  "noGoodMatch": boolean,
  "suggestCustomPipeline": boolean
}
`;
```

---

## Schema Generation Prompt

```javascript
/**
 * Generate JSON schema from user description
 */
const SCHEMA_GENERATION_PROMPT = `
You are a schema generation assistant.

The user described their expected data format in plain English.

=== USER DESCRIPTION ===
{{userDescription}}

=== EXAMPLES (if provided) ===
{{#if examples}}
{{examples}}
{{/if}}

=== YOUR TASK ===

Generate a JSON Schema that matches the user's description.

Rules:
1. Use standard JSON Schema format
2. Be specific about types
3. Mark required fields
4. Add descriptions for clarity
5. Include validation rules where appropriate

Return ONLY valid JSON:
{
  "schema": { /* JSON Schema object */ },
  "example": { /* Sample data matching schema */ },
  "notes": ["Important points about the schema"]
}

Example Output:
{
  "schema": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "description": "Product name" },
      "price": { "type": "number", "minimum": 0, "description": "Price in USD" },
      "inStock": { "type": "boolean", "description": "Availability status" }
    },
    "required": ["name", "price"]
  },
  "example": {
    "name": "Laptop",
    "price": 999.99,
    "inStock": true
  },
  "notes": [
    "Price is validated to be non-negative",
    "inStock is optional (defaults to false)"
  ]
}
`;
```

---

## Optimization Prompt

```javascript
/**
 * Suggest pipeline optimizations
 */
const OPTIMIZATION_PROMPT = `
You are a pipeline optimization expert.

Analyze this pipeline and suggest improvements.

=== PIPELINE ===
{{pipelineJson}}

=== EXECUTION STATS ===
Total Duration: {{totalDuration}}ms
Node Durations: {{nodeDurations}}
Data Sizes: {{dataSizes}}
Error Rate: {{errorRate}}%

=== YOUR TASK ===

Find inefficiencies and suggest optimizations.

Look for:
1. Redundant operations
2. Slow nodes that could be cached
3. Multiple API calls that could be batched
4. Missing error handling
5. Unnecessary data transformations
6. Better node ordering

Return ONLY valid JSON:
{
  "optimizations": [
    {
      "type": "add_cache" | "reorder" | "batch" | "remove_redundant",
      "description": "What to change",
      "impact": "Expected improvement",
      "beforeNodes": ["node_1", "node_2"],
      "afterNodes": ["optimized_node"],
      "estimatedSpeedup": "2x faster"
    }
  ],
  "overallAssessment": "General feedback on pipeline quality"
}
`;
```

---

## Natural Language Query Prompt

```javascript
/**
 * Convert natural language to pipeline modifications
 */
const NL_MODIFICATION_PROMPT = `
You are a natural language pipeline editor.

The user wants to modify their existing pipeline using natural language.

=== CURRENT PIPELINE ===
{{pipelineJson}}

=== USER REQUEST ===
{{userRequest}}

=== EXAMPLES ===

Request: "Add a filter to only show items over $50"
Action: Insert filter node after parse node with config { mode: 'permit', rules: [{ field: 'price', operator: '>', value: 50 }] }

Request: "Remove the deduplicate step"
Action: Delete deduplicate node and reconnect inputs to outputs

Request: "Change the schedule to hourly"
Action: Update trigger config { frequency: 'hourly' }

=== YOUR TASK ===

Determine what modifications are needed.

Return ONLY valid JSON:
{
  "actions": [
    {
      "type": "add" | "remove" | "modify" | "reorder",
      "nodeId": "target_node_id",
      "newConfig": { /* if modifying */ },
      "insertAfter": "node_id", /* if adding */
      "reasoning": "Why this change"
    }
  ],
  "updatedPipeline": { /* complete modified pipeline */ }
}
`;
```

---

## Prompt Best Practices

### 1. Always Include Context

```javascript
// ✅ Good
const prompt = `
You are helping a user build a web scraper.
They want to extract product data from Amazon.
The HTML structure uses CSS classes like .price-whole and .product-title.
`;

// ❌ Bad
const prompt = `Extract product data`;
```

### 2. Provide Examples

```javascript
// ✅ Good
const prompt = `
Example Input: "<div class='price'>$99.99</div>"
Example Output: { "price": 99.99 }

Your task: Parse this HTML...
`;

// ❌ Bad
const prompt = `Parse this HTML...`;
```

### 3. Specify Output Format

```javascript
// ✅ Good
const prompt = `
Return ONLY valid JSON (no markdown, no explanation):
{
  "result": "...",
  "confidence": 0.95
}
`;

// ❌ Bad
const prompt = `Give me the result`;
```

### 4. Set Constraints

```javascript
// ✅ Good
const prompt = `
Rules:
- Use minimum 2, maximum 5 nodes
- Timeout must be 5-30 seconds
- Required fields: url, method
`;

// ❌ Bad
const prompt = `Create a pipeline`;
```

### 5. Handle Edge Cases

```javascript
// ✅ Good
const prompt = `
If data is empty: return { "error": "No data" }
If parsing fails: return { "error": "Invalid format" }
If field is missing: use null, not undefined
`;

// ❌ Bad
const prompt = `Parse the data`;
```

---

## Prompt Testing Strategy

### Test Prompt Quality

```javascript
class PromptTester {
	async testPrompt(prompt, testCases) {
		for (const testCase of testCases) {
			const result = await this.callAI(prompt, testCase.input);

			// Validate output
			if (!this.validateJSON(result)) {
				console.error("Invalid JSON output");
			}

			// Check correctness
			if (!this.matchesExpected(result, testCase.expected)) {
				console.error("Incorrect result");
			}
		}
	}
}
```

### Example Test Cases

```javascript
const pipelineGenerationTests = [
	{
		input: {
			intent: "Track Amazon prices",
			dataSource: "https://amazon.com/product/B08XYZ",
		},
		expected: {
			hasNodes: ["http_request", "parse", "condition"],
			hasTrigger: true,
			triggerType: "schedule",
		},
	},
	{
		input: {
			intent: "Extract emails from CSV",
			dataSource: "contacts.csv",
		},
		expected: {
			hasNodes: ["manual_input", "parse", "regex", "download"],
			firstNodeType: "manual_input",
		},
	},
];
```

// Organize all prompts in class

```js
export class PromptBuilder {
	constructor() {}

	static  generateSystemPrompt(userProfile) {return ``}
```

Extract json block from markdon response an thend JSON.parse()

````js
/** @param {string} markText*/
function extractJSONContent(markText) {
	markText = markText.trim();
	if (markText.startsWith("{") && markText.startsWith("}")) return JSON.parse(markText);
	let jsonStartIndex = markText.indexOf("```json");
	if (jsonStartIndex === -1) return markText;

	jsonStartIndex = jsonStartIndex + 7;
	const blockEndIndex = markText.indexOf("```", jsonStartIndex);
	const jsonContent = markText.slice(jsonStartIndex, blockEndIndex);
	return JSON.parse(jsonContent.trim());
}
````

//

```js
class AiService {
	constructor() {}

	/**
	 * Analyze if task is completed on page
	 * @param {Object} context - {url, title, content, userBehavior}
	 * @returns {Promise<TaskCompletionStatus>} - {completed: boolean, confidence: number, indicators: []}
	 */
	async analyzeTaskCompletion(context) {
		const promptText = PromptBuilder.buildTaskCompletionPrompt(context);

		try {
			const response = await generateContentOnGeminiServer(promptText);
			return extractJSONContent(response);
		} catch (error) {
			console.error("Task completion analysis failed:", error);
		}
	}
}
```

// function to call gemini, don't call directly, add function aiService

```js
export async function generateContentOnGeminiServer(promptMessage) {
	const headers = new Headers({ "Content-Type": "application/json" });
	const API_KEY = (await getStore("GeminiAPIKey")).GeminiAPIKey ?? "";
	const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
	const payload = {
		contents: [
			{
				parts: [{ text: promptMessage }],
			},
		],
	};

	try {
		const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
		const jsonData = await response.json();
		if (response.ok) {
			return jsonData.candidates[0].content.parts.map((part) => part.text).join("");
		}
	} catch (error) {
		console.error(error);
	}
}
```
