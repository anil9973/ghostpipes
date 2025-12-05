# Design Document

## Overview

The GhostPipes execution architecture implements a dual-process system where UI configuration happens in the renderer process and pipeline execution occurs in a Chrome extension service worker. The TurbineEngine orchestrates execution, managing triggers, error recovery, and result storage. This design ensures pipelines run reliably in the background without requiring the UI to be open.

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         UI PROCESS                               │
│                                                                  │
│  Config Classes (/nodes/)                                       │
│  ├── FilterConfig.js         → Define UI forms                  │
│  ├── TransformConfig.js      → Validate input                   │
│  └── [33 more configs]       → Generate summaries               │
│                                                                  │
│  Pipeline Builder UI                                            │
│  └── Visual editor for creating pipelines                       │
│                                                                  │
│  IndexedDB (pipelines store)                                    │
│  └── Persistent pipeline configurations                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    chrome.runtime.sendMessage()
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE WORKER PROCESS                        │
│                                                                  │
│  TurbineEngine (Master Controller)                              │
│  ├── executePipeline()       → Main execution method            │
│  ├── executeNode()           → Single node execution            │
│  └── handleNodeFailure()     → Error recovery                   │
│                                                                  │
│  TriggerManager                                                 │
│  ├── setupSchedule()         → chrome.alarms                    │
│  ├── handleWebhook()         → External requests                │
│  └── watchFile()             → File system observer             │
│                                                                  │
│  ExecutionContext                                               │
│  ├── nodeOutputs: Map        → Store node results               │
│  ├── storage: Map            → Shared data                      │
│  └── metadata: Object        → Execution info                   │
│                                                                  │
│  Executor Classes (/background/execution/nodes/)                │
│  ├── FilterExecutor.js       → Filter data                      │
│  ├── TransformExecutor.js    → Transform data                   │
│  └── [33 more executors]     → Process data                     │
│                                                                  │
│  IndexedDB (executions store)                                   │
│  └── Execution history and results                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Process Separation Rationale

**UI Process (Renderer):**

- Has access to DOM, window, document
- Runs pipeline builder interface
- Handles user interactions
- Stores pipeline configurations

**Service Worker Process:**

- No DOM access (isolated environment)
- Persistent background execution
- Handles scheduled tasks via chrome.alarms
- Executes pipelines independently of UI

This separation ensures:

1. Pipelines run even when UI is closed
2. Execution logic is isolated from UI concerns
3. Service worker can be woken by triggers
4. Security through process isolation

## Components and Interfaces

### 1. TurbineEngine

**Purpose:** Master controller that orchestrates all pipeline execution.

**Key Methods:**

```javascript
class TurbineEngine {
	/**
	 * Execute a pipeline from start to finish
	 * @param {string} pipelineId - Pipeline identifier
	 * @param {Object} triggerData - Trigger information and initial data
	 * @returns {Promise<ExecutionResult>}
	 */
	async executePipeline(pipelineId, triggerData) {
		// 1. Load pipeline from IndexedDB
		// 2. Create ExecutionContext
		// 3. Initialize with trigger data
		// 4. Execute nodes in topological order
		// 5. Handle errors with recovery
		// 6. Store results
		// 7. Send notification
	}

	/**
	 * Execute a single node with retry logic
	 * @param {Object} node - Node configuration
	 * @param {ExecutionContext} context - Runtime context
	 * @returns {Promise<NodeResult>}
	 */
	async executeNode(node, context) {
		// 1. Get executor class
		// 2. Validate inputs
		// 3. Execute with retries
		// 4. Store output
		// 5. Update progress
	}

	/**
	 * Handle node execution failure
	 * @param {Object} node - Failed node
 	 * @param {Error} error - Error object
	 * @param {ExecutionContext} context - Runtime context
	 * @returns {NodeResult}
	 */
	handleNodeFailure(node, error, context) {
		// 1. Check for cached data
		// 2. Check skipOnError flag
		// 3. Throw or return partial result
	}

	/**
	 * Get executor class for node type
	 * @param {string} nodeType - Node type identifier
	 * @returns {Class} Executor class
	 */
	getExecutor(nodeType) {
		// Dynamic import of executor class
	}
}
```

