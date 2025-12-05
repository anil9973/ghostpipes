# Design Document

## Overview

The Pipeline Builder is a sophisticated visual editor that combines HTML-based node rendering with SVG-based pipe rendering to create an intuitive drag-and-drop interface for building automation pipelines. The system uses a layered architecture where nodes exist as HTML elements in the DOM for easy interaction, while pipes are rendered as SVG paths in a separate layer for precise geometric control. The design emphasizes performance (60fps during interactions), visual realism (industrial pipe styling), and intelligent automation (automatic connection side detection, collision avoidance).

## Architecture

### Layer Architecture

The canvas uses a two-layer approach:

1. **SVG Layer (Bottom)**: Contains all pipe paths, rendered with `pointer-events: none` to allow click-through to nodes
2. **HTML Layer (Top)**: Contains all node elements as positioned HTML elements with full interactivity

This separation allows nodes to be implemented as standard web components with normal DOM interactions while pipes benefit from SVG's precise path rendering capabilities.

### Component Hierarchy

```
PipelineCanvas (Coordinator)
├── NodeManager (Node lifecycle and positioning)
├── PipeManager (Pipe creation and rendering)
├── ConnectionTracker (Connection point allocation)
├── PathCalculator (Orthogonal routing and collision avoidance)
└── InteractionHandler (Mouse/keyboard event coordination)
```

### Data Flow

1. User interaction → InteractionHandler
2. InteractionHandler → Appropriate manager (NodeManager or PipeManager)
3. Manager updates data model
4. Manager triggers render updates
5. ConnectionTracker recalculates connection points if needed
6. PathCalculator generates new pipe paths if needed
7. DOM/SVG updates reflect changes

## Components and Interfaces

### PipelineCanvas

Main coordinator class that initializes and manages all subsystems.

```javascript
export class PipelineCanvas {
	/** @param {HTMLElement} containerElement */
	constructor(containerElement) {}

	/** @param {string} type @param {{x: number, y: number}} position @returns {string} nodeId */
	addNode(type, position) {}

	/** @param {string} sourceId @param {string} targetId @returns {string} pipeId */
	createPipe(sourceId, targetId) {}

	/** @param {string} nodeId */
	deleteNode(nodeId) {}

	/** @param {string} pipeId */
	deletePipe(pipeId) {}

	/** @returns {Object} Pipeline JSON */
	export() {}

	/** @param {Object} data */
	import(data) {}
}
```

### NodeManager

Manages node lifecycle, positioning, and bounds calculation.

```javascript
export class NodeManager {
	/** @param {PipelineCanvas} canvas */
	constructor(canvas) {}

	/** @param {string} type @param {{x: number, y: number}} position @returns {PipeNode} */
	createNode(type, position) {}

	/** @param {string} nodeId @param {{x: number, y: number}} newPosition */
	moveNode(nodeId, newPosition) {}

	/** @param {string} nodeId */
	deleteNode(nodeId) {}

	/** @param {string} nodeId @returns {{x: number, y: number, width: number, height: number}} */
	getNodeBounds(nodeId) {}

	/** @param {string} nodeId @returns {PipeNode} */
	getNode(nodeId) {}

	/** @returns {Array<PipeNode>} */
	getAllNodes() {}
}
```

### PipeManager

Manages pipe creation, rendering, and deletion.

```javascript
export class PipeManager {
	/** @param {PipelineCanvas} canvas */
	constructor(canvas) {}

	/** @param {string} sourceId @param {string} side */
	startPipeCreation(sourceId, side) {}

	/** @param {{x: number, y: number}} mousePosition */
	updateTempPipe(mousePosition) {}

	/** @param {string} targetId @param {string} side @returns {string} pipeId */
	finishPipeCreation(targetId, side) {}

	cancelPipeCreation() {}

	/** @param {string} pipeId */
	deletePipe(pipeId) {}

	/** @param {string} pipeId */
	redrawPipe(pipeId) {}

	/** @param {string} nodeId */
	redrawNodePipes(nodeId) {}
}
```

### ConnectionTracker

Tracks which pipes connect to which node sides and calculates connection point positions.

```javascript
export class ConnectionTracker {
	constructor() {}

	/** @param {string} nodeId @param {string} side @param {string} pipeId @returns {number} index */
	registerConnection(nodeId, side, pipeId) {}

	/** @param {string} nodeId @param {string} side @param {string} pipeId */
	unregisterConnection(nodeId, side, pipeId) {}

	/** @param {string} nodeId @param {string} side @param {number} index @param {{x: number, y: number, width: number, height: number}} bounds @returns {{x: number, y: number}} */
	getConnectionPoint(nodeId, side, index, bounds) {}

	/** @param {string} nodeId @param {string} side @returns {number} */
	getConnectionCount(nodeId, side) {}
}
```

