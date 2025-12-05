# System Architecture

## Extension Architecture (Phase 1)

### Component Structure

```
ghostpipes-extension/
├── manifest.json
├── background/background.js
├── lib/
│   └── om.compact.js                    # Already provided
├── core/
│   ├── storage/
│   │   ├── indexeddb-manager.js         # Database operations
│   │   └── sync-engine.js               # (Phase 2 only)
│   ├── execution/
│   │   ├── pipeline-runner.js           # Execute pipelines
│   │   ├── node-executor.js             # Run individual nodes
│   │   └── error-recovery.js            # Handle failures
│   └── ai/
│       ├── pipeline-generator.js        # AI pipeline creation
│       ├── prompt-builder.js            # Structured prompts
│       └── embedding-cache.js           # Template matching
├── pipelines/components/editor/nodes/
│   ├── pipeline-node.js                     # Base class
│   ├── node-registry.js                 # Central registry
│   ├── input/
│   │   ├── manual-input-node.js
│   │   ├── http-request-node.js
│   │   ├── webhook-node.js
│   │   └── file-watch-node.js
│   ├── processing/
│   │   ├── filter-node.js               # Priority node
│   │   ├── transform-node.js            # Priority node
│   │   ├── ai-processor-node.js         # Priority node
│   │   ├── parse-node.js                # Priority node
│   │   ├── condition-node.js            # Priority node
│   │   └── [22 more nodes].js
│   └── output/
│       ├── download-node.js
│       ├── append-file-node.js
│       ├── http-post-node.js
│       └── email-node.js
├── pipelines/
│   │   ├── index.html                   # Home page
│   │   ├── pipeline-builder.html        # Canvas editor
│   ├── components/editor/
│   │   └── data-preview.js              # Eye icon viewer
│   │   └── drawer/node-picker-drawer.js
│   │   └── pipeline-builder-canvas.js
│   │   └──factory-house.js
│   └── styles/
│       ├── base.css                     # Global styles
│       ├── variables.css                # CSS properties
│       ├── home-page.css                # Home styles
│       └── pipeline-builder.css         # Canvas styles
│   ├── scripts/
│   │   ├── selection-mode.js            # Alt+E selection
        ├── floating-menu.js             # Alt+P menu
│   │   └── content-script.js            # Main script
│   └── background/
│       └── alarm-manager.js             # Scheduled execution
└── assets/
    └── icons.svg                        # Icon sprite
```

## Data Flow Architecture

### 1. Extension Activation Flow

```
User Action → Content Script → Background Service Worker → UI Update

Example: Alt+E pressed
1. Content script detects keypress
2. Injects selection overlay CSS
3. User clicks elements (green borders appear)
4. Alt+P pressed → Floating menu appears
5. User selects action → Opens pipeline builder
```

### 2. Pipeline Generation Flow

```
User Input → AI Analysis → Pipeline JSON → Visual Rendering → Execution

Example: "Track Amazon prices daily"
1. User pastes URL + writes prompt
2. PromptBuilder creates structured prompt:
   - Data source: Amazon product page
   - Intent: Monitor price changes
   - Schedule: Daily
3. AI returns pipeline JSON (see schema below)
4. PipeCanvas renders nodes + pipes
5. User clicks "Run" → PipelineRunner executes
```

### 3. Pipeline Execution Flow

```
Trigger → Node Queue → Execute → Transform → Output → Store

Example: Scheduled price check
1. chrome.alarms triggers at 9 AM
2. PipelineRunner loads pipeline from IndexedDB
3. Executes nodes sequentially:
   - HttpRequestNode fetches page
   - ParseNode extracts price
   - CompareNode checks vs last price
   - ConditionNode: if price dropped
   - NotificationNode: alerts user
4. Results stored in IndexedDB
5. Pipeline status updated
```

## Pipeline JSON Schema

### Complete Pipeline Structure

