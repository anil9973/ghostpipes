# Pipeline Execution - Complete Guide

## Overview

GhostPipes uses a **dual-node system**:

1. **UI Nodes** - Configuration classes for visual editing
2. **Execution Nodes** - Background executors that actually run pipelines

This guide covers the complete execution system.

---

## Architecture Summary

```
UI Process (Renderer)          Service Worker (Background)
─────────────────────          ───────────────────────────

/nodes/FilterConfig     ─────▶  /background/execution/nodes/FilterExecutor
└─ UI form fields              └─ Actual filtering logic
└─ Config validation           └─ Data processing
└─ Summary generation          └─ Error handling

User edits pipeline     ─────▶  TurbineEngine executes pipeline
└─ Saves to IndexedDB          └─ Loads from IndexedDB
                              └─ Runs nodes sequentially
                              └─ Stores results
```

---

## Execution Flow

### 1. Manual Trigger (User Clicks "Run")

```javascript
// UI sends message to service worker
chrome.runtime.sendMessage({
	type: "EXECUTE_PIPELINE",
	pipelineId: "pipe_123",
	inputData: {
		/* user data */
	},
});

// Service worker receives and executes
chrome.runtime.onMessage.addListener((message) => {
	if (message.type === "EXECUTE_PIPELINE") {
		turbineEngine.executePipeline(message.pipelineId, {
			type: "manual",
			data: message.inputData,
		});
	}
});
```

### 2. Schedule Trigger (Automatic)

```javascript
// When saving pipeline with schedule
chrome.runtime.sendMessage({
	type: "SCHEDULE_PIPELINE",
	pipelineId: "pipe_123",
	schedule: {
		type: "recurring",
		frequency: "every_1_day",
		time: "09:00",
	},
});

// Service worker creates alarm
chrome.alarms.create(`pipeline_${pipelineId}`, {
	periodInMinutes: 1440, // 1 day
});

// Alarm fires, pipeline executes
chrome.alarms.onAlarm.addListener((alarm) => {
	if (alarm.name.startsWith("pipeline_")) {
		const pipelineId = alarm.name.replace("pipeline_", "");
		turbineEngine.executePipeline(pipelineId, {
			type: "schedule",
			timestamp: Date.now(),
		});
	}
});
```

### 3. Webhook Trigger (External)

```javascript
// External service calls webhook
POST chrome-extension://[id]/webhook/abc123
{
  "data": { ... }
}

// Service worker receives external message
chrome.runtime.onMessageExternal.addListener((message) => {
  if (message.type === 'WEBHOOK') {
    const pipeline = findPipelineByWebhookId(message.webhookId);
    turbineEngine.executePipeline(pipeline.id, {
      type: 'webhook',
      data: message.payload
    });
  }
});
```

### 4. File Watch Trigger (File Changes)

```javascript
// Setup file watcher
const observer = new FileSystemObserver(async (records) => {
	for (const record of records) {
		const file = await record.root.getFile();
		const content = await file.text();

		turbineEngine.executePipeline(pipelineId, {
			type: "file_watch",
			filename: file.name,
			data: content,
		});
	}
});

await observer.observe(directoryHandle);
```

---

## TurbineEngine Execution Steps

```
1. Load Pipeline from IndexedDB
   ├─ Get pipeline JSON
   ├─ Validate structure
   └─ Check for cycles

2. Create Execution Context
   ├─ Generate execution ID
   ├─ Store trigger info
   └─ Initialize storage

3. Get Execution Order
   ├─ Topological sort
   ├─ Handle dependencies
   └─ Detect cycles

4. Execute Each Node
   ├─ Get executor for node type
   ├─ Get input data from context
   ├─ Execute with timeout
   ├─ Store output in context
   └─ Record timing

5. Handle Errors
   ├─ Retry with backoff (3 attempts)
   ├─ Use cached data if available
   ├─ Skip node if configured
   └─ Stop pipeline if critical

6. Store Results
   ├─ Save execution record
   ├─ Store node timings
   ├─ Log errors/warnings
   └─ Calculate stats

7. Send Notification
   ├─ Success: "Pipeline completed"
   └─ Failure: "Pipeline failed: [error]"
```

