# Project Steering: Development Rules

## Code Organization Principles

### 1. File Structure Rules

- **One class per file** (except tiny helpers)
- **Maximum file size**: 300 lines (split if larger)
- **Naming convention**: PascalCase for classes, kebab-case for files
  - ✅ `HttpRequestNode.js` (class) → `http-request-node.js` (file)
  - ✅ `PipelineRunner.js` (class) → `pipeline-runner.js` (file)

### 3. Dependency Rules

- **Core never imports UI**
- **UI can import Core**
- **Nodes are self-contained** (no cross-imports between nodes)
- **Use dependency injection** for testability

---

## JavaScript Standards

### 1. Modern JavaScript Only

```javascript
// ✅ Use
const data = await fetch(url);
const filtered = items.filter((x) => x.active);
const { name, age } = person;

// ❌ Avoid
var data; // No var, use const/let
items.forEach(function (x) {}); // Use arrow functions
```

### 2. JSDoc for Type Safety

```javascript
/**
 * Execute pipeline with error recovery
 * @param {Object} pipeline - Pipeline configuration
 * @param {string} pipeline.id - Unique identifier
 * @param {Array<Node>} pipeline.nodes - Pipeline nodes
 * @param {Object} [options] - Execution options
 * @param {boolean} [options.dryRun=false] - Test mode
 * @returns {Promise<ExecutionResult>} Result object
 * @throws {PipelineExecutionError} If pipeline fails
 */
async function executePipeline(pipeline, options = {}) {
	// Implementation
}
```

### 3. Error Handling Pattern

```javascript
class PipelineError extends Error {
	constructor(nodeId, originalError) {
		super(`Node ${nodeId} failed: ${originalError.message}`);
		this.name = "PipelineError";
		this.nodeId = nodeId;
		this.originalError = originalError;
	}
}

// Usage
try {
	await node.execute(data);
} catch (error) {
	throw new PipelineError(node.id, error);
}
```

### 4. Async/Await (No Callbacks)

```javascript
// ✅ Correct
async function fetchData() {
	const response = await fetch(url);
	const data = await response.json();
	return data;
}

// ❌ Wrong
function fetchData(callback) {
	fetch(url).then((res) => {
		res.json().then((data) => callback(data));
	});
}
```

---

## Om.js Framework Rules

### 1. Component Structure

```javascript
/**
 * Pipeline node card component
 */
export class NodeCard extends HTMLElement {
	// 1. Static metadata
	static TYPE = "filter";

	// 2. Reactive state
	state = react({
		expanded: false,
		data: null,
	});

	// 3. Event handlers (bind 'this')
	handleEdit() {
		this.state.expanded = true;
	}

	// 4. Computed properties (use arrow functions)
	get statusClass() {
		return () => (this.state.data ? "success" : "idle");
	}

	// 5. Render method
	render() {
		return html`
			<div class=${this.statusClass()}>
				<button @click=${this.handleEdit.bind(this)}>Edit</button>
			</div>
		`;
	}

	// 6. Lifecycle
	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("node-card", NodeCard);
```

### 2. Reactivity Rules

```javascript
// ✅ Reactive (arrow function)
html`<div>${() => state.count}</div>`;

// ❌ Static (evaluated once)
html`<div>${state.count}</div>`;

// ✅ Reactive attribute
html`<input .value=${() => state.text} />`;

// ❌ Wrong (quoted)
html`<input .value="${() => state.text}" />`;
```

### 3. Event Binding

```javascript
// ✅ Always bind 'this'
@click=${this.handleClick.bind(this)}

// ❌ Wrong (loses context)
@click=${this.handleClick}

// ❌ Wrong (creates new function each render)
@click=${() => this.handleClick()}
```

### 4. List Rendering

```javascript
// ✅ Use map() helper
${map(items, item => html`<li>${item}</li>`)}

// ✅ With update function for performance
${map(items, itemTemplate, updateFunction)}

// ❌ Don't use native map
${items.map(item => html`<li>${item}</li>`)}
```

---

## CSS Standards

### 1. Use CSS Custom Properties

```css
/* variables.css */
:root {
	--color-bg: #0a0a0a;
	--color-pipe: #1a1a1a;
	--color-accent: #00ff88;
	--spacing-sm: 0.5em;
	--spacing-md: 1em;
	--spacing-lg: 2em;
}

/* Use em for scalability */
.node-card {
	padding: var(--spacing-md);
	margin: var(--spacing-sm);
	font-size: 1em; /* User can change base font size */
}
```

### 2. BEM Naming (Simplified)

```css
/* Block */
.node-card {
}

/* Element */
.node-card__header {
}
.node-card__body {
}

/* Modifier */
.node-card--error {
}
.node-card--success {
}
```

### 3. No Pixel Units (Use em/rem)

```css
/* ✅ Correct */
padding: 1em;
font-size: 0.875rem;
gap: 0.5em;

/* ❌ Wrong */
padding: 16px;
font-size: 14px;
gap: 8px;
```