```json
{
	"id": "pipe_123abc",
	"name": "Amazon Price Tracker",
	"version": 1,
	"createdAt": "2025-01-15T10:30:00Z",
	"updatedAt": "2025-01-15T10:30:00Z",
	"trigger": {
		"type": "schedule",
		"config": {
			"frequency": "daily",
			"time": "09:00",
			"timezone": "America/New_York"
		}
	},
	"nodes": [
		{
			"id": "node_1",
			"type": "http_request",
			"position": { "x": 100, "y": 100 },
			"config": {
				"url": "https://amazon.com/product/B08XYZ",
				"method": "GET",
				"headers": {
					"User-Agent": "Mozilla/5.0..."
				}
			},
			"outputs": ["node_2"]
		},
		{
			"id": "node_2",
			"type": "parse",
			"position": { "x": 100, "y": 200 },
			"config": {
				"format": "html",
				"selectors": {
					"price": "#priceblock_ourprice",
					"title": "#productTitle"
				}
			},
			"inputs": ["node_1"],
			"outputs": ["node_3"]
		},
		{
			"id": "node_3",
			"type": "condition",
			"position": { "x": 100, "y": 300 },
			"config": {
				"operator": "<",
				"leftOperand": "{{node_2.price}}",
				"rightOperand": "{{storage.lastPrice}}"
			},
			"inputs": ["node_2"],
			"outputs": {
				"true": ["node_4"],
				"false": ["node_5"]
			}
		},
		{
			"id": "node_4",
			"type": "notification",
			"position": { "x": 50, "y": 400 },
			"config": {
				"title": "Price Drop Alert!",
				"body": "{{node_2.title}} is now {{node_2.price}}"
			},
			"inputs": ["node_3"]
		},
		{
			"id": "node_5",
			"type": "log",
			"position": { "x": 150, "y": 400 },
			"config": {
				"message": "No price change"
			},
			"inputs": ["node_3"]
		}
	],
	"metadata": {
		"tags": ["shopping", "price-tracking"],
		"isPublic": false,
		"template": false
	}
}
```

## Storage Schema (IndexedDB)

### Database: `ghostpipes`

#### Object Stores

**1. pipelines** (keyPath: `id`)

```javascript
{
  id: "pipe_123abc",
  data: { /* Pipeline JSON */ },
  lastRun: "2025-01-15T09:00:00Z",
  nextRun: "2025-01-16T09:00:00Z",
  status: "active" // active | paused | error
}
```

**2. executions** (keyPath: `id`, index: `pipelineId`)

```javascript
{
  id: "exec_456def",
  pipelineId: "pipe_123abc",
  startedAt: "2025-01-15T09:00:00Z",
  completedAt: "2025-01-15T09:00:15Z",
  status: "success", // success | failed | partial
  nodeResults: {
    "node_1": { success: true, data: {...}, duration: 1234 },
    "node_2": { success: true, data: {...}, duration: 456 }
  },
  errors: []
}
```

**3. templates** (keyPath: `id`, index: `category`)

```javascript
{
  id: "tpl_789ghi",
  name: "LinkedIn Lead Extractor",
  description: "Extract profile data from LinkedIn",
  category: "social-media",
  pipeline: { /* Pipeline JSON */ },
  usageCount: 1523,
  rating: 4.8
}
```

**4. cache** (keyPath: `key`, index: `expiresAt`)

```javascript
{
  key: "http_GET_https://example.com",
  value: { /* Response data */ },
  expiresAt: "2025-01-15T10:00:00Z"
}
```

**5. settings** (keyPath: `key`)

```javascript
{
  key: "user_preferences",
  value: {
    theme: "dark",
    enableNotifications: true,
    defaultScheduleTime: "09:00",
    cloudSync: false // Phase 2
  }
}
```

## AI Integration Architecture

### Pipeline Generation Prompt Structure

```javascript
class PromptBuilder {
	/**
	 * Generate structured prompt for AI pipeline generation
	 * @param {Object} context - User input context
	 * @param {string} context.intent - What user wants to do
	 * @param {string} context.dataSource - URL, file, text
	 * @param {string} context.dataType - HTML, CSV, JSON, etc.
	 * @returns {string} Formatted prompt for Gemini API
	 */
	generatePipelinePrompt(context) {
		return `
