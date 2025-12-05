# Implementation Examples

Complete, working code examples for reference.

---

## Example 1: Complete Node Implementation

### FilterNode.js

```javascript
/**
 * @fileoverview Filter node - Keep or block items matching conditions
 * @module nodes/processing/filter-node
 */

/**
 * Filter items based on rules
 *
 * @example
 * const node = new FilterNode('filter_1', {
 *   mode: 'permit',
 *   matchType: 'all',
 *   rules: [
 *     { field: 'price', operator: '>', value: 50 }
 *   ]
 * });
 *
 * const input = [
 *   { name: 'A', price: 100 },
 *   { name: 'B', price: 25 }
 * ];
 *
 * const output = await node.execute(input);
 * // Result: [{ name: 'A', price: 100 }]
 */
class FilterNode extends BaseNode {
	static TYPE = "filter";
	static NAME = "Filter";
	static DESCRIPTION = "Keep or block items matching conditions";
	static CATEGORY = "processing";
	static ICON = "🕸️";
	static INPUTS = 1;
	static OUTPUTS = 1;

	/**
	 * Execute filter operation
	 * @param {Array} input - Array of items to filter
	 * @returns {Promise<Array>} Filtered items
	 * @throws {Error} If input is not an array
	 */
	async execute(input) {
		if (!Array.isArray(input)) {
			throw new Error("Filter node requires array input");
		}

		const { mode, matchType, rules } = this.config;

		return input.filter((item) => {
			const matches = rules.map((rule) => this.evaluateRule(item, rule));
			const pass = matchType === "all" ? matches.every((m) => m) : matches.some((m) => m);

			return mode === "permit" ? pass : !pass;
		});
	}

	/**
	 * Evaluate single rule against item
	 * @param {Object} item - Data item
	 * @param {Object} rule - Rule configuration
	 * @returns {boolean} True if rule matches
	 */
	evaluateRule(item, rule) {
		const value = this.getFieldValue(item, rule.field);

		const operators = {
			"==": (a, b) => a == b,
			"!=": (a, b) => a != b,
			">": (a, b) => a > b,
			"<": (a, b) => a < b,
			">=": (a, b) => a >= b,
			"<=": (a, b) => a <= b,
			contains: (a, b) => String(a).includes(b),
			matches: (a, b) => new RegExp(b).test(a),
			startsWith: (a, b) => String(a).startsWith(b),
			endsWith: (a, b) => String(a).endsWith(b),
		};

		const operator = operators[rule.operator];
		if (!operator) {
			throw new Error(`Unknown operator: ${rule.operator}`);
		}

		return operator(value, rule.value);
	}

	/**
	 * Get nested field value using dot notation
	 * @param {Object} obj - Object to query
	 * @param {string} path - Field path (e.g., 'user.name')
	 * @returns {any} Field value or undefined
	 */
	getFieldValue(obj, path) {
		return path.split(".").reduce((current, key) => current?.[key], obj);
	}

	/**
	 * Validate node configuration
	 * @returns {Array<string>} Validation errors
	 */
	validate() {
		const errors = [];

		if (!this.config.mode) {
			errors.push("Mode is required (permit or block)");
		}

		if (!["permit", "block"].includes(this.config.mode)) {
			errors.push('Mode must be "permit" or "block"');
		}

		if (!this.config.matchType) {
			errors.push("Match type is required (all or any)");
		}

		if (!Array.isArray(this.config.rules) || this.config.rules.length === 0) {
			errors.push("At least one rule is required");
		}

		// Validate each rule
		this.config.rules?.forEach((rule, index) => {
			if (!rule.field) {
				errors.push(`Rule ${index}: field is required`);
			}
			if (!rule.operator) {
				errors.push(`Rule ${index}: operator is required`);
			}
			if (rule.value === undefined) {
				errors.push(`Rule ${index}: value is required`);
			}
		});

		return errors;
	}

	/**
	 * Generate UI configuration template
	 * @returns {string} HTML template
	 */
	static getConfigTemplate() {
		return `
      <div class="node-config filter-config">
        <div class="config-row">
          <label>
            <input type="radio" name="mode" value="permit" checked />
            Permit
          </label>
          <label>
            <input type="radio" name="mode" value="block" />
            Block
          </label>
          <span>items that match</span>
          <select name="matchType">
            <option value="all">all</option>
            <option value="any">any</option>
          </select>
          <span>of the following:</span>
        </div>
        
        <div class="rules-container">
          <!-- Rules dynamically added here -->
        </div>
        
        <button type="button" class="add-rule-btn">+ Add Rule</button>
        
        <div class="preview-section">
          <h4>Preview</h4>
          <div class="preview-content">
            <!-- Live preview of filtered data -->
          </div>
        </div>
      </div>
    `;
	}
}

export default FilterNode;
```