---

## AI Integration Rules

### 1. Prompt Organization

```javascript
/**
 * Centralized AI prompt management
 */
class PromptBuilder {
	/**
	 * Generate pipeline from user intent
	 * @param {string} intent - User's goal
	 * @param {string} dataSource - URL/file/text
	 * @returns {string} Structured prompt
	 */
	static buildPipelinePrompt(intent, dataSource) {
		return `
You are an expert at building data pipelines.

USER INTENT: ${intent}
DATA SOURCE: ${dataSource}

AVAILABLE NODES:
${this.getNodeDocumentation()}

RULES:
1. Return ONLY valid JSON (no markdown)
2. Use minimum nodes needed
3. Include error handling for external requests
4. Use descriptive node IDs (e.g., fetch_amazon_page)

OUTPUT FORMAT:
{
  "nodes": [...],
  "reasoning": "Brief explanation"
}
    `.trim();
	}

	/**
	 * Get all nodes as documentation
	 */
	static getNodeDocumentation() {
		return NODE_REGISTRY.flatMap((category) => category)
			.map((NodeClass) => {
				const meta = NodeClass.getMetadata();
				return `- ${meta.type}: ${meta.description}`;
			})
			.join("\n");
	}
}
```

### 2. AI Response Validation

```javascript
/**
 * Validate AI-generated pipeline before execution
 */
class PipelineValidator {
	static validate(pipeline) {
		const errors = [];

		// Check required fields
		if (!pipeline.nodes) {
			errors.push("Missing nodes array");
		}

		// Validate each node
		for (const node of pipeline.nodes) {
			if (!node.type) errors.push(`Node ${node.id} missing type`);
			if (!node.id) errors.push("Node missing ID");

			// Check node type exists
			const NodeClass = getNodeClass(node.type);
			if (!NodeClass) {
				errors.push(`Unknown node type: ${node.type}`);
			}

			// Validate node config
			const instance = new NodeClass(node.id, node.config);
			errors.push(...instance.validate());
		}

		// Check for cycles
		if (this.hasCycle(pipeline)) {
			errors.push("Pipeline contains cycle");
		}

		return errors;
	}

	static hasCycle(pipeline) {
		// Implement cycle detection
	}
}
```

---

## Storage Rules

### 1. IndexedDB Patterns

```javascript
/**
 * Database manager with transaction safety
 */
class IndexedDBManager {
	constructor(dbName = "ghostpipes", version = 1) {
		this.dbName = dbName;
		this.version = version;
		this.db = null;
	}

	/**
	 * Initialize database
	 */
	async init() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.version);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => {
				this.db = request.result;
				resolve();
			};

			request.onupgradeneeded = (event) => {
				const db = event.target.result;

				// Create object stores
				if (!db.objectStoreNames.contains("pipelines")) {
					const store = db.createObjectStore("pipelines", { keyPath: "id" });
					store.createIndex("status", "status", { unique: false });
				}

				if (!db.objectStoreNames.contains("executions")) {
					const store = db.createObjectStore("executions", { keyPath: "id" });
					store.createIndex("pipelineId", "pipelineId", { unique: false });
				}
			};
		});
	}

	/**
	 * Generic get operation
	 * @param {string} storeName - Object store name
	 * @param {string} key - Record key
	 * @returns {Promise<any>} Record or null
	 */
	async get(storeName, key) {
		const tx = this.db.transaction(storeName, "readonly");
		const store = tx.objectStore(storeName);

		return new Promise((resolve, reject) => {
			const request = store.get(key);
			request.onsuccess = () => resolve(request.result || null);
			request.onerror = () => reject(request.error);
		});
	}

	/**
	 * Generic put operation
	 * @param {string} storeName - Object store name
	 * @param {any} data - Data to store
	 * @returns {Promise<void>}
	 */
	async put(storeName, data) {
		const tx = this.db.transaction(storeName, "readwrite");
		const store = tx.objectStore(storeName);

		return new Promise((resolve, reject) => {
			const request = store.put(data);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}
}
```

### 2. Data Migration Pattern

```javascript
/**
 * Handle schema changes between versions
 */
class MigrationManager {
	static async migrate(fromVersion, toVersion) {
		const migrations = {
			1: () => this.migrateV1toV2(),
			2: () => this.migrateV2toV3(),
		};

		for (let v = fromVersion; v < toVersion; v++) {
			await migrations[v]();
		}
	}
}
```

---

## Testing Guidelines

### 1. Unit Test Structure

```javascript
/**
 * Test individual nodes
 */
describe("FilterNode", () => {
	let node;

	beforeEach(() => {
		node = new FilterNode("test_1", {
			mode: "permit",
			matchType: "all",
			rules: [{ field: "price", operator: ">", value: 50 }],
		});
	});

	test("filters items correctly", async () => {
		const input = [
			{ name: "A", price: 100 },
			{ name: "B", price: 25 },
		];

		const result = await node.execute(input);

		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("A");
	});

	test("validates config", () => {
		node.config.rules = [];
		const errors = node.validate();
		expect(errors).toContain("At least one rule required");
	});
});
```

