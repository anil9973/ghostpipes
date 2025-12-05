I need you to implement a professional SVG-based visual pipeline builder for GhostPipes Chrome extension. This is a critical feature that allows users to visually design automation pipelines with realistic industrial pipe connections.

## Project Context

**Product**: GhostPipes - Visual pipeline automation tool
**Feature**: Drag-and-drop pipeline builder with realistic pipe rendering
**Visual Style**: Clean industrial pipes (like plumbing/factory pipelines)
**Target**: Chrome 140+ with modern vanilla JS and CSS

## What I'm Providing

Complete specification document:

**Pipeline Builder Specification** (`/specs/pipeline-builder-visual-editor.md`)

- Visual design requirements (nodes in HTML, pipes in SVG)
- Node system with connection points
- Pipe routing algorithm (90° bends, collision avoidance)
- Interaction model (drag-drop, pipe creation, editing)
- SVG layer architecture
- Data model (JSON format)
- Performance optimizations
- Class structure and file organization

## Critical Requirements

### 1. Realistic Pipe Rendering

**NOT arrows, NOT dashed lines, NOT simple curves**

**YES:**

- 10px thick solid pipes
- 90° angle bends only
- Small cubic bezier (10-20px) at corners for smooth joints
- Decorative patch overlay at each elbow
- Clear T-joints where pipes meet nodes

**Visual Reference:**

```
Bad (avoid):           Good (implement):
  ┌─→                    │
  │                      │╭──  ← smooth corner
  └──→                   └────
```

### 2. Smart Connection Logic

**Automatic side detection:**

```javascript
// If sourceNode.y < targetNode.y:
//   Connect: sourceNode.bottom → targetNode.top
// Else:
//   Connect: sourceNode.top → targetNode.bottom

// User just drags - system figures out correct sides
// No confusion, no warnings, just works
```

### 3. Connection Point Spacing

**Multiple pipes cannot connect at same point:**

- Minimum 30px spacing between connection points
- Dynamic calculation based on number of connections
- Each pipe gets its own slot on node edge

```
Node with 3 connections on bottom:
├──30px──●──30px──●──30px──●──30px──┤
```

### 4. Smooth Interactions

- Use `requestAnimationFrame()` for all drag operations
- 60fps target for node dragging
- Pipes update in real-time during drag
- Debounce path recalculation (16ms)

### 5. Collision Avoidance

Pipes must route around nodes:

```
Source ──┐
         │
    ┌────┼────┐
    │  Node   │  ← Pipe goes around
    └─────────┘
         │
      Target
```

## Implementation Structure

### Main Classes

**PipelineCanvas** (coordinator)

```javascript
export class PipelineCanvas {
	constructor(containerElement) {
		this.nodeManager = new NodeManager(this);
		this.pipeManager = new PipeManager(this);
		this.connectionTracker = new ConnectionTracker();
		this.pathCalculator = new PathCalculator();
		this.interactionHandler = new InteractionHandler(this);
	}

	addNode(type, position) {}
	createPipe(sourceId, targetId) {}
	export() {} // Return JSON
	import(data) {} // Load JSON
}
```

**NodeManager**

```javascript
export class NodeManager {
	createNode(type, position) {}
	moveNode(nodeId, newPosition) {}
	deleteNode(nodeId) {}
	getNodeBounds(nodeId) {} // For collision detection
}
```

**PipeManager**

```javascript
export class PipeManager {
	startPipeCreation(sourceNode, sourceSide) {}
	updateTempPipe(mousePosition) {}
	finishPipeCreation(targetNode, targetSide) {}
	deletePipe(pipeId) {}
	redrawPipe(pipeId) {}
}
```

**PathCalculator**

```javascript
export class PathCalculator {
	calculateOrthogonalPath(start, end, obstacles) {
		// Returns array of waypoints for 90° path
	}

	generateSVGPath(waypoints) {
		// Converts waypoints to SVG path with cubic bezier corners
	}

	checkCollision(path, nodes) {}
}
```

**ConnectionTracker**

```javascript
export class ConnectionTracker {
	registerConnection(nodeId, side, pipeId) {}
	getConnectionPoint(nodeId, side, index) {}
	calculateSpacing(nodeId, side) {}
	findAvailableSlot(nodeId, side) {}
}
```

### Web Components

**PipeNode** (HTML element)

```javascript
export class PipeNode extends HTMLElement {
	constructor() {
		this.nodeId = crypto.randomUUID();
		this.position = { x: 0, y: 0 };
		this.connections = { top: [], bottom: [], left: [], right: [] };
	}

	showConnectionPoint(side) {
		// Display + icon at side center
	}

	hideConnectionPoints() {}

	highlightValidTargets() {}
}
```

### SVG Structure

```html
<div class="pipeline-canvas">
	<svg class="pipes-layer" style="pointer-events: none; position: absolute; top: 0; left: 0;">
		<defs>
			<filter id="pipe-shadow"><!-- shadow effect --></filter>
		</defs>

		<g class="pipe-group" data-pipe-id="pipe-1">
			<path class="pipe-path" d="M..." stroke-width="10" />
			<path class="pipe-joint-1" d="M..." />
			<!-- elbow patch -->
			<path class="pipe-joint-2" d="M..." />
		</g>
	</svg>

	<div class="nodes-layer">
		<pipe-node id="node-1" style="left: 100px; top: 100px;"></pipe-node>
		<pipe-node id="node-2" style="left: 100px; top: 300px;"></pipe-node>
	</div>
</div>
```

## Interaction Flows

### Creating a Pipe

