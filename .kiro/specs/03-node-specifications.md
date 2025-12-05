# Node Specifications

## Node Design Principles

1. **Single Responsibility**: Each node does ONE thing well
2. **Predictable I/O**: Clear input/output contracts
3. **Fail-Safe**: Errors should be catchable and recoverable
4. **Configurable**: UI should expose all options clearly
5. **Testable**: Must work with sample data

## Node Base Class

```javascript
/**
 * Base class for all pipeline nodes
 */
class PipelineNode {
	constructor(id, config) {
		this.id = id;
		this.type = this.constructor.TYPE;
		this.config = config;
		this.errors = [];
	}

	/**
	 * Execute node logic
	 * @param {any} input - Data from previous node
	 * @returns {Promise<any>} Transformed data
	 */
	async execute(input) {
		throw new Error("Must implement execute()");
	}

	/**
	 * Validate node configuration
	 * @returns {Array<string>} Validation errors
	 */
	validate() {
		return [];
	}

	/**
	 * Get node metadata for UI rendering
	 * @returns {Object} Node metadata
	 */
	static getMetadata() {
		return {
			type: this.TYPE,
			name: this.NAME,
			description: this.DESCRIPTION,
			category: this.CATEGORY,
			icon: this.ICON,
			inputs: this.INPUTS,
			outputs: this.OUTPUTS,
		};
	}
}
```

---

## INPUT NODES (4 nodes)

### 1. Manual Input Node

**Purpose**: User provides data directly (file upload, text paste)

```javascript
class ManualInputNode extends HTMLElement {
	static TYPE = "manual_input";
	static NAME = "Manual Input";
	static DESCRIPTION = "Upload file or paste data";
	static CATEGORY = "input";
	static ICON = "📥";
	static INPUTS = 0;
	static OUTPUTS = 1;

	/**
	 * Config Schema:
	 * {
	 *   dataType: 'text' | 'file' | 'json',
	 *   data: string | File | object
	 * }
	 */

	async execute() {
		const { dataType, data } = this.config;

		if (dataType === "file") {
			return await this.parseFile(data);
		}

		if (dataType === "json") {
			return JSON.parse(data);
		}

		return data; // Plain text
	}

	async parseFile(file) {
		if (file.type === "text/csv") {
			return await this.parseCSV(file);
		}
		// Handle other file types
	}
}
```

**UI Controls**:

```html
<div class="node-config">
	<label>
		Data Type:
		<select name="dataType">
			<option value="text">Text</option>
			<option value="file">File Upload</option>
			<option value="json">JSON</option>
		</select>
	</label>

	<label>
		Data:
		<textarea name="data" placeholder="Paste data here..."></textarea>
		<!-- OR -->
		<input type="file" name="fileUpload" />
	</label>
</div>
```

---

### 2. HTTP Request Node

**Purpose**: Fetch data from URL

```javascript
class HttpRequestNode extends HTMLElement {
	static TYPE = "http_request";
	static NAME = "HTTP Request";
	static DESCRIPTION = "Fetch data from a URL";
	static CATEGORY = "input";
	static ICON = "🌐";
	static INPUTS = 0;
	static OUTPUTS = 1;

	/**
	 * Config Schema:
	 * {
	 *   url: string,
	 *   method: 'GET' | 'POST',
	 *   headers: Object,
	 *   body: string,
	 *   timeout: number (ms),
	 *   schedule: 'once' | 'interval',
	 *   intervalMs: number
	 * }
	 */

	async execute() {
		const { url, method, headers, body, timeout } = this.config;

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout || 5000);

		try {
			const response = await fetch(url, {
				method,
				headers,
				body: method === "POST" ? body : undefined,
				signal: controller.signal,
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const contentType = response.headers.get("content-type");

			if (contentType?.includes("application/json")) {
				return await response.json();
			}

			return await response.text();
		} finally {
			clearTimeout(timeoutId);
		}
	}
}
```

**UI Controls**:

```html
<div class="node-config">
	<label>
		URL:
		<input type="url" name="url" required />
	</label>

	<label>
		Method:
		<select name="method">
			<option value="GET">GET</option>
			<option value="POST">POST</option>
		</select>
	</label>

	<label>
		Headers (JSON):
		<textarea name="headers">{"User-Agent": "GhostPipes/1.0"}</textarea>
	</label>

	<label>
		Timeout (ms):
		<input type="number" name="timeout" value="5000" />
	</label>
</div>
```

---

### 3. Webhook Node

**Purpose**: Receive data from external POST requests