**State Management:**

- Maintains registry of executor classes
- Tracks active executions
- Manages execution queue

### 2. ExecutionContext

**Purpose:** Runtime environment that stores node outputs and shared data during execution.

**Interface:**

```javascript
class ExecutionContext {
	constructor(pipelineId) {
		this.pipelineId = pipelineId;
		this.executionId = crypto.randomUUID();
		this.startedAt = Date.now();
		this.nodeOutputs = new Map();
		this.storage = new Map();
		this.metadata = {
			trigger: null,
			variables: {},
			errors: [],
		};
	}

	/**
	 * Store output from a node
	 * @param {string} nodeId - Node identifier
	 * @param {any} data - Output data
	 */
	setNodeOutput(nodeId, data) {
		this.nodeOutputs.set(nodeId, data);
	}

	/**
	 * Retrieve output from a node
	 * @param {string} nodeId - Node identifier
	 * @returns {any} Output data or undefined
	 */
	getNodeOutput(nodeId) {
		return this.nodeOutputs.get(nodeId);
	}

	/**
	 * Get input data for current node
	 * @param {Object} node - Node configuration with inputs array
	 * @returns {any} Input data (null, single value, or array)
	 */
	getInputData(node) {
		if (node.inputs.length === 0) return null;
		if (node.inputs.length === 1) {
			return this.getNodeOutput(node.inputs[0].nodeId);
		}
		return node.inputs.map((input) => ({
			nodeId: input.nodeId,
			data: this.getNodeOutput(input.nodeId),
		}));
	}

	/**
	 * Clear node output to free memory
	 * @param {string} nodeId - Node identifier
	 */
	clearNodeOutput(nodeId) {
		this.nodeOutputs.delete(nodeId);
	}

	/**
	 * Store shared data accessible to all nodes
	 * @param {string} key - Storage key
	 * @param {any} value - Value to store
	 */
	setShared(key, value) {
		this.storage.set(key, value);
	}

	/**
	 * Retrieve shared data
	 * @param {string} key - Storage key
	 * @returns {any} Stored value or undefined
	 */
	getShared(key) {
		return this.storage.get(key);
	}
}
```

### 3. TriggerManager

**Purpose:** Handle all trigger types and schedule pipeline executions.

**Interface:**

```javascript
class TriggerManager {
	/**
	 * Setup schedule trigger using chrome.alarms
	 * @param {string} pipelineId - Pipeline identifier
	 * @param {Object} schedule - Schedule configuration
	 */
	async setupSchedule(pipelineId, schedule) {
		const alarmName = `pipeline_${pipelineId}`;
		await chrome.alarms.create(alarmName, {
			when: schedule.startTime,
			periodInMinutes: schedule.intervalMinutes,
		});
	}

	/**
	 * Handle manual trigger from UI
	 * @param {Object} message - Message from UI
	 */
	handleManualTrigger(message) {
		turbineEngine.executePipeline(message.pipelineId, {
			trigger: "manual",
			data: message.inputData,
		});
	}

	/**
	 * Handle webhook trigger
	 * @param {string} webhookId - Webhook identifier
	 * @param {Object} payload - Webhook payload
	 */
	async handleWebhook(webhookId, payload) {
		const pipeline = await this.findPipelineByWebhook(webhookId);
		turbineEngine.executePipeline(pipeline.id, {
			trigger: "webhook",
			data: payload,
		});
	}

	/**
	 * Setup file watch trigger
	 * @param {string} pipelineId - Pipeline identifier
	 * @param {FileSystemHandle} fileHandle - File to watch
	 */
	async watchFile(pipelineId, fileHandle) {
		// Use File System Observer API when available
		const observer = new FileSystemObserver(async (records) => {
			for (const record of records) {
				const file = await record.root.getFile();
				const content = await file.text();
				turbineEngine.executePipeline(pipelineId, {
					trigger: "file_watch",
					data: content,
					filename: file.name,
				});
			}
		});
		await observer.observe(fileHandle);
	}
}
```

### 4. BaseExecutor

**Purpose:** Abstract base class for all node executors.

**Interface:**