---

## Example 2: Om.js Component

### NodeCard.js

```javascript
/**
 * @fileoverview Visual card component for pipeline nodes
 * @module ui/components/node-card
 */

import { react, html } from "/lib/om.compact.js";

/**
 * Node card component with drag-and-drop support
 *
 * @example
 * <node-card
 *   node-id="filter_1"
 *   node-type="filter"
 *   .config=${{ mode: 'permit', rules: [...] }}
 * ></node-card>
 */
export class NodeCard extends HTMLElement {
	state = react({
		isEditing: false,
		isHovered: false,
		status: "idle", // idle | running | success | error
		errorMessage: null,
	});

	/**
	 * Get node metadata from registry
	 */
	get nodeMetadata() {
		const NodeClass = getNodeClass(this.getAttribute("node-type"));
		return NodeClass.getMetadata();
	}

	/**
	 * Generate human-readable summary of config
	 */
	get configSummary() {
		return () => {
			const config = this.config;
			const type = this.getAttribute("node-type");

			// Type-specific summaries
			const summaries = {
				filter: () => {
					const count = config.rules?.length || 0;
					return `${config.mode} items matching ${count} rule${count !== 1 ? "s" : ""}`;
				},
				transform: () => {
					const fields = Object.keys(config.mapping || {}).length;
					return `Transform ${fields} field${fields !== 1 ? "s" : ""}`;
				},
				http_request: () => {
					return `${config.method || "GET"} ${config.url || "URL not set"}`;
				},
			};

			return summaries[type]?.() || "Click edit to configure";
		};
	}

	/**
	 * Get status icon
	 */
	get statusIcon() {
		return () => {
			const icons = {
				idle: "",
				running: "⏳",
				success: "✓",
				error: "💀",
			};
			return icons[this.state.status] || "";
		};
	}

	/**
	 * Open edit dialog
	 */
	handleEdit() {
		this.state.isEditing = true;

		// Dispatch event for parent to handle
		this.dispatchEvent(
			new CustomEvent("edit-node", {
				detail: {
					nodeId: this.getAttribute("node-id"),
					nodeType: this.getAttribute("node-type"),
					currentConfig: this.config,
				},
				bubbles: true,
			})
		);
	}

	/**
	 * Handle drag start
	 */
	handleDragStart(e) {
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData(
			"application/json",
			JSON.stringify({
				nodeId: this.getAttribute("node-id"),
				nodeType: this.getAttribute("node-type"),
			})
		);

		this.classList.add("dragging");
	}

	/**
	 * Handle drag end
	 */
	handleDragEnd() {
		this.classList.remove("dragging");
	}

	/**
	 * Render component
	 */
	render() {
		const meta = this.nodeMetadata;

		return html`
			<div
				class="node-card ${() => `node-card--${this.state.status}`}"
				draggable="true"
				@dragstart=${this.handleDragStart.bind(this)}
				@dragend=${this.handleDragEnd.bind(this)}
				@mouseenter=${() => (this.state.isHovered = true)}
				@mouseleave=${() => (this.state.isHovered = false)}>
				<!-- Header -->
				<div class="node-header">
					<span class="node-icon">${meta.icon}</span>
					<span class="node-name">${meta.name}</span>
					<button class="node-edit" @click=${this.handleEdit.bind(this)} aria-label="Edit ${meta.name} configuration">
						⚙️
					</button>
				</div>

				<!-- Summary -->
				<div class="node-summary">${this.configSummary()}</div>

				<!-- Status indicator -->
				${() =>
					this.state.status !== "idle"
						? html`
								<div class="node-status node-status--${this.state.status}">
									<span class="status-icon">${this.statusIcon()}</span>
									${() =>
										this.state.errorMessage
											? html` <span class="status-message">${this.state.errorMessage}</span> `
											: ""}
								</div>
						  `
						: ""}

				<!-- Connection points -->
				<div class="node-input" data-port="input"></div>
				<div class="node-output" data-port="output"></div>
			</div>
		`;
	}

	/**
	 * Lifecycle: Component mounted
	 */
	connectedCallback() {
		// Get initial config from property
		this.config = this.config || {};

		// Render
		this.replaceChildren(this.render());
	}

	/**
	 * Update node status
	 * @param {string} status - New status
	 * @param {string} [errorMessage] - Error message if status is 'error'
	 */
	updateStatus(status, errorMessage) {
		this.state.status = status;
		this.state.errorMessage = errorMessage;
	}
}

customElements.define("node-card", NodeCard);
```

