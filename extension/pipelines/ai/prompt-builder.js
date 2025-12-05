/**
 * @fileoverview AI Prompt Builder - Generates structured prompts for pipeline generation
 * @module core/ai/prompt-builder
 */

/**
 * Centralized prompt builder for AI pipeline generation
 * All prompts are explanatory with context, examples, and constraints
 */
export class PromptBuilder {
	/**
	 * Generate complete pipeline from user intent
	 * @param {Object} context - User input context
	 * @param {string} context.intent - What user wants to accomplish
	 * @param {string} [context.dataSource] - URL, file, or text data
	 * @param {string} [context.dataType] - Type of data (html, csv, json, text)
	 * @param {string} [context.trigger] - How to trigger (manual, schedule, webhook)
	 * @returns {string} Complete prompt for Gemini API
	 */
	static buildPipelineGenerationPrompt(context) {
		const { intent, dataSource = "", dataType = "unknown", trigger = "manual" } = context;

		return `
You are an expert pipeline architect for GhostPipes, a visual data automation platform.

Your job is to design a complete, executable pipeline based on the user's intent.

═══════════════════════════════════════════════════════════════════════════════
USER REQUEST
═══════════════════════════════════════════════════════════════════════════════

Intent: ${intent}
${dataSource ? `Data Source: ${dataSource}` : ""}
${dataType !== "unknown" ? `Data Type: ${dataType}` : ""}
Trigger Type: ${trigger}

═══════════════════════════════════════════════════════════════════════════════
AVAILABLE NODE TYPES
═══════════════════════════════════════════════════════════════════════════════

${this.getNodeDocumentation()}

═══════════════════════════════════════════════════════════════════════════════
PIPELINE DESIGN PRINCIPLES
═══════════════════════════════════════════════════════════════════════════════

1. EFFICIENCY - Use minimum nodes needed
   • Don't add unnecessary transformations
   • Combine operations when possible (e.g., one parse node for multiple fields)
   • Prefer built-in nodes over custom_code

2. ERROR HANDLING - Add resilience for external operations
   • HTTP requests may fail (timeout, 404, rate limits)
   • Parsing may fail (malformed data, missing fields)
   • Consider validation nodes before critical operations

3. DATA FLOW CLARITY - Ensure logical progression
   • Input → Process → Output (clear linear flow when possible)
   • Each node should have a clear purpose
   • Avoid circular dependencies

4. DESCRIPTIVE NAMING - Use meaningful node IDs
   ✅ GOOD: "fetch_product_page", "extract_price_and_title", "filter_expensive_items"
   ❌ BAD: "node_1", "node_2", "step_3"

5. REALISTIC CONFIGURATION - Set appropriate values
   • HTTP timeouts: 5000-10000 ms (5-10 seconds)
   • Match types: "all" for strict filtering, "any" for broader matches
   • Field names: Use common patterns (price, name, url, id, timestamp)

6. SCHEMA AWARENESS - Define expected data structures
   • Include inputSchema for ALL node connections
   • Use realistic field types: "string", "number", "boolean", "array", "object"
   • Example schema: { "item": { "price": "number", "name": "string", "inStock": "boolean" } }

═══════════════════════════════════════════════════════════════════════════════
SCHEMA DEFINITION RULES
═══════════════════════════════════════════════════════════════════════════════

Each connection MUST include an inputSchema showing the data structure:

Structure:
{
  "inputs": [
    {
      "nodeId": "previous_node_id",
      "inputSchema": {
        "fieldName": "fieldType",
        "nested": {
          "subField": "subFieldType"
        }
      }
    }
  ]
}

Common patterns:
• Web scraping: { "price": "number", "title": "string", "url": "string", "rating": "number" }
• CSV parsing: { "name": "string", "age": "number", "email": "string" }
• API responses: { "id": "string", "data": "object", "timestamp": "number" }
• Array operations: { "items": "array", "count": "number" }

═══════════════════════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════════════════════

Return ONLY valid JSON (no markdown code blocks, no explanatory text outside JSON).

{
  "nodes": [
    {
      "id": "descriptive_node_id",
      "type": "node_type_from_available_list",
      "title": "Human Readable Title",
      "summary": "Brief description of what this node does with current config",
      "config": {
        /* Node-specific configuration matching the Config classes */
      },
      "inputs": [
        {
          "nodeId": "previous_node_id",
          "inputSchema": {
            "field": "type"
          }
        }
      ],
      "outputs": [
        {
          "nodeId": "next_node_id",
          "outputSchema": {
            "field": "type"
          }
        }
      ]
    }
  ],
  "reasoning": "Brief explanation of pipeline design choices"
}

═══════════════════════════════════════════════════════════════════════════════
EXAMPLES
═══════════════════════════════════════════════════════════════════════════════

${this.getExamplePipelines()}

═══════════════════════════════════════════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════════════════════════════════════════

Analyze the user's intent and generate a complete pipeline:

1. What is the user trying to accomplish?
2. What nodes are needed to achieve this?
3. How should data flow between nodes?
4. What could go wrong and how to handle it?
5. What schemas describe the data at each step?

Generate the pipeline now:
`.trim();
	}