```javascript
class BaseExecutor {
	/**
	 * Execute node logic
	 * @param {any} input - Input data from previous nodes
	 * @param {Object} config - Node configuration
	 * @param {ExecutionContext} context - Runtime context
	 * @returns {Promise<any>} Output data
	 */
	async execute(input, config, context) {
		throw new Error("execute() must be implemented by subclass");
	}

	/**
	 * Validate node configuration
	 * @param {Object} config - Node configuration
	 * @returns {Array<string>} Array of error messages
	 */
	validate(config) {
		return [];
	}

	/**
	 * Determine if error should trigger retry
	 * @param {Error} error - Error object
	 * @returns {boolean} True if should retry
	 */
	shouldRetry(error) {
		// Network errors, timeouts -> retry
		// Validation errors, logic errors -> don't retry
		return error.name === "NetworkError" || error.name === "TimeoutError";
	}
}
```

### 5. OutputHandler

**Purpose:** Handle all output node types (download, HTTP, email, file).

**Interface:**

```javascript
class OutputHandler {
	/**
	 * Handle download output
	 * @param {any} data - Data to download
	 * @param {Object} config - Download configuration
	 */
	async handleDownload(data, config) {
		const content = this.formatData(data, config.format);
		const base64 = this.toBase64(content);
		const dataUrl = `data:${config.mimeType};base64,${base64}`;

		await chrome.downloads.download({
			url: dataUrl,
			filename: config.filename,
			saveAs: config.saveAs || false,
		});
	}

	/**
	 * Handle HTTP POST output
	 * @param {any} data - Data to send
	 * @param {Object} config - HTTP configuration
	 */
	async handleHttpPost(data, config) {
		const response = await fetch(config.url, {
			method: config.method || "POST",
			headers: config.headers || {},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		return await response.json();
	}

	/**
	 * Handle email output
	 * @param {any} data - Data to include in email
	 * @param {Object} config - Email configuration
	 */
	async handleEmail(data, config) {
		const body = this.formatEmailBody(data, config.template);
		const mailtoUrl = `mailto:${config.recipients}?subject=${encodeURIComponent(
			config.subject
		)}&body=${encodeURIComponent(body)}`;

		// Send message to UI to open mailto link
		await chrome.runtime.sendMessage({
			type: "OPEN_MAILTO",
			url: mailtoUrl,
		});
	}

	/**
	 * Handle file append output
	 * @param {any} data - Data to append
	 * @param {Object} config - File configuration
	 */
	async handleFileAppend(data, config) {
		// Use File System Access API
		const fileHandle = await this.getFileHandle(config.filename);
		const writable = await fileHandle.createWritable({ keepExistingData: true });

		// Seek to end
		await writable.seek(await fileHandle.getSize());

		// Write data
		const content = this.formatData(data, config.format);
		await writable.write(content);
		await writable.close();
	}
}
```

## Data Models

### Pipeline Configuration

```javascript
{
  id: "pipe_abc123",
  name: "Daily Price Tracker",
  description: "Track Amazon prices daily",

  nodes: [
    {
      id: "fetch_page",
      type: "http_request",
      position: { x: 100, y: 100 },
      config: {
        url: "https://amazon.com/product",
        method: "GET",
        headers: {}
      },
      inputs: [],
      outputs: ["parse_data"]
    },
    {
      id: "parse_data",
      type: "parse",
      position: { x: 300, y: 100 },
      config: {
        format: "html",
        selector: ".price"
      },
      inputs: [{ nodeId: "fetch_page", outputIndex: 0 }],
      outputs: ["download_csv"]
    }
  ],

  triggers: [
    {
      type: "schedule",
      config: {
        intervalMinutes: 1440,
        startTime: "2025-01-15T09:00:00Z"
      }
    }
  ],

  createdAt: "2025-01-15T08:00:00Z",
  updatedAt: "2025-01-15T08:30:00Z"
}
```

### Execution Result