---

## Node Executor Examples

### Input Executor

```javascript
export class HttpRequestExecutor extends BaseExecutor {
	async execute(input, config, context) {
		const { method, url, headers } = config;

		const response = await fetch(url, {
			method,
			headers: this.buildHeaders(headers),
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		return await response.json();
	}
}
```

### Processing Executor

```javascript
export class FilterExecutor extends BaseExecutor {
	async execute(input, config, context) {
		const { mode, rules } = config;
		const items = this.ensureArray(input);

		return items.filter((item) => {
			const matches = rules.map((rule) => this.evaluateRule(item, rule));

			const pass = matches.every((m) => m);
			return mode === "permit" ? pass : !pass;
		});
	}

	evaluateRule(item, rule) {
		const value = this.getFieldValue(item, rule.field);
		// Compare value with rule.operator and rule.value
		return /* comparison result */;
	}
}
```

### Output Executor

```javascript
export class DownloadExecutor extends BaseExecutor {
	async execute(input, config, context) {
		const { filename, format } = config;

		let content = format === "json" ? JSON.stringify(input, null, 2) : this.toCSV(input);

		function toBase64(str) {
			return btoa(new TextEncoder().encode(str).reduce((d, b) => d + String.fromCharCode(b), ""));
		}

		function downloadText(filename, content) {
			const base64 = toBase64(content);
			const dataUrl = `data:text/plain;base64,${base64}`;

			chrome.downloads.download({
				url: dataUrl,
				filename,
				saveAs: false,
			});
		}
	}
}
```

---

## ExecutionContext Usage

```javascript
// Create context
const context = new ExecutionContext(pipelineId, {
	type: "manual",
	data: inputData,
});

// Store node output
context.setNodeOutput("node_1", { result: [1, 2, 3] });

// Get input for next node
const input = context.getInputData(node_2);
// Returns output from node_1

// Store shared data
context.setStorage("lastPrice", 99.99);

// Get shared data
const lastPrice = context.getStorage("lastPrice");

// Add error
context.addError("node_3", error, "retried_3_times");

// Get execution summary
const summary = context.getSummary();
```

---

## Error Recovery Strategies

### 1. Retry with Exponential Backoff

```javascript
async handleNodeFailure(node, error, context) {
  if (this.shouldRetry(error)) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      await this.delay(1000 * Math.pow(2, attempt - 1));

      try {
        await this.executeNode(node, context);
        return true; // Recovered
      } catch (retryError) {
        // Continue to next attempt
      }
    }
  }

  // All retries failed, try next strategy
  return this.tryNextStrategy(node, error, context);
}
```

### 2. Use Cached Data

```javascript
if (node.config.useCachedOnError) {
	const cached = context.getStorage(`cache_${node.id}`);
	if (cached) {
		context.setNodeOutput(node.id, cached);
		context.addWarning(node.id, "Using cached data");
		return true; // Recovered
	}
}
```

### 3. Skip Node

```javascript
if (node.config.skipOnError) {
	context.setNodeOutput(node.id, null);
	context.addError(node.id, error, "skipped");
	return true; // Continue pipeline
}
```

### 4. Stop Pipeline

```javascript
context.addError(node.id, error, "pipeline_stopped");
return false; // Stop execution
```

---

## Output Handling

### Download (chrome.downloads API)

```javascript
// Executor stores data
function toBase64(str) {
	return btoa(new TextEncoder().encode(str).reduce((d, b) => d + String.fromCharCode(b), ""));
}

function downloadText(filename, content) {
	const base64 = toBase64(content);
	const dataUrl = `data:text/plain;base64,${base64}`;

	chrome.downloads.download({
		url: dataUrl,
		filename,
		saveAs: false,
	});
}
```

### HTTP POST

```javascript
// Direct fetch from service worker
await fetch(config.url, {
	method: "POST",
	headers: config.headers,
	body: JSON.stringify(output),
});
```

### Email

```javascript
// Store data for UI to handle
context.setStorage("email_pending", {
	to: config.recipients,
	subject: "Pipeline Results",
	body: JSON.stringify(output),
});

// Service worker sends message to UI
chrome.tabs.create({
	url: `mailto:${to}?subject=${subject}&body=${body}`,
});
```