---

## Example 3: Pipe Rendering

### PipeRenderer.js

```javascript
/**
 * @fileoverview SVG pipe rendering with realistic appearance
 * @module ui/components/pipe-renderer
 */

/**
 * Renders realistic metallic pipes between nodes
 */
class PipeRenderer {
	constructor(svgElement) {
		this.svg = svgElement;
		this.pipes = new Map();
	}

	/**
	 * Draw pipe between two nodes
	 * @param {string} pipeId - Unique pipe identifier
	 * @param {Object} startNode - Source node { x, y, width, height }
	 * @param {Object} endNode - Target node { x, y, width, height }
	 * @returns {SVGElement} Pipe group element
	 */
	drawPipe(pipeId, startNode, endNode) {
		// Calculate connection points
		const start = this.getOutputPoint(startNode);
		const end = this.getInputPoint(endNode);

		// Generate path with right angles
		const pathData = this.createRightAnglePath(start, end);

		// Create pipe group
		const pipeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
		pipeGroup.id = pipeId;
		pipeGroup.classList.add("pipe");

		// Outer pipe (shadow)
		const outerPipe = this.createPath(pathData, {
			stroke: "#1a1a1a",
			strokeWidth: 12,
			fill: "none",
			opacity: 0.8,
		});

		// Main pipe (metallic gradient)
		const mainPipe = this.createPath(pathData, {
			stroke: "url(#pipeGradient)",
			strokeWidth: 10,
			fill: "none",
		});
		mainPipe.id = `${pipeId}_path`;

		// Inner pipe (hollow)
		const innerPipe = this.createPath(pathData, {
			stroke: "#0a0a0a",
			strokeWidth: 6,
			fill: "none",
		});

		// Flow particle
		const particle = this.createFlowParticle(pipeId);

		// Assemble pipe
		pipeGroup.appendChild(outerPipe);
		pipeGroup.appendChild(mainPipe);
		pipeGroup.appendChild(innerPipe);
		pipeGroup.appendChild(particle);

		// Add to SVG
		this.svg.appendChild(pipeGroup);

		// Store reference
		this.pipes.set(pipeId, {
			element: pipeGroup,
			startNode,
			endNode,
		});

		// Animate appearance
		this.animatePipeDrawing(mainPipe);

		return pipeGroup;
	}

	/**
	 * Calculate output connection point
	 * @param {Object} node - Node bounds
	 * @returns {Object} { x, y }
	 */
	getOutputPoint(node) {
		return {
			x: node.x + node.width / 2,
			y: node.y + node.height,
		};
	}

	/**
	 * Calculate input connection point
	 * @param {Object} node - Node bounds
	 * @returns {Object} { x, y }
	 */
	getInputPoint(node) {
		return {
			x: node.x + node.width / 2,
			y: node.y,
		};
	}

	/**
	 * Create SVG path with right angles only
	 * @param {Object} start - Start point { x, y }
	 * @param {Object} end - End point { x, y }
	 * @returns {string} SVG path data
	 */
	createRightAnglePath(start, end) {
		const dx = end.x - start.x;
		const dy = end.y - start.y;

		// Simple vertical-first routing
		if (Math.abs(dy) > Math.abs(dx)) {
			// Go vertical, then horizontal, then vertical
			const midY = start.y + dy / 2;

			return `
        M ${start.x} ${start.y}
        L ${start.x} ${midY}
        L ${end.x} ${midY}
        L ${end.x} ${end.y}
      `.trim();
		}

		// Horizontal-first routing
		const midX = start.x + dx / 2;

		return `
      M ${start.x} ${start.y}
      L ${midX} ${start.y}
      L ${midX} ${end.y}
      L ${end.x} ${end.y}
    `.trim();
	}

	/**
	 * Create SVG path element
	 * @param {string} d - Path data
	 * @param {Object} attrs - Attributes
	 * @returns {SVGPathElement}
	 */
	createPath(d, attrs) {
		const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		path.setAttribute("d", d);

		for (const [key, value] of Object.entries(attrs)) {
			const attrName = key.replace(/([A-Z])/g, "-$1").toLowerCase();
			path.setAttribute(attrName, value);
		}

		return path;
	}

	/**
	 * Create animated particle flowing through pipe
	 * @param {string} pipeId - Pipe identifier
	 * @returns {SVGCircleElement}
	 */
	createFlowParticle(pipeId) {
		const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		circle.setAttribute("r", "3");
		circle.setAttribute("fill", "#00ff88");
		circle.setAttribute("opacity", "0.8");

		// Animate along path
		const animateMotion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
		animateMotion.setAttribute("dur", "2s");
		animateMotion.setAttribute("repeatCount", "indefinite");

		const mpath = document.createElementNS("http://www.w3.org/2000/svg", "mpath");
		mpath.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${pipeId}_path`);

		animateMotion.appendChild(mpath);
		circle.appendChild(animateMotion);

		return circle;
	}

	/**
	 * Animate pipe drawing effect
	 * @param {SVGPathElement} path - Pipe path
	 */
	animatePipeDrawing(path) {
		const length = path.getTotalLength();

		path.style.strokeDasharray = length;
		path.style.strokeDashoffset = length;

		path.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
			duration: 500,
			easing: "cubic-bezier(0.19, 1, 0.22, 1)",
			fill: "forwards",
		});
	}

	/**
	 * Remove pipe
	 * @param {string} pipeId - Pipe to remove
	 */
	removePipe(pipeId) {
		const pipe = this.pipes.get(pipeId);
		if (pipe) {
			pipe.element.remove();
			this.pipes.delete(pipeId);
		}
	}

	/**
	 * Create metallic gradient definition
	 */
	static createGradientDefs() {
		return `
      <defs>
        <linearGradient id="pipeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#4a4a4a;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#2a2a2a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
        </linearGradient>
        
        <filter id="pipeGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    `;
	}
}