### PathCalculator

Calculates orthogonal pipe paths with collision avoidance.

```javascript
export class PathCalculator {
	/** @param {NodeManager} nodeManager */
	constructor(nodeManager) {}

	/** @param {{x: number, y: number}} start @param {{x: number, y: number}} end @param {Array<Object>} obstacles @returns {Array<{x: number, y: number}>} */
	calculateOrthogonalPath(start, end, obstacles) {}

	/** @param {Array<{x: number, y: number}>} waypoints @returns {string} SVG path */
	generateSVGPath(waypoints) {}

	/** @param {Array<{x: number, y: number}>} waypoints @param {Array<Object>} nodes @returns {boolean} */
	checkCollision(waypoints, nodes) {}

	/** @param {{x: number, y: number}} start @param {{x: number, y: number}} end @param {Array<Object>} obstacles @returns {Array<{x: number, y: number}>} */
	calculateAvoidancePath(start, end, obstacles) {}
}
```

### InteractionHandler

Coordinates all user interactions including drag-and-drop, pipe creation, and keyboard shortcuts.

```javascript
export class InteractionHandler {
	/** @param {PipelineCanvas} canvas */
	constructor(canvas) {}

	/** @param {MouseEvent} event */
	handleNodeDragStart(event) {}

	/** @param {MouseEvent} event */
	handleNodeDrag(event) {}

	/** @param {MouseEvent} event */
	handleNodeDragEnd(event) {}

	/** @param {MouseEvent} event @param {string} nodeId @param {string} side */
	handleConnectionPointClick(event, nodeId, side) {}

	/** @param {KeyboardEvent} event */
	handleKeyboard(event) {}
}
```

### PipeNode (Web Component)

HTML custom element representing a pipeline node.

```javascript
export class PipeNode extends HTMLElement {
	constructor() {}

	/** @param {string} side */
	showConnectionPoint(side) {}

	hideConnectionPoints() {}

	/** @param {string} side */
	highlightSide(side) {}

	removeHighlight() {}

	/** @returns {{x: number, y: number}} */
	getPosition() {}

	/** @param {{x: number, y: number}} position */
	setPosition(position) {}

	/** @returns {{x: number, y: number, width: number, height: number}} */
	getBounds() {}
}
```

## Data Models

### Pipeline Data Model

```javascript
export class Pipeline {
	/** @param {Object} init */
	constructor(init = {}) {
		this.id = init.id || crypto.randomUUID();
		this.title = init.title || "Untitled Pipeline";
		this.nodes = init.nodes || [];
		this.pipes = init.pipes || [];
		this.createdAt = init.createdAt || Date.now();
		this.updatedAt = init.updatedAt || Date.now();
	}
}
```

### Node Data Model

```javascript
export class NodeData {
	/** @param {Object} init */
	constructor(init = {}) {
		this.id = init.id || crypto.randomUUID();
		this.type = init.type || "default";
		this.title = init.title || "Untitled Node";
		this.position = init.position || { x: 0, y: 0 };
		this.config = init.config || {};
	}
}
```

### Pipe Data Model

```javascript
export class PipeData {
	/** @param {Object} init */
	constructor(init = {}) {
		this.id = init.id || crypto.randomUUID();
		this.sourceId = init.sourceId;
		this.sourceSide = init.sourceSide;
		this.sourceIndex = init.sourceIndex || 0;
		this.targetId = init.targetId;
		this.targetSide = init.targetSide;
		this.targetIndex = init.targetIndex || 0;
		this.path = init.path || "";
	}
}
```

### Connection Point Model