You are a pipeline generation assistant. Generate a JSON pipeline based on:

INTENT: ${context.intent}
DATA SOURCE: ${context.dataSource}
DATA TYPE: ${context.dataType}

AVAILABLE NODES: ${this.getNodeDocumentation()}

RULES:
1. Return ONLY valid JSON (no markdown, no explanation)
2. Use minimum nodes needed (prefer efficiency)
3. Include error handling nodes for external requests
4. Set realistic timeouts (5s for HTTP, 30s for AI)
5. Use descriptive node IDs (e.g., fetch_product_page)

OUTPUT FORMAT:
{
  "nodes": [...],
  "reasoning": "Why these nodes in this order"
}

Generate the pipeline:
    `.trim();
	}

	/**
	 * Embed available nodes as context for AI
	 */
	getNodeDocumentation() {
		return NODES.map((n) => `${n.type}: ${n.description} (inputs: ${n.inputs}, outputs: ${n.outputs})`).join("\n");
	}
}
```

### Embedding Cache Strategy

```javascript
class EmbeddingCache {
	/**
	 * Find similar pipelines using text embeddings
	 * @param {string} userIntent - User's description
	 * @returns {Array<Pipeline>} Top 5 similar pipelines
	 */
	async findSimilar(userIntent) {
		// 1. Generate embedding for user intent (Cohere API)
		const intentEmbedding = await this.embed(userIntent);

		// 2. Compare with cached template embeddings
		const similarities = this.templates.map((tpl) => ({
			template: tpl,
			score: this.cosineSimilarity(intentEmbedding, tpl.embedding),
		}));

		// 3. Return top matches
		return similarities
			.sort((a, b) => b.score - a.score)
			.slice(0, 5)
			.map((s) => s.template);
	}
}
```

## Pipe Rendering Engine (SVG)

### Realistic Pipe Drawing Algorithm

```javascript
class PipeRenderer {
	/**
	 * Draw pipe segment between two nodes
	 * @param {Object} startNode - Source node {x, y, width, height}
	 * @param {Object} endNode - Target node {x, y, width, height}
	 * @param {string} pipeId - Unique identifier
	 * @returns {SVGElement} Pipe path element
	 */
	drawPipe(startNode, endNode, pipeId) {
		// Calculate connection points (avoid overlap)
		const start = this.getOutputPoint(startNode);
		const end = this.getInputPoint(endNode);

		// Generate path with right-angle segments (no curves!)
		const path = this.createRightAnglePath(start, end);

		// Create SVG with 3D effect
		const pipe = `
      <g id="${pipeId}" class="pipe">
        <!-- Outer pipe (shadow) -->
        <path d="${path}" 
              stroke="#1a1a1a" 
              stroke-width="12" 
              fill="none" />
        
        <!-- Main pipe (metallic) -->
        <path d="${path}" 
              stroke="url(#pipeGradient)" 
              stroke-width="10" 
              fill="none" />
        
        <!-- Inner pipe (hollow) -->
        <path d="${path}" 
              stroke="#0a0a0a" 
              stroke-width="6" 
              fill="none" />
        
        <!-- Flow particles (animated) -->
        <circle r="3" fill="#00ff88">
          <animateMotion dur="2s" repeatCount="indefinite">
            <mpath href="#${pipeId}_path"/>
          </animateMotion>
        </circle>
      </g>
    `;

		return pipe;
	}

	/**
	 * Create path with only right angles (no curves)
	 */
	createRightAnglePath(start, end) {
		const dx = end.x - start.x;
		const dy = end.y - start.y;

		// Vertical-first routing
		if (Math.abs(dy) > Math.abs(dx)) {
			const midY = start.y + dy / 2;
			return `M ${start.x} ${start.y} 
              L ${start.x} ${midY} 
              L ${end.x} ${midY} 
              L ${end.x} ${end.y}`;
		}

		// Horizontal-first routing
		const midX = start.x + dx / 2;
		return `M ${start.x} ${start.y} 
            L ${midX} ${start.y} 
            L ${midX} ${end.y} 
            L ${end.x} ${end.y}`;
	}
}
```