export default PipeRenderer;
```

---

## Example 4: IndexedDB Storage

### IndexedDBManager.js

```javascript
/**
 * @fileoverview IndexedDB storage manager
 * @module core/storage/indexeddb-manager
 */

/**
 * Manages all IndexedDB operations
 */
class IndexedDBManager {
	constructor(dbName = "ghostpipes", version = 1) {
		this.dbName = dbName;
		this.version = version;
		this.db = null;
	}

	/**
	 * Initialize database connection
	 * @returns {Promise<void>}
	 */
	async init() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.version);

			request.onerror = () => {
				reject(new Error(`Failed to open database: ${request.error}`));
			};

			request.onsuccess = () => {
				this.db = request.result;
				resolve();
			};

			request.onupgradeneeded = (event) => {
				const db = event.target.result;

				this.createObjectStores(db);
			};
		});
	}

	/**
	 * Create all object stores
	 * @param {IDBDatabase} db - Database instance
	 */
	createObjectStores(db) {
		// Pipelines store
		if (!db.objectStoreNames.contains("pipelines")) {
			const pipelineStore = db.createObjectStore("pipelines", { keyPath: "id" });
			pipelineStore.createIndex("status", "status", { unique: false });
			pipelineStore.createIndex("lastRun", "lastRun", { unique: false });
		}

		// Executions store
		if (!db.objectStoreNames.contains("executions")) {
			const executionStore = db.createObjectStore("executions", { keyPath: "id" });
			executionStore.createIndex("pipelineId", "pipelineId", { unique: false });
			executionStore.createIndex("startedAt", "startedAt", { unique: false });
		}

		// Templates store
		if (!db.objectStoreNames.contains("templates")) {
			const templateStore = db.createObjectStore("templates", { keyPath: "id" });
			templateStore.createIndex("category", "category", { unique: false });
			templateStore.createIndex("usageCount", "usageCount", { unique: false });
		}

		// Cache store
		if (!db.objectStoreNames.contains("cache")) {
			const cacheStore = db.createObjectStore("cache", { keyPath: "key" });
			cacheStore.createIndex("expiresAt", "expiresAt", { unique: false });
		}

		// Settings store
		if (!db.objectStoreNames.contains("settings")) {
			db.createObjectStore("settings", { keyPath: "key" });
		}
	}

	/**
	 * Get record by key
	 * @param {string} storeName - Object store name
	 * @param {string} key - Record key
	 * @returns {Promise<any|null>} Record or null
	 */
	async get(storeName, key) {
		const tx = this.db.transaction(storeName, "readonly");
		const store = tx.objectStore(storeName);

		return new Promise((resolve, reject) => {
			const request = store.get(key);

			request.onsuccess = () => {
				resolve(request.result || null);
			};

			request.onerror = () => {
				reject(new Error(`Get failed: ${request.error}`));
			};
		});
	}

	/**
	 * Store or update record
	 * @param {string} storeName - Object store name
	 * @param {any} data - Data to store (must include keyPath field)
	 * @returns {Promise<void>}
	 */
	async put(storeName, data) {
		const tx = this.db.transaction(storeName, "readwrite");
		const store = tx.objectStore(storeName);

		return new Promise((resolve, reject) => {
			const request = store.put(data);

			request.onsuccess = () => resolve();

			request.onerror = () => {
				reject(new Error(`Put failed: ${request.error}`));
			};
		});
	}

	/**
	 * Delete record
	 * @param {string} storeName - Object store name
	 * @param {string} key - Record key
	 * @returns {Promise<void>}
	 */
	async delete(storeName, key) {
		const tx = this.db.transaction(storeName, "readwrite");
		const store = tx.objectStore(storeName);

		return new Promise((resolve, reject) => {
			const request = store.delete(key);

			request.onsuccess = () => resolve();

			request.onerror = () => {
				reject(new Error(`Delete failed: ${request.error}`));
			};
		});
	}

	/**
	 * Get all records from store
	 * @param {string} storeName - Object store name
	 * @returns {Promise<Array>} All records
	 */
	async getAll(storeName) {
		const tx = this.db.transaction(storeName, "readonly");
		const store = tx.objectStore(storeName);

		return new Promise((resolve, reject) => {
			const request = store.getAll();

			request.onsuccess = () => {
				resolve(request.result || []);
			};

			request.onerror = () => {
				reject(new Error(`GetAll failed: ${request.error}`));
			};
		});
	}

	/**
	 * Query by index
	 * @param {string} storeName - Object store name
	 * @param {string} indexName - Index name
	 * @param {any} value - Index value
	 * @returns {Promise<Array>} Matching records
	 */
	async queryByIndex(storeName, indexName, value) {
		const tx = this.db.transaction(storeName, "readonly");
		const store = tx.objectStore(storeName);
		const index = store.index(indexName);

		return new Promise((resolve, reject) => {
			const request = index.getAll(value);

			request.onsuccess = () => {
				resolve(request.result || []);
			};

			request.onerror = () => {
				reject(new Error(`Query failed: ${request.error}`));
			};
		});
	}

	/**
	 * Close database connection
	 */
	close() {
		if (this.db) {
			this.db.close();
			this.db = null;
		}
	}
}

export default IndexedDBManager;
```

---

These examples provide complete, working implementations that follow all the specifications and best practices defined in the project rules.