```javascript
class WebhookNode extends HTMLElement {
	static TYPE = "webhook";
	static NAME = "Webhook";
	static DESCRIPTION = "Receive data via HTTP POST";
	static CATEGORY = "input";
	static ICON = "📨";
	static INPUTS = 0;
	static OUTPUTS = 1;

	/**
	 * Config Schema:
	 * {
	 *   webhookId: string (auto-generated),
	 *   secret: string (for validation),
	 *   url: string (generated: chrome-extension://xxx/webhook/abc123)
	 * }
	 */

	async execute(request) {
		// Validate secret
		if (request.headers["x-webhook-secret"] !== this.config.secret) {
			throw new Error("Invalid webhook secret");
		}

		return request.body;
	}
}
```

**Implementation Note**:
Extension creates local endpoint using chrome.runtime.onMessageExternal listener

---

### 4. File Watch Node

**Purpose**: Monitor file changes using File System Observer API

```javascript
class FileWatchNode extends HTMLElement {
	static TYPE = "file_watch";
	static NAME = "File Watcher";
	static DESCRIPTION = "Monitor file changes";
	static CATEGORY = "input";
	static ICON = "👁️";
	static INPUTS = 0;
	static OUTPUTS = 1;

	/**
	 * Config Schema:
	 * {
	 *   fileHandle: FileSystemFileHandle,
	 *   watchType: 'modified' | 'created' | 'deleted'
	 * }
	 */

	async execute() {
		const { fileHandle, watchType } = this.config;

		// Use File System Observer API
		const observer = new FileSystemObserver(async (records) => {
			for (const record of records) {
				if (record.type === watchType) {
					const file = await record.root.getFile();
					const content = await file.text();
					return content;
				}
			}
		});

		await observer.observe(fileHandle);
	}
}
```

---

## PROCESSING NODES (23 nodes)

### 5. Filter Node

**Purpose**: Keep only items matching conditions

```javascript
class FilterNode extends HTMLElement {
	static TYPE = "filter";
	static NAME = "Filter";
	static DESCRIPTION = "Keep items matching conditions";
	static CATEGORY = "processing";
	static ICON = "🕸️";
	static INPUTS = 1;
	static OUTPUTS = 1;

	/**
	 * Config Schema:
	 * {
	 *   mode: 'block' | 'permit',
	 *   matchType: 'all' | 'any',
	 *   rules: [
	 *     { field: string, operator: string, value: any }
	 *   ]
	 * }
	 */

	async execute(input) {
		const { mode, matchType, rules } = this.config;

		if (!Array.isArray(input)) {
			throw new Error("Filter requires array input");
		}

		return input.filter((item) => {
			const matches = rules.map((rule) => this.evaluateRule(item, rule));
			const pass = matchType === "all" ? matches.every((m) => m) : matches.some((m) => m);

			return mode === "permit" ? pass : !pass;
		});
	}

	evaluateRule(item, rule) {
		const value = this.getFieldValue(item, rule.field);

		switch (rule.operator) {
			case "==":
				return value == rule.value;
			case "!=":
				return value != rule.value;
			case ">":
				return value > rule.value;
			case "<":
				return value < rule.value;
			case "contains":
				return String(value).includes(rule.value);
			case "matches":
				return new RegExp(rule.value).test(value);
			default:
				return false;
		}
	}
}
```

**UI Controls**:

```html
<div class="node-config">
	<label>
		<select name="mode">
			<option value="block">Block</option>
			<option value="permit">Permit</option>
		</select>
		items that match
		<select name="matchType">
			<option value="all">all</option>
			<option value="any">any</option>
		</select>
		of the following:
	</label>

	<div class="rules">
		<div class="rule">
			<select name="field">
				<option>item.price</option>
				<option>item.name</option>
			</select>
			<select name="operator">
				<option value=">">is greater than</option>
				<option value="<">is less than</option>
				<option value="==">equals</option>
				<option value="contains">contains</option>
			</select>
			<input type="text" name="value" />
			<button class="remove">✕</button>
		</div>
	</div>

	<button class="add-rule">+ Add Rule</button>
</div>
```

---

### 6. Transform Node

**Purpose**: Change data structure/format