```javascript
export class ConnectionPoint {
	/** @param {Object} init */
	constructor(init = {}) {
		this.nodeId = init.nodeId;
		this.side = init.side; // 'top' | 'bottom' | 'left' | 'right'
		this.index = init.index || 0;
		this.pipeId = init.pipeId;
		this.position = init.position || { x: 0, y: 0 };
	}
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Node drag triggers pipe recalculation at 60fps

_For any_ node with connected pipes, when the node is dragged, all connected pipe paths should be recalculated and the frame rate should remain at or above 60 frames per second.

**Validates: Requirements 1.2, 1.3**

### Property 2: Node position persists after drag

_For any_ node, when it is dragged to a new position and released, the data model should contain the new position coordinates.

**Validates: Requirements 1.4**

### Property 3: Nodes can be positioned freely

_For any_ set of nodes on the canvas, each node should be positionable at arbitrary coordinates without grid constraints or interference from other nodes.

**Validates: Requirements 1.5**

### Property 4: Connection side determination is automatic and consistent

_For any_ pair of nodes, the connection side selection (top/bottom/left/right) should be automatically determined based on their relative positions: source above target connects bottom-to-top, source below connects top-to-bottom, source left connects right-to-left, source right connects left-to-right.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 5: Connection side updates when positions change

_For any_ connected node pair, when a node is moved such that the relative position changes, the connection sides should be recalculated and pipe paths should update accordingly.

**Validates: Requirements 3.5**

### Property 6: Connection point spacing maintains minimum distance

_For any_ node side with multiple connections, the distance between any two adjacent connection points should be at least 30 pixels, and spacing should be recalculated when connections are added or removed.

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 7: Connection points distribute evenly

_For any_ node side with multiple connections, the connection points should be distributed evenly across the available edge width.

**Validates: Requirements 5.4**

### Property 8: Pipe paths use only orthogonal segments

_For any_ rendered pipe, all path segments between corners should be either perfectly horizontal or perfectly vertical (90-degree angles only).

**Validates: Requirements 4.4**

### Property 9: Pipe corners use cubic bezier curves

_For any_ pipe path with corners, each corner should be rendered with a cubic bezier curve with radius between 15-20 pixels.

**Validates: Requirements 4.2**

### Property 10: Collision avoidance produces non-intersecting paths

_For any_ pipe path that would intersect a node, the collision avoidance algorithm should produce an alternative path with added waypoints that does not intersect any node bounds.

**Validates: Requirements 6.1, 6.2**

### Property 11: Optimal path selection minimizes waypoints

_For any_ pipe routing scenario with multiple valid paths, the system should select the path with the fewest waypoints.

**Validates: Requirements 6.3**

### Property 12: Node movement triggers collision rechecking

_For any_ node that is moved, all pipe paths should be recalculated to check for new collisions with the updated node position.

**Validates: Requirements 6.4**

### Property 13: Pipe deletion cleans up all references

_For any_ pipe, when it is deleted, the connection tracker should no longer reference that pipe ID, connection point spacing should be recalculated for affected node sides, and all associated SVG elements should be removed from the DOM.

**Validates: Requirements 7.3, 7.4, 7.5**

### Property 14: Export serializes complete pipeline data

_For any_ pipeline, exporting should produce JSON containing all nodes (with IDs, types, positions, configurations), all pipes (with source, target, sides, paths), and pipeline metadata (ID, title).

**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

### Property 15: Export generates unique IDs

_For any_ exported pipeline JSON, all node IDs and pipe IDs should be unique within the pipeline.

**Validates: Requirements 8.5**

### Property 16: Import creates complete pipeline structure

_For any_ valid pipeline JSON, importing should create all nodes at their specified positions and all pipes with their specified connections.

**Validates: Requirements 9.1, 9.2**

### Property 17: Import recalculates pipe paths

_For any_ imported pipeline, all pipe paths should be recalculated to ensure they match the current node positions.

**Validates: Requirements 9.3**

### Property 18: Import clears existing canvas

_For any_ import operation, the canvas should be cleared of all existing nodes and pipes before rendering the imported pipeline.

**Validates: Requirements 9.5**

### Property 19: Round trip preserves pipeline structure

_For any_ valid pipeline, exporting to JSON and then importing that JSON should produce a pipeline with the same number of nodes, same number of pipes, and same connection relationships.

**Validates: Requirements 8.1, 8.2, 9.1, 9.2**

## Error Handling

### Node Creation Errors

- **Invalid node type**: Log error and return null, do not create node
- **Invalid position**: Clamp position to canvas bounds
- **Duplicate node ID**: Generate new unique ID

### Pipe Creation Errors

- **Source equals target**: Display user message "Cannot connect node to itself"
- **Connection already exists**: Display user message "Connection already exists"
- **Invalid node reference**: Log error and cancel pipe creation

### Path Calculation Errors

- **No collision-free path found**: Use shortest path and log warning
- **Invalid waypoints**: Fall back to direct path
- **Calculation timeout**: Use cached path or direct path

### Import Errors

- **Invalid JSON format**: Display error message "Invalid pipeline format"
- **Missing required fields**: Display error message "Pipeline data is incomplete"
- **Invalid node/pipe references**: Skip invalid items and log warnings

### Performance Degradation

- **Frame rate drops below 30fps**: Throttle pipe recalculation to every other frame
- **Too many nodes (>100)**: Display warning about performance impact
- **Too many pipes (>200)**: Implement viewport culling for off-screen pipes

## Testing Strategy

### Unit Testing

The system will use standard JavaScript unit testing with a focus on:

- **PathCalculator**: Test orthogonal path generation, collision detection, SVG path string generation
- **ConnectionTracker**: Test connection registration, point calculation, spacing algorithms
- **Data Models**: Test serialization, deserialization, validation

### Property-Based Testing

The system will use **fast-check** (JavaScript property-based testing library) to verify correctness properties. Each property-based test will run a minimum of 100 iterations with randomly generated inputs.

Property-based tests will be tagged with comments in this format: `**Feature: pipeline-builder, Property {number}: {property_text}**`

Key property-based tests:

1. **Node position updates**: Generate random node positions and verify all connected pipes recalculate
2. **Connection side consistency**: Generate random node pairs and verify side selection is deterministic
3. **Connection spacing**: Generate random numbers of connections and verify minimum spacing
4. **Orthogonal paths**: Generate random waypoints and verify all segments are horizontal or vertical
5. **Round trip serialization**: Generate random pipelines and verify export-import preserves structure
6. **Collision avoidance**: Generate random node layouts and verify paths don't intersect nodes

### Integration Testing

- **Full pipeline creation flow**: Create nodes, connect with pipes, verify visual output
- **Drag and drop**: Simulate drag operations, verify position updates and pipe recalculation
- **Import/export**: Create pipeline, export, clear canvas, import, verify match
- **Performance**: Create large pipeline (50+ nodes), measure frame rate during drag operations

### Visual Regression Testing

- Capture screenshots of various pipeline configurations
- Compare against baseline images to detect unintended visual changes
- Test pipe rendering (corners, joints, shadows)
- Test node positioning and connection points

## Performance Optimizations

### RequestAnimationFrame for Drag Operations

All node drag operations use `requestAnimationFrame` to ensure smooth 60fps updates:

```javascript
handleNodeDrag(event) {
  if (!this.dragAnimationId) {
    this.dragAnimationId = requestAnimationFrame(() => {
      this.updateNodePosition(event);
      this.dragAnimationId = null;
    });
  }
}
```

### Debounced Path Recalculation

Path recalculation is debounced to 16ms (one frame) to avoid excessive computation:

```javascript
debouncedRecalculate = debounce(() => {
	this.recalculateAllPaths();
}, 16);
```

### Viewport Culling

For large pipelines, only render pipes that are visible in the current viewport:

```javascript
cullOffscreenPipes() {
  const viewport = this.getViewportBounds();
  this.pipes.forEach(pipe => {
    const visible = this.isPipeInViewport(pipe, viewport);
    pipe.element.style.display = visible ? 'block' : 'none';
  });
}
```

### Connection Point Caching

Connection point positions are cached and only recalculated when node positions change or connections are added/removed.

### SVG Path String Caching

Generated SVG path strings are cached with node positions as cache keys to avoid redundant path generation.

## Styling and Visual Design

### Pipe Styling

- **Stroke width**: 10px for main pipe path
- **Stroke color**: `var(--pipe-color, #6b7280)` (customizable via CSS variables)
- **Corner radius**: 15-20px cubic bezier curves
- **Shadow**: `drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))`
- **Joint overlay**: 12px stroke width at 30% opacity

### Node Styling

- **Size**: 200px width, auto height based on content
- **Background**: `var(--bg-primary)`
- **Border**: 2px solid with customizable color
- **Border radius**: 0.5em
- **Cursor**: `move` to indicate draggability
- **Dragging state**: 0.8 opacity, z-index 1000

### Connection Point Styling

- **Size**: 24px × 24px circular button
- **Background**: `var(--accent-color)`
- **Icon**: "+" symbol in white
- **Visibility**: Hidden by default, visible on node hover
- **Transition**: 0.2s opacity fade

### Hover States

- **Node hover**: Show connection points
- **Pipe hover**: Change stroke color to accent color, show delete icon
- **Connection point hover**: Scale to 1.1x, increase brightness

## Accessibility Considerations

- All interactive elements (nodes, connection points, delete buttons) have keyboard focus support
- Pipe creation can be triggered via keyboard (Enter key on focused connection point)
- Screen reader announcements for node creation, pipe creation, and deletion
- High contrast mode support with increased stroke widths and distinct colors
- Focus indicators visible on all interactive elements