```
1. User hovers over NodeA bottom edge
2. Show + icon at center of bottom edge
3. User clicks + icon
4. Pipe creation starts, temp pipe follows mouse
5. User hovers over NodeB
6. Highlight NodeB top edge (valid connection)
7. User releases on NodeB top
8. System:
   - Calculates orthogonal path
   - Checks for collisions
   - Adds avoidance waypoints if needed
   - Generates SVG path with corner curves
   - Renders final pipe
```

### Dragging a Node

```
1. User clicks NodeA
2. Mouse down event
3. Start requestAnimationFrame loop
4. On each frame:
   - Update NodeA position
   - Recalculate all connected pipe paths
   - Update SVG paths
5. Mouse up event
6. Stop animation loop
7. Save new position
```

### Deleting a Pipe

```
1. User hovers over pipe
2. Show delete icon (×) near source connection
3. User clicks delete icon
4. Remove pipe from ConnectionTracker
5. Remove SVG elements
6. Update affected nodes
```

## Path Calculation Algorithm

```javascript
function calculatePath(source, target, obstacles) {
	// 1. Get start/end points
	const start = getConnectionPoint(source);
	const end = getConnectionPoint(target);

	// 2. Try direct path (vertical then horizontal)
	let waypoints = [start, { x: start.x, y: end.y }, end];

	// 3. Check for collisions
	if (pathIntersectsNodes(waypoints, obstacles)) {
		// 4. Add avoidance waypoints
		waypoints = calculateAvoidancePath(start, end, obstacles);
	}

	// 5. Convert to SVG path with curves at corners
	return generateSVGPathWithCurves(waypoints);
}

function generateSVGPathWithCurves(waypoints) {
	let path = `M ${waypoints[0].x},${waypoints[0].y}`;

	for (let i = 1; i < waypoints.length - 1; i++) {
		const prev = waypoints[i - 1];
		const curr = waypoints[i];
		const next = waypoints[i + 1];

		// Straight line to near corner
		const beforeCorner = moveTowards(curr, prev, 15);
		path += ` L ${beforeCorner.x},${beforeCorner.y}`;

		// Cubic bezier around corner
		const afterCorner = moveTowards(curr, next, 15);
		path += ` C ${curr.x},${curr.y} ${curr.x},${curr.y} ${afterCorner.x},${afterCorner.y}`;
	}

	// Final line to end
	path += ` L ${waypoints[waypoints.length - 1].x},${waypoints[waypoints.length - 1].y}`;

	return path;
}
```

## Styling Requirements

### Pipe Styles

```css
.pipe-path {
	stroke: var(--pipe-color, #6b7280);
	stroke-width: 10;
	fill: none;
	stroke-linecap: round;
	stroke-linejoin: round;
	filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.pipe-joint {
	stroke: var(--pipe-color, #6b7280);
	stroke-width: 12;
	fill: none;
	opacity: 0.3;
	stroke-linecap: round;
}

.pipe-group:hover .pipe-path {
	stroke: var(--accent-color);
}
```

### Node Styles

```css
pipe-node {
	position: absolute;
	width: 200px;
	padding: 1em;
	background: var(--bg-primary);
	border: 2px solid var(--border-color);
	border-radius: 0.5em;
	cursor: move;

	&.dragging {
		opacity: 0.8;
		z-index: 1000;
	}

	.connection-point {
		position: absolute;
		width: 24px;
		height: 24px;
		background: var(--accent-color);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.2s;

		&::after {
			content: "+";
			color: white;
			font-size: 18px;
			font-weight: bold;
		}
	}

	&:hover .connection-point {
		opacity: 1;
	}
}
```

## Data Format

### Export JSON

```json
{
	"id": "pipeline-123",
	"title": "My Pipeline",
	"nodes": [
		{
			"id": "node-1",
			"type": "http_request",
			"title": "Fetch API",
			"position": { "x": 100, "y": 100 },
			"config": { "url": "https://api.example.com" }
		},
		{
			"id": "node-2",
			"type": "parse",
			"title": "Parse JSON",
			"position": { "x": 100, "y": 300 }
		}
	],
	"pipes": [
		{
			"id": "pipe-1",
			"sourceId": "node-1",
			"sourceSide": "bottom",
			"sourceIndex": 0,
			"targetId": "node-2",
			"targetSide": "top",
			"targetIndex": 0,
			"path": "M 150,150 L 150,280 C 150,295 150,295 150,300"
		}
	]
}
```

## Testing Scenarios

Verify these work correctly:

- [ ] Drag node from palette, drop on canvas
- [ ] Create pipe from NodeA bottom to NodeB top
- [ ] Drag NodeA, pipes update smoothly (60fps)
- [ ] Two pipes on same node side maintain 30px spacing
- [ ] Pipe routes around obstacle node
- [ ] Delete pipe by clicking × icon
- [ ] Export to JSON, import back, visual matches
- [ ] NodeA above NodeB auto-connects bottom-to-top
- [ ] NodeA below NodeB auto-connects top-to-bottom
- [ ] Pipes have smooth corners (cubic bezier)
- [ ] Joints have decorative patch overlay
- [ ] No pipes overlap nodes
- [ ] Connection points only show on hover
- [ ] Keyboard shortcuts work (Delete, Ctrl+Z)

## Success Criteria

Implementation is complete when:

- ✅ Nodes drag smoothly (60fps with requestAnimationFrame)
- ✅ Pipes look realistic (thick, 90° bends, smooth corners)
- ✅ Smart auto-routing (no user confusion about sides)
- ✅ Multiple connections space correctly (30px min)
- ✅ Collision avoidance works (pipes route around nodes)
- ✅ Export/import preserves layout
- ✅ All interactions feel responsive
- ✅ Code follows guidelines (classes, concise, JSDoc)
- ✅ SVG layer has pointer-events: none
- ✅ Works in Chrome 140+

Let's build a professional pipeline editor that feels like industrial design software! 🔧