## Error Recovery System

### Partial Pipeline Execution

```javascript
class ErrorRecovery {
	/**
	 * Handle node failure without stopping pipeline
	 * @param {string} nodeId - Failed node
	 * @param {Error} error - Error object
	 * @param {Object} pipeline - Current pipeline state
	 */
	async handleNodeFailure(nodeId, error, pipeline) {
		const node = pipeline.nodes.find((n) => n.id === nodeId);

		// Strategy 1: Retry with backoff
		if (this.shouldRetry(error)) {
			return await this.retryWithBackoff(node, 3);
		}

		// Strategy 2: Use cached data
		if (this.hasCachedResult(nodeId)) {
			return this.getCachedResult(nodeId);
		}

		// Strategy 3: Use fallback node
		if (node.config.fallbackNode) {
			return await this.executeFallback(node.config.fallbackNode);
		}

		// Strategy 4: Skip and continue
		if (node.config.skipOnError) {
			return { skipped: true, reason: error.message };
		}

		// Strategy 5: Stop pipeline
		throw new PipelineExecutionError(nodeId, error);
	}
}
```

## Web App Architecture (Phase 2)

### Backend Stack

```
Node.js + Fastify + PostgreSQL (AWS RDS)

Key Features:
- User authentication (JWT)
- Pipeline storage + versioning
- Cloud execution queue
- Rate limiting + usage tracking
- Template marketplace
```

### Sync Protocol (Extension ↔ Web App)

```javascript
class SyncEngine {
	/**
	 * Bi-directional sync between extension and cloud
	 */
	async sync() {
		// 1. Get last sync timestamp
		const lastSync = await this.getLastSyncTime();

		// 2. Pull changes from server
		const serverChanges = await fetch(`/api/sync?since=${lastSync}`);
		await this.applyServerChanges(serverChanges);

		// 3. Push local changes
		const localChanges = await this.getLocalChanges(lastSync);
		await fetch("/api/sync", {
			method: "POST",
			body: JSON.stringify(localChanges),
		});

		// 4. Resolve conflicts (last-write-wins)
		await this.resolveConflicts();
	}
}
```

## Security Considerations

### Content Security Policy (CSP)

```json
{
	"content_security_policy": {
		"extension_pages": "script-src 'self'; object-src 'self'"
	}
}
```

### Data Sanitization

```javascript
class SecurityManager {
	/**
	 * Sanitize user input before execution
	 */
	sanitizeInput(data) {
		// Remove script tags
		// Validate URLs
		// Escape HTML entities
	}

	/**
	 * Validate pipeline JSON before execution
	 */
	validatePipeline(pipeline) {
		// Check node types exist
		// Validate node connections
		// Prevent infinite loops
		// Limit pipeline complexity (max 20 nodes)
	}
}
```

## Performance Optimization

### Lazy Loading Strategy

```javascript
// Load nodes on-demand
const loadNode = async (nodeType) => {
	const module = await import(`/nodes/${nodeType}.js`);
	return module.default;
};
```

### Virtual Scrolling for Large Pipelines

```javascript
// Only render visible nodes in canvas
class VirtualCanvas {
	renderVisibleNodes(viewport) {
		const visible = this.nodes.filter((n) => this.isInViewport(n, viewport));
		return visible.map((n) => this.renderNode(n));
	}
}
```

## Browser Compatibility

### Feature Detection

```javascript
class FeatureDetector {
	checkSupport() {
		return {
			fileSystemAccess: "showOpenFilePicker" in window,
			fileSystemObserver: "FileSystemObserver" in window,
			serviceWorker: "serviceWorker" in navigator,
			indexedDB: "indexedDB" in window,
			alarms: chrome?.alarms !== undefined,
		};
	}
}
```

### Graceful Degradation

```javascript
// If File System Access API unavailable, use fallback
if (!window.showOpenFilePicker) {
	// Use traditional file input
	const input = document.createElement("input");
	input.type = "file";
}
```