### 2. Integration Test Structure

```javascript
/**
 * Test full pipeline execution
 */
describe('Pipeline Execution', () => {
  test('executes multi-node pipeline', async () => {
    const pipeline = {
      nodes: [
        { id: 'n1', type: 'manual_input', config: { data: '...' } },
        { id: 'n2', type: 'filter', config: { ... } },
        { id: 'n3', type: 'download', config: { ... } }
      ]
    };

    const runner = new PipelineRunner();
    const result = await runner.execute(pipeline);

    expect(result.status).toBe('success');
    expect(result.nodeResults).toHaveProperty('n1');
  });
});
```

---

## Performance Rules

### 1. Lazy Loading

```javascript
// Load nodes on-demand
const nodeCache = new Map();

async function loadNode(nodeType) {
	if (nodeCache.has(nodeType)) {
		return nodeCache.get(nodeType);
	}

	const module = await import(`/nodes/${nodeType}.js`);
	nodeCache.set(nodeType, module.default);
	return module.default;
}
```

### 2. Virtual Scrolling (Large Pipelines)

```javascript
class VirtualCanvas {
	renderVisibleNodes(nodes, viewport) {
		const visible = nodes.filter((node) => this.isInViewport(node.position, viewport));

		return visible.map((node) => this.renderNode(node));
	}

	isInViewport(position, viewport) {
		return (
			position.x >= viewport.left &&
			position.x <= viewport.right &&
			position.y >= viewport.top &&
			position.y <= viewport.bottom
		);
	}
}
```

### 3. Debouncing User Input

```javascript
function debounce(fn, delay = 300) {
	let timeoutId;
	return (...args) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
}

// Usage
const handleSearch = debounce((query) => {
	// Perform search
}, 300);
```

---

## Security Rules

### 1. Input Sanitization

```javascript
class SecurityManager {
	/**
	 * Sanitize user input before pipeline execution
	 */
	static sanitize(input) {
		if (typeof input === "string") {
			// Remove script tags
			input = input.replace(/<script[^>]*>.*?<\/script>/gi, "");

			// Escape HTML entities
			input = input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		}

		if (typeof input === "object") {
			// Recursively sanitize objects
			for (const key in input) {
				input[key] = this.sanitize(input[key]);
			}
		}

		return input;
	}

	/**
	 * Validate URL before fetching
	 */
	static validateURL(url) {
		try {
			const parsed = new URL(url);

			// Block dangerous protocols
			if (!["http:", "https:"].includes(parsed.protocol)) {
				throw new Error("Invalid protocol");
			}

			return true;
		} catch {
			return false;
		}
	}
}
```

### 2. Content Security Policy

```javascript
// manifest.json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

---

## Naming Conventions

### 1. Variables

```javascript
// Constants (UPPER_SNAKE_CASE)
const MAX_PIPELINE_NODES = 20;
const DEFAULT_TIMEOUT_MS = 5000;

// Booleans (is/has/should prefix)
const isActive = true;
const hasError = false;
const shouldRetry = true;

// Arrays (plural nouns)
const nodes = [];
const pipelines = [];
const errors = [];

// Objects (singular nouns)
const pipeline = {};
const nodeConfig = {};
```

### 2. Functions

```javascript
// Actions (verbs)
function executeNode() {}
function validatePipeline() {}
function renderCanvas() {}

// Getters (get prefix)
function getNodeById(id) {}
function getActivePipelines() {}

// Boolean returns (is/has/can prefix)
function isValid() {}
function hasErrors() {}
function canExecute() {}
```

### 3. Classes

```javascript
// Nouns (PascalCase)
class PipelineRunner {}
class NodeExecutor {}
class ErrorRecovery {}

// Avoid redundant suffixes
// ✅ FilterNode (clear context)
// ❌ FilterNodeClass (redundant)
```

---

## Documentation Standards

### 1. File Headers

```javascript
/**
 * @fileoverview Pipeline execution engine
 * @module core/execution/pipeline-runner
 * @requires core/storage/indexeddb-manager
 * @requires nodes/base-node
 */
```

### 2. Class Documentation

```javascript
/**
 * Executes pipelines with error recovery
 *
 * Features:
 * - Sequential node execution
 * - Partial failure recovery
 * - Execution history tracking
 *
 * @example
 * const runner = new PipelineRunner();
 * const result = await runner.execute(pipeline);
 */
class PipelineRunner {
	// Implementation
}
```

### 3. Complex Algorithm Comments

```javascript
/**
 * Calculate optimal pipe routing between nodes
 *
 * Algorithm:
 * 1. Determine primary direction (vertical/horizontal)
 * 2. Calculate midpoint
 * 3. Generate right-angle segments
 * 4. Avoid overlapping existing pipes
 */
function calculatePipeRoute(startNode, endNode) {
	// Implementation
}
```