	/**
	 * Get comprehensive node documentation for AI
	 * @returns {string} Formatted node documentation
	 */
	static getNodeDocumentation() {
		return `
INPUT NODES (4 types):

1. manual_input - User provides data directly
   • Purpose: File upload or text paste
   • Config: { allowedMimeTypes: string[], data: string }
   • Outputs schema: Depends on uploaded data (usually array of objects)
   • Use when: User has data file or wants to paste data

2. http_request - Fetch data from URL
   • Purpose: Web scraping, API calls
   • Config: { method: "GET"|"POST", url: string, headers: array, queryParams: array }
   • Outputs schema: { "raw_data": "string" } or { "response": "object" }
   • Use when: Need to fetch data from web
   • Note: Returns raw HTML/JSON that needs parsing

3. webhook - Receive data via HTTP POST
   • Purpose: External services push data to pipeline
   • Config: { webhookId: string, method: "POST" }
   • Outputs schema: { "payload": "object" }
   • Use when: Triggered by external events (Zapier, IFTTT, etc.)

4. file_watch - Monitor directory for new files
   • Purpose: Automatic processing of new files
   • Config: { directoryHandle: object, directoryName: string, watchMimeTypes: string[] }
   • Outputs schema: { "filename": "string", "content": "string" }
   • Use when: Processing files as they appear

---

PROCESSING NODES (23 types):

5. filter - Keep or remove items based on conditions
   • Purpose: Remove unwanted data
   • Config: { mode: "permit"|"block", matchType: "all"|"any", rules: [{ field, operator, value }] }
   • Operators: ==, !=, >, <, >=, <=, contains, matches
   • Use when: Need to filter by price, category, date, etc.
   • Example: Block items where price > 100

6. transform - Reshape data structure
   • Purpose: Change field names, combine fields, restructure objects
   • Config: { transformations: [{ targetField, sourceField, operation }] }
   • Operations: copy, template, calculate
   • Use when: Output format differs from input format
   • Example: Combine firstName + lastName into fullName

7. parse - Extract structured data from raw content
   • Purpose: Parse HTML, CSV, JSON, XML
   • Config: { inputField: string, format: "json"|"csv"|"html"|"xml", onError: "skip"|"fail" }
   • Use when: After http_request to extract data from HTML/JSON
   • Outputs schema: Extracted fields as objects

8. ai_processor - Use AI for complex extraction/transformation
   • Purpose: AI-powered data extraction, enrichment, categorization
   • Config: { prompt: string, inputFormat: "json"|"text", outputFormat: "json"|"text" }
   • Use when: Complex extraction regex can't handle
   • Example: "Extract product features from description"

9. condition - Branch based on condition (if/else)
   • Purpose: Different actions based on data values
   • Config: { logic: "AND"|"OR", rules: [{ field, operator, value }] }
   • Outputs: Creates two branches (true/false paths)
   • Use when: Different handling for different data
   • Example: If price < 50, send email; else, just log

10. join - Merge two datasets
    • Purpose: Combine data from two sources
    • Config: { type: "inner"|"left"|"right"|"outer", leftKey: string, rightKey: string }
    • Requires: Two input connections
    • Use when: Enriching data from multiple sources
    • Example: Match products with reviews by product_id

11. deduplicate - Remove duplicate items
    • Purpose: Ensure unique items
    • Config: { scope: "field"|"full", fields: string[], keep: "first"|"last" }
    • Use when: Same item appears multiple times
    • Example: Remove duplicate email addresses

12. validate - Check data quality
    • Purpose: Ensure data meets requirements
    • Config: { onFailure: "skip"|"fail"|"tag", rules: [{ field, type, required }] }
    • Use when: Need to ensure data quality before output
    • Example: Require email, price, and name fields

13. aggregate - Calculate statistics
    • Purpose: SUM, AVG, COUNT, MIN, MAX calculations
    • Config: { groupByKey: boolean, aggregations: [{ field, operation, alias }] }
    • Operations: sum, avg, count, min, max
    • Use when: Need totals or statistics
    • Example: Total price by category

14. sort - Order items
    • Purpose: Sort data by fields
    • Config: { criteria: [{ field, order: "asc"|"desc" }] }
    • Use when: Need specific ordering
    • Example: Sort products by price (low to high)

15. split - Divide array into groups
    • Purpose: Group items by field value
    • Config: { method: "field"|"count", splitField: string, strategy: "separate"|"nest" }
    • Use when: Processing items by category
    • Example: Split products by category

16. loop - Execute sub-pipeline for each item
    • Purpose: Process each array item individually
    • Config: { loopOver: string, flatten: boolean, outputMode: "emit"|"collect" }
    • Use when: Different processing per item
    • Note: Creates nested pipeline

17. switch - Multiple branches based on field value
    • Purpose: Route to different nodes based on value
    • Config: { switchField: string }
    • Outputs: Multiple branches (one per unique value)
    • Use when: Different handling per category/type

18. until_loop - Repeat until condition met
    • Purpose: Pagination, polling
    • Config: { maxIterations: number, timeout: number, onTimeout: "fail"|"continue" }
    • Use when: Fetching all pages of results
    • Warning: Can cause infinite loops if not configured correctly

19. regex_pattern - Pattern matching and replacement
    • Purpose: Extract emails, phones, URLs using regex
    • Config: { patterns: [{ field, pattern, replacement, extract }] }
    • Use when: Extracting specific patterns from text
    • Example: Extract all email addresses

20. format - Convert between data formats
    • Purpose: JSON ↔ CSV ↔ XML conversion
    • Config: { format: "json"|"csv"|"xml"|"custom", csvIncludeHeaders: boolean }
    • Use when: Need specific output format
    • Example: Convert JSON to CSV for download

21. string_builder - Construct strings from templates
    • Purpose: Build URLs, messages, formatted text
    • Config: { parts: [{ type: "text"|"field", value: string }] }
    • Use when: Creating dynamic strings
    • Example: Build product URL from ID

22. url_builder - Construct URLs with query parameters
    • Purpose: Build API URLs with dynamic params
    • Config: { baseUrl: string, pathSegments: string[], queryParams: array }
    • Use when: Calling APIs with dynamic parameters
    • Example: https://api.example.com/products?category=electronics&limit=10

23. lookup - Enrich data from external source
    • Purpose: Fetch additional data per item
    • Config: { source: "api"|"cache", requestUrl: string, extractPath: string }
    • Use when: Need additional data per item
    • Example: Lookup product details by SKU

24. union - Combine multiple arrays
    • Purpose: Merge datasets
    • Config: { strategy: "append"|"merge", deduplicateField: string }
    • Requires: Multiple input connections
    • Use when: Combining results from multiple sources

25. intersect - Find common items between datasets
    • Purpose: Items present in both datasets
    • Config: { compareBy: "field"|"full", field: string, outputFrom: "first"|"second" }
    • Requires: Two input connections
    • Use when: Finding overlap

26. distinct - Get unique values from field
    • Purpose: Extract unique values list
    • Config: { scope: "field"|"full", fields: string[], outputFormat: "array"|"object" }
    • Use when: Need list of categories, tags, etc.
    • Example: Get all unique product categories

27. custom_code - Execute JavaScript
    • Purpose: Custom logic not covered by other nodes
    • Config: { code: string, mode: "map"|"filter"|"reduce", sandbox: boolean }
    • Use when: No built-in node fits the requirement
    • Warning: Use sparingly, prefer built-in nodes

---

OUTPUT NODES (4 types):

28. download - Save data to file
    • Purpose: User downloads results
    • Config: { filename: string, format: "json"|"csv"|"txt" }
    • Use when: User wants to save results
    • Inputs schema: Any array or object

29. file_append - Append to existing file
    • Purpose: Continuous logging
    • Config: { path: string, format: "csv"|"txt", createIfMissing: boolean }
    • Use when: Logging data over time
    • Requires: File System Access API

30. http_post - Send data to API/webhook
    • Purpose: Send results to external service
    • Config: { method: "POST"|"PUT", url: string, headers: array, contentType: "json"|"form" }
    • Use when: Integrating with other services
    • Example: Post to Slack, send to database

31. send_email - Email notification
    • Purpose: Alert user of results/events
    • Config: { recipients: string[] }
    • Use when: User needs notification
    • Note: Opens mailto: link in browser
`.trim();
	}