```javascript
{
  id: "exec_xyz789",
  pipelineId: "pipe_abc123",

  status: "success", // success | failed | partial

  startedAt: "2025-01-15T09:00:00Z",
  completedAt: "2025-01-15T09:00:15Z",
  duration: 15000,

  trigger: {
    type: "schedule",
    timestamp: "2025-01-15T09:00:00Z"
  },

  nodeResults: {
    "fetch_page": {
      success: true,
      duration: 3420,
      outputSize: 45678,
      cached: false
    },
    "parse_data": {
      success: true,
      duration: 234,
      outputSize: 1234,
      cached: false
    },
    "download_csv": {
      success: true,
      duration: 156,
      outputSize: 5678,
      cached: false
    }
  },

  finalOutput: {
    nodeId: "download_csv",
    data: { filename: "prices.csv", size: 5678 },
    size: 5678
  },

  errors: []
}
```

### Node Result

```javascript
{
  success: true,
  duration: 1234,
  outputSize: 5678,
  cached: false,
  error: null,
  skipped: false,
  retries: 0
}
```

## Error Handling

### Error Recovery Flow

```
Node Execution Fails
        ↓
  Retry Attempt 1
  (wait 1 second)
        ↓
  Retry Attempt 2
  (wait 2 seconds)
        ↓
  Retry Attempt 3
  (wait 4 seconds)
        ↓
  All Retries Failed
        ↓
    ┌───┴───┐
    ↓       ↓
Cached?  Skip?
    ↓       ↓
  Use    Continue
 Cache   Pipeline
    ↓       ↓
    └───┬───┘
        ↓
   Stop Pipeline
   (throw error)
```

### Error Types

**Retryable Errors:**

- NetworkError (connection issues)
- TimeoutError (request timeout)
- RateLimitError (429 responses)

**Non-Retryable Errors:**

- ValidationError (invalid config)
- ParseError (malformed data)
- AuthenticationError (401/403)

### Error Recovery Strategies

1. **Retry with Exponential Backoff**

   - Attempt 1: immediate
   - Attempt 2: wait 1 second
   - Attempt 3: wait 2 seconds
   - Attempt 4: wait 4 seconds

2. **Use Cached Data**

   - Check if previous successful output exists
   - Use cached data if fresh enough
   - Mark node result as cached

3. **Skip Node**

   - If node has `skipOnError: true`
   - Continue pipeline with null output
   - Log error for debugging

4. **Fail Pipeline**
   - If no recovery possible
   - Store partial results
   - Send error notification

## Testing Strategy

### Unit Tests

**Test Coverage:**

- Each executor class (35 executors)
- TurbineEngine methods
- ExecutionContext methods
- TriggerManager methods
- OutputHandler methods
- Error recovery logic

**Example Test:**

```javascript
describe("FilterExecutor", () => {
	test("filters items by single rule", async () => {
		const executor = new FilterExecutor();
		const input = [
			{ name: "A", price: 100 },
			{ name: "B", price: 25 },
		];
		const config = {
			mode: "permit",
			matchType: "all",
			rules: [{ field: "price", operator: ">", value: 50 }],
		};

		const output = await executor.execute(input, config, mockContext);

		expect(output).toHaveLength(1);
		expect(output[0].name).toBe("A");
	});
});
```

### Integration Tests

**Test Scenarios:**

- Full pipeline execution (3+ nodes)
- Error recovery with retries
- Cached data usage
- Parallel node execution
- Trigger handling (manual, schedule, webhook)
- Output handling (download, HTTP, email)

**Example Test:**

```javascript
describe("Pipeline Execution", () => {
	test("executes multi-node pipeline successfully", async () => {
		const pipeline = {
			nodes: [
				{ id: "n1", type: "manual_input", config: { data: testData } },
				{ id: "n2", type: "filter", config: filterConfig },
				{ id: "n3", type: "download", config: downloadConfig },
			],
		};

		const result = await turbineEngine.executePipeline(pipeline.id, {
			trigger: "manual",
			data: testData,
		});

		expect(result.status).toBe("success");
		expect(result.nodeResults.n1.success).toBe(true);
		expect(result.nodeResults.n2.success).toBe(true);
		expect(result.nodeResults.n3.success).toBe(true);
	});
});
```

### Performance Tests

**Metrics to Track:**