```javascript
class TransformNode extends HTMLElement {
	static TYPE = "transform";
	static NAME = "Transform";
	static DESCRIPTION = "Change data structure";
	static CATEGORY = "processing";
	static ICON = "🔄";
	static INPUTS = 1;
	static OUTPUTS = 1;

	/**
	 * Config Schema:
	 * {
	 *   mapping: {
	 *     newField: 'oldField' | '{{template}}'
	 *   }
	 * }
	 */

	async execute(input) {
		const { mapping } = this.config;

		if (Array.isArray(input)) {
			return input.map((item) => this.transformItem(item, mapping));
		}

		return this.transformItem(input, mapping);
	}

	transformItem(item, mapping) {
		const result = {};

		for (const [newKey, template] of Object.entries(mapping)) {
			result[newKey] = this.evaluateTemplate(template, item);
		}

		return result;
	}

	evaluateTemplate(template, context) {
		// Simple template engine: {{field}} or {{field.nested}}
		return template.replace(/\{\{(.+?)\}\}/g, (_, path) => {
			return this.getFieldValue(context, path);
		});
	}
}
```

---

### 7. AI Processor Node

**Purpose**: Use AI for transformation/extraction

```javascript
class AIProcessorNode extends HTMLElement {
	static TYPE = "ai_processor";
	static NAME = "AI Processor";
	static DESCRIPTION = "Transform data using AI";
	static CATEGORY = "processing";
	static ICON = "🔮";
	static INPUTS = 1;
	static OUTPUTS = 1;

	/**
	 * Config Schema:
	 * {
	 *   task: 'extract' | 'transform' | 'enrich',
	 *   prompt: string,
	 *   outputSchema: Object
	 * }
	 */

	async execute(input) {
		const { task, prompt, outputSchema } = this.config;

		const fullPrompt = `
Task: ${task}
Input Data: ${JSON.stringify(input)}
Instructions: ${prompt}
Expected Output Schema: ${JSON.stringify(outputSchema)}

Return ONLY valid JSON matching the schema.
    `.trim();

		const response = await fetch("https://api.anthropic.com/v1/messages", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				model: "claude-sonnet-4-20250514",
				max_tokens: 1000,
				messages: [{ role: "user", content: fullPrompt }],
			}),
		});

		const data = await response.json();
		return JSON.parse(data.content[0].text);
	}
}
```

---

### 8-31. Additional Processing Nodes (Brief Specs)

I'll provide concise specs for the remaining 23 nodes:

**8. Deduplicate Node**

- Remove duplicate items based on key field
- Config: `{ key: 'id' }`

**9. Validate Node**

- Check data against schema
- Config: `{ schema: JsonSchema, onError: 'skip'|'fail' }`

**10. Join Node**

- Merge two datasets
- Config: `{ leftKey: 'id', rightKey: 'userId', type: 'inner'|'left' }`

**11. Split Node**

- Divide array into chunks
- Config: `{ chunkSize: 10 }` OR `{ splitBy: 'category' }`

**12. Loop Node**

- Iterate over items
- Config: `{ itemName: 'item', subPipeline: [...nodes] }`

**13. Aggregate Node**

- Calculate stats
- Config: `{ operations: [{ field: 'price', op: 'SUM'|'AVG'|'MAX' }] }`

**14. Condition Node (If/Else)**

- Branch based on condition
- Config: `{ condition: '{{price}} > 100', trueOutput: 'node_x', falseOutput: 'node_y' }`

**15. Switch Node**

- Multiple branches
- Config: `{ field: 'category', cases: { electronics: 'node_1', books: 'node_2' } }`

**16. Until Node**

- Loop until condition met
- Config: `{ condition: '{{count}} >= 100', maxIterations: 50 }`

**17. Parse Node**

- Extract from HTML/CSV/JSON/XML
- Config: `{ format: 'html', selectors: { title: 'h1' } }`

**18. Format Node**

- Convert between formats
- Config: `{ from: 'json', to: 'csv' }`

**19. Regex Node**

- Pattern matching/extraction
- Config: `{ pattern: '\\d{3}-\\d{4}', extract: 'all' }`

**20. Union Node**

- Combine arrays (duplicates allowed)
- Config: `{ sources: ['input1', 'input2'] }`

**21. Intersect Node**

- Keep common items
- Config: `{ compareBy: 'id' }`

**22. Distinct Node**

- Remove all duplicates
- Config: `{ by: 'email' }`

**23. Web Search Node**

- Search using API
- Config: `{ query: '{{brand}} reviews', maxResults: 10 }`

**24. Lookup Node**

- Reference external data
- Config: `{ table: 'products', key: 'sku', return: 'price' }`

**25. Rate Limit Node**

- Throttle execution
- Config: `{ maxPerSecond: 5, delayMs: 200 }`

**26. Batch Node**

- Group items for batch processing
- Config: `{ batchSize: 50 }`

**27. Cache Node**

- Store intermediate results
- Config: `{ ttl: 3600, key: '{{url}}' }`

**28. Custom Code Node**

- Write JavaScript
- Config: `{ code: 'function(input) { return input.map(...) }' }`

**29. String Operations Node**