	/**
	 * Get example pipelines for AI reference
	 * @returns {string} Example pipeline JSON
	 */
	static getExamplePipelines() {
		return `
EXAMPLE 1: Amazon Price Tracker
Intent: "Track Amazon laptop prices daily"

{
  "nodes": [
    {
      "id": "fetch_amazon_page",
      "type": "http_request",
      "title": "Fetch Product Page",
      "summary": "GET https://amazon.com/laptop/B08XYZ",
      "config": {
        "method": "GET",
        "url": "https://amazon.com/laptop/B08XYZ",
        "headers": [
          { "key": "User-Agent", "value": "Mozilla/5.0..." }
        ]
      },
      "inputs": [],
      "outputs": [
        {
          "nodeId": "parse_product_data",
          "outputSchema": {
            "raw_data": "string"
          }
        }
      ]
    },
    {
      "id": "parse_product_data",
      "type": "parse",
      "title": "Extract Price & Title",
      "summary": "Parse HTML to extract price and title",
      "config": {
        "inputField": "raw_data",
        "format": "html",
        "onError": "skip"
      },
      "inputs": [
        {
          "nodeId": "fetch_amazon_page",
          "inputSchema": {
            "raw_data": "string"
          }
        }
      ],
      "outputs": [
        {
          "nodeId": "check_price_drop",
          "outputSchema": {
            "price": "number",
            "title": "string",
            "currency": "string"
          }
        }
      ]
    },
    {
      "id": "check_price_drop",
      "type": "condition",
      "title": "Check if Price Dropped",
      "summary": "If price < previous price",
      "config": {
        "logic": "AND",
        "rules": [
          { "field": "price", "operator": "<", "value": "999" }
        ]
      },
      "inputs": [
        {
          "nodeId": "parse_product_data",
          "inputSchema": {
            "price": "number",
            "title": "string"
          }
        }
      ],
      "outputs": [
        {
          "nodeId": "notify_user",
          "outputSchema": {
            "price": "number",
            "title": "string",
            "priceDropped": "boolean"
          }
        }
      ]
    },
    {
      "id": "notify_user",
      "type": "send_email",
      "title": "Send Price Alert",
      "summary": "Email to user@example.com",
      "config": {
        "recipients": ["user@example.com"]
      },
      "inputs": [
        {
          "nodeId": "check_price_drop",
          "inputSchema": {
            "price": "number",
            "title": "string"
          }
        }
      ],
      "outputs": []
    }
  ],
  "reasoning": "Linear pipeline: Fetch page → Parse data → Check condition → Notify. Uses condition node for branching."
}

---

EXAMPLE 2: LinkedIn Lead Extraction
Intent: "Extract LinkedIn profiles and save as CSV"

{
  "nodes": [
    {
      "id": "manual_upload",
      "type": "manual_input",
      "title": "Upload LinkedIn HTML",
      "summary": "Manual input (1 types)",
      "config": {
        "allowedMimeTypes": ["text/html"],
        "data": ""
      },
      "inputs": [],
      "outputs": [
        {
          "nodeId": "parse_profiles",
          "outputSchema": {
            "raw_html": "string"
          }
        }
      ]
    },
    {
      "id": "parse_profiles",
      "type": "parse",
      "title": "Extract Profile Data",
      "summary": "Parse HTML to extract profiles",
      "config": {
        "inputField": "raw_html",
        "format": "html",
        "onError": "skip"
      },
      "inputs": [
        {
          "nodeId": "manual_upload",
          "inputSchema": {
            "raw_html": "string"
          }
        }
      ],
      "outputs": [
        {
          "nodeId": "extract_emails",
          "outputSchema": {
            "profiles": "array",
            "name": "string",
            "title": "string",
            "company": "string"
          }
        }
      ]
    },
    {
      "id": "extract_emails",
      "type": "ai_processor",
      "title": "AI Extract Emails",
      "summary": "AI: Find or infer email addresses",
      "config": {
        "prompt": "Extract or infer email addresses from name and company domain",
        "inputFormat": "json",
        "outputFormat": "json"
      },
      "inputs": [
        {
          "nodeId": "parse_profiles",
          "inputSchema": {
            "name": "string",
            "title": "string",
            "company": "string"
          }
        }
      ],
      "outputs": [
        {
          "nodeId": "dedupe_leads",
          "outputSchema": {
            "name": "string",
            "email": "string",
            "title": "string",
            "company": "string"
          }
        }
      ]
    },
    {
      "id": "dedupe_leads",
      "type": "deduplicate",
      "title": "Remove Duplicates",
      "summary": "Unique by [email]",
      "config": {
        "scope": "field",
        "fields": ["email"],
        "keep": "first"
      },
      "inputs": [
        {
          "nodeId": "extract_emails",
          "inputSchema": {
            "email": "string",
            "name": "string"
          }
        }
      ],
      "outputs": [
        {
          "nodeId": "download_csv",
          "outputSchema": {
            "email": "string",
            "name": "string",
            "title": "string",
            "company": "string"
          }
        }
      ]
    },
    {
      "id": "download_csv",
      "type": "download",
      "title": "Download Leads",
      "summary": "Download leads.csv",
      "config": {
        "filename": "leads.csv",
        "format": "csv"
      },
      "inputs": [
        {
          "nodeId": "dedupe_leads",
          "inputSchema": {
            "email": "string",
            "name": "string",
            "title": "string",
            "company": "string"
          }
        }
      ],
      "outputs": []
    }
  ],
  "reasoning": "User uploads HTML → Parse profiles → AI extracts emails → Remove duplicates → Download CSV"
}
`.trim();
	}

	/**
	 * Build prompt for generating node summary
	 * @param {Object} node - Node object
	 * @returns {string} Prompt for summary generation
	 */
	static buildSummaryPrompt(node) {
		return `
Generate a brief, human-readable summary for this pipeline node.

NODE TYPE: ${node.type}
NODE TITLE: ${node.title}
CONFIGURATION: ${JSON.stringify(node.config, null, 2)}

RULES:
1. Keep summary under 60 characters
2. Focus on what the node DOES, not how it's configured
3. Include key values (URLs, field names, counts)
4. Be specific and actionable

EXAMPLES:
• Filter node with 3 rules → "PERMIT where (3 rules via AND)"
• HTTP node with URL → "GET https://api.example.com/data"
• Transform node → "5 transformations defined"
• Parse node → "Parse JSON from raw_data"

Return ONLY the summary text (no JSON, no quotes):
`.trim();
	}
}