- Execution time per node type
- Memory usage during execution
- Cache hit rate
- Parallel execution speedup
- Error recovery overhead

## Security Considerations

### Sandboxing Custom Code

```javascript
class CustomCodeExecutor extends BaseExecutor {
	async execute(input, config, context) {
		// Create isolated context
		const sandbox = {
			input: structuredClone(input),
			console: {
				log: (...args) => this.log("info", ...args),
				error: (...args) => this.log("error", ...args),
			},
		};

		// No access to chrome APIs, window, document
		const fn = new Function(
			"sandbox",
			`
      with (sandbox) {
        ${config.code}
      }
    `
		);

		// Execute with timeout
		const timeoutPromise = new Promise((_, reject) =>
			setTimeout(() => reject(new Error("Execution timeout")), 30000)
		);

		return Promise.race([fn(sandbox), timeoutPromise]);
	}
}
```

### Input Validation

```javascript
class DataValidator {
	static validate(data, schema) {
		// Validate data structure
		if (schema.type === "array" && !Array.isArray(data)) {
			throw new ValidationError("Expected array");
		}

		// Validate required fields
		for (const field of schema.required || []) {
			if (!(field in data)) {
				throw new ValidationError(`Missing required field: ${field}`);
			}
		}

		// Sanitize strings
		if (typeof data === "string") {
			data = this.sanitizeString(data);
		}

		return data;
	}

	static sanitizeString(str) {
		// Remove script tags
		str = str.replace(/<script[^>]*>.*?<\/script>/gi, "");

		// Escape HTML entities
		str = str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

		return str;
	}
}
```

### Rate Limiting

```javascript
class RateLimiter {
	constructor(maxRequests = 60, windowMs = 60000) {
		this.maxRequests = maxRequests;
		this.windowMs = windowMs;
		this.requests = new Map();
	}

	async checkLimit(key) {
		const now = Date.now();
		const requests = this.requests.get(key) || [];

		// Remove old requests outside window
		const validRequests = requests.filter((time) => now - time < this.windowMs);

		if (validRequests.length >= this.maxRequests) {
			const oldestRequest = Math.min(...validRequests);
			const waitTime = this.windowMs - (now - oldestRequest);
			throw new RateLimitError(`Rate limit exceeded. Wait ${waitTime}ms`);
		}

		validRequests.push(now);
		this.requests.set(key, validRequests);
	}
}
```

## Performance Optimizations

### Caching Strategy

```javascript
class CacheManager {
	constructor() {
		this.cache = new Map();
	}

	async get(key) {
		const entry = this.cache.get(key);
		if (!entry) return null;

		// Check expiration
		if (Date.now() > entry.expiresAt) {
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	async set(key, data, ttl = 300000) {
		this.cache.set(key, {
			data: structuredClone(data),
			expiresAt: Date.now() + ttl,
		});
	}

	clear() {
		this.cache.clear();
	}
}
```

### Parallel Execution

```javascript
class TurbineEngine {
	async executeParallelNodes(nodes, context) {
		// Find nodes with no dependencies between them
		const independentGroups = this.findIndependentGroups(nodes);

		for (const group of independentGroups) {
			// Execute group in parallel
			await Promise.all(group.map((node) => this.executeNode(node, context)));
		}
	}

	findIndependentGroups(nodes) {
		// Group nodes by execution level
		const levels = new Map();

		for (const node of nodes) {
			const level = this.calculateNodeLevel(node, nodes);
			if (!levels.has(level)) {
				levels.set(level, []);
			}
			levels.get(level).push(node);
		}

		return Array.from(levels.values());
	}
}
```

### Memory Management

```javascript
class ExecutionContext {
	clearUnusedOutputs(currentNodeId, pipeline) {
		// Find nodes that won't be used again
		const remainingNodes = this.getRemainingNodes(currentNodeId, pipeline);
		const requiredInputs = new Set(remainingNodes.flatMap((n) => n.inputs.map((i) => i.nodeId)));

		// Clear outputs not needed anymore
		for (const [nodeId] of this.nodeOutputs) {
			if (!requiredInputs.has(nodeId)) {
				this.clearNodeOutput(nodeId);
			}
		}
	}
}
```