- Substring, concat, replace
- Config: `{ operation: 'substring', start: 0, length: 10 }`

**30. Schema Node**

- Define/enforce data structure
- Config: `{ schema: JsonSchema, strict: true }`

**31. Sleep Node**

- Pause execution
- Config: `{ delayMs: 1000 }`

---

## OUTPUT NODES (4 nodes)

### 32. Download Node

```javascript
class DownloadNode extends HTMLElement {
	static TYPE = "download";
	static NAME = "Download";
	static DESCRIPTION = "Save data to file";
	static CATEGORY = "output";
	static ICON = "💾";

	/**
	 * Config: { filename: string, format: 'json'|'csv'|'txt' }
	 */

	async execute(input) {
		const { filename, format } = this.config;

		let content, mimeType;

		switch (format) {
			case "json":
				content = JSON.stringify(input, null, 2);
				mimeType = "application/json";
				break;
			case "csv":
				content = this.toCSV(input);
				mimeType = "text/csv";
				break;
			default:
				content = String(input);
				mimeType = "text/plain";
		}

		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);

		chrome.downloads.download({
			url,
			filename,
			saveAs: true,
		});

		return { downloaded: true, filename };
	}
}
```

### 33. Append File Node

```javascript
class AppendFileNode extends HTMLElement {
	static TYPE = "append_file";
	static NAME = "Append to File";
	static DESCRIPTION = "Add data to existing file";
	static CATEGORY = "output";
	static ICON = "📝";

	/**
	 * Config: { fileHandle: FileSystemFileHandle, format: 'json'|'csv'|'txt' }
	 */

	async execute(input) {
		const { fileHandle, format } = this.config;

		const writable = await fileHandle.createWritable({ keepExistingData: true });

		// Seek to end
		const file = await fileHandle.getFile();
		await writable.seek(file.size);

		// Append data
		const content = this.formatData(input, format);
		await writable.write(content);
		await writable.close();

		return { appended: true, size: content.length };
	}
}
```

### 34. HTTP Post Node

```javascript
class HttpPostNode extends HTMLElement {
	static TYPE = "http_post";
	static NAME = "HTTP POST";
	static DESCRIPTION = "Send data to API";
	static CATEGORY = "output";
	static ICON = "📤";

	/**
	 * Config: { url: string, headers: Object, bodyTemplate: string }
	 */

	async execute(input) {
		const { url, headers, bodyTemplate } = this.config;

		const body = this.evaluateTemplate(bodyTemplate, input);

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...headers,
			},
			body,
		});

		if (!response.ok) {
			throw new Error(`POST failed: ${response.status}`);
		}

		return await response.json();
	}
}
```

### 35. Email Node

```javascript
class EmailNode extends HTMLElement {
	static TYPE = "email";
	static NAME = "Email";
	static DESCRIPTION = "Send email notification";
	static CATEGORY = "output";
	static ICON = "✉️";

	/**
	 * Config: { to: string, subject: string, body: string }
	 */

	async execute(input) {
		// Use mailto: URL (opens default email client)
		const { to, subject, body } = this.config;

		const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

		chrome.tabs.create({ url: mailtoUrl });

		return { sent: true, to };
	}
}
```

---

## Node UI Card Template

```html
<div class="node-card" data-node-id="{{nodeId}}" data-node-type="{{nodeType}}">
	<div class="node-header">
		<span class="node-icon">{{icon}}</span>
		<span class="node-name">{{name}}</span>
		<button class="node-edit" aria-label="Edit node">⚙️</button>
	</div>

	<div class="node-summary">
		<!-- AI-generated summary of config -->
		{{summary}}
	</div>

	<!-- Connection points -->
	<div class="node-input" data-port="input"></div>
	<div class="node-output" data-port="output"></div>

	<!-- Status indicator -->
	<div class="node-status" data-status="{{status}}">
		<!-- idle | running | success | error -->
	</div>
</div>
```

---

## Node Metadata Registry

```javascript
/**
 * Central registry of all available nodes
 */
const NODE_REGISTRY = {
	input: [ManualInputNode, HttpRequestNode, WebhookNode, FileWatchNode],
	processing: [
		FilterNode,
		TransformNode,
		AIProcessorNode,
		// ... 20 more
	],
	output: [DownloadNode, AppendFileNode, HttpPostNode, EmailNode],
};

/**
 * Get node class by type
 */
function getNodeClass(type) {
	for (const category of Object.values(NODE_REGISTRY)) {
		const NodeClass = category.find((n) => n.TYPE === type);
		if (NodeClass) return NodeClass;
	}
	throw new Error(`Unknown node type: ${type}`);
}
```