---

## Scheduling Examples

### One-Time Execution

```javascript
chrome.runtime.sendMessage({
	type: "SCHEDULE_PIPELINE",
	pipelineId: "pipe_123",
	schedule: {
		type: "once",
		dateTime: "2025-01-15T14:30:00Z",
	},
});
```

### Recurring Execution

```javascript
chrome.runtime.sendMessage({
	type: "SCHEDULE_PIPELINE",
	pipelineId: "pipe_123",
	schedule: {
		type: "recurring",
		frequency: "every_1_day",
		time: "09:00",
	},
});
```

### Unschedule

```javascript
chrome.runtime.sendMessage({
	type: "UNSCHEDULE_PIPELINE",
	pipelineId: "pipe_123",
});
```

---

## Performance Optimization

### Caching Strategy

```javascript
// Cache HTTP responses
const cacheKey = `http_${url}`;
const cached = context.getStorage(cacheKey);

if (cached && !cached.expired) {
	return cached.data;
}

const data = await fetch(url);
context.setStorage(cacheKey, {
	data,
	expires: Date.now() + 300000, // 5 min
});
```

### Parallel Execution (Future)

```javascript
// Find independent nodes
const independentNodes = this.findIndependentNodes(nodes);

// Execute in parallel
await Promise.all(independentNodes.map((node) => this.executeNode(node, context)));
```

### Memory Management

```javascript
// Clear large outputs after use
context.clearNodeOutput("large_data_node");

// Use streaming for large files (future)
const stream = await file.stream();
```

---

## Debugging

### Execution Logs

```javascript
// Enable detailed logging
chrome.storage.local.set({ ghostpipes_debug: true });

// Logs appear in service worker console
console.log("[TurbineEngine] Executing node: filter_1");
console.log("[TurbineEngine] Input size: 1.5 KB");
console.log("[TurbineEngine] Duration: 234ms");
```

### Execution History

```javascript
// Get all executions for pipeline
const db = new IndexedDBManager();
const executions = await db.queryByIndex("executions", "pipelineId", "pipe_123");

// View execution details
executions.forEach((exec) => {
	console.log("Status:", exec.status);
	console.log("Duration:", exec.duration);
	console.log("Errors:", exec.errors);
	console.log("Node timings:", exec.nodeResults);
});
```

---

## Testing

### Test Single Executor

```javascript
import { FilterExecutor } from "./FilterExecutor.js";

const executor = new FilterExecutor();
const input = [
	{ price: 100, name: "A" },
	{ price: 50, name: "B" },
];

const config = {
	mode: "permit",
	matchType: "all",
	rules: [{ field: "price", operator: ">", value: 75 }],
};

const output = await executor.execute(input, config, context);
// Output: [{ price: 100, name: 'A' }]
```

### Test Complete Pipeline

```javascript
const result = await turbineEngine.executePipeline("pipe_123", {
	type: "manual",
	data: testData,
});

assert(result.status === "success");
assert(result.nodeResults["filter_1"].success === true);
```

---

## Manifest Configuration

```json
{
	"manifest_version": 3,
	"name": "GhostPipes",
	"version": "1.0.0",

	"background": {
		"service_worker": "background/background.js",
		"type": "module"
	},

	"permissions": ["alarms", "notifications", "storage", "downloads", "offscreen"],

	"host_permissions": ["http://*/*", "https://*/*"]
}
```

---

## Common Issues & Solutions

### Issue: Service worker terminated during long execution

**Solution**: Service workers auto-terminate after ~30 seconds of inactivity

- Keep execution under 30 seconds per node
- Use `chrome.runtime.getPlatformInfo()` to keep alive
- Split long operations into chunks

---

## Summary

The execution system is completely separate from UI:

✅ **UI Nodes** → Config + Validation + Display
✅ **Execution Nodes** → Actual logic + Processing
✅ **TurbineEngine** → Master controller
✅ **TriggerManager** → Handle all triggers
✅ **ExecutionContext** → Runtime state
✅ **Service Worker** → Background process

All 35 executors are implemented and ready to process pipelines! 🎉
