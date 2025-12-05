# GhostPipes Visual Pipeline Builder Specification

## Overview

Professional SVG-based visual pipeline editor with realistic pipe connections, drag-and-drop node placement, and smooth interactions. Inspired by industrial pipe systems with clean,

realistic visual design.

## Core Requirements

### Visual Design

**Nodes**: HTML elements with custom styling (not SVG)
**Pipes**: SVG paths with realistic industrial pipe appearance
**Joints**: Small cubic bezier curves at elbows (10-20px radius)
**Thickness**: ~10px pipe width for clear visibility
**Style**: Clean industrial look, no arrows, no dashed lines

### Node System

#### Node Structure

```javascript
class PipeNode extends HTMLElement {
  position: { x, y }
  title: string
  type: string
  connections: {
    top: Connection[],
    bottom: Connection[],
    left: Connection[],
    right: Connection[]
  }
}
```

#### Connection Points

- Each side (top/bottom/left/right) can have multiple connections
- Minimum spacing between connection points: 30px
- Connection points only visible on hover
- Plus icon (+) appears at hovered side center

### Pipe Routing

#### Connection Rules

1. **Vertical Flow Priority**

   - If source node is above target → connect bottom-to-top
   - If source node is below target → connect top-to-bottom
   - Automatically determine correct sides (no user confusion)

2. **90° Bends Only**

   - Pipes bend at right angles (no curves except at joints)
   - Path segments: horizontal or vertical only
   - Small cubic bezier (10-20px) at each bend for smooth corners

3. **Collision Avoidance**

   - Pipes cannot overlap nodes
   - Pipes route around obstacles with additional bends
   - Maintain minimum clearance (20px) from nodes

4. **Joint Visibility**
   - Every pipe segment clearly visible from start to end
   - Joints (elbows) have small decorative patch (layered SVG)
   - T-joints where pipes meet nodes show clear connection

#### Path Calculation Algorithm

1. Determine source/target sides based on relative position
2. Calculate start point on source node
3. Calculate end point on target node
4. Find shortest orthogonal path with bends
5. Check for node collisions
6. Add avoidance waypoints if needed
7. Generate SVG path with cubic bezier at corners

### Interaction Model

#### Node Placement

- Drag nodes from sidebar palette
- Drop onto canvas at mouse position
- Snap to grid (optional, 20px grid)

#### Pipe Creation

1. Hover over node side → show + icon at center of that side
2. Mouse down on + icon
3. Drag to create temporary pipe (follows mouse)
4. Hover over target node → highlight valid connection points
5. Release on valid target → create permanent pipe
6. Release on invalid target → cancel pipe creation

#### Node Dragging

- Click and drag node to move
- All connected pipes update in real-time
- Use `requestAnimationFrame` for smooth 60fps animation
- Pipes recalculate paths during drag

#### Pipe Management

- Hover over pipe → show delete icon (×) near source connection
- Click delete icon → remove pipe
- Click and drag delete icon → reconnect pipe to different node

### SVG Layer Architecture

```
<div class="pipeline-canvas">
  <svg class="pipes-layer" style="pointer-events: none">
    <!-- All pipes drawn here -->
    <g class="pipe-group" data-pipe-id="...">
      <path class="pipe-path" />
      <path class="pipe-joint" /> <!-- decorative patch -->
    </g>
  </svg>

  <div class="nodes-layer">
    <!-- Node HTML elements -->
    <pipe-node></pipe-node>
  </div>
</div>
```

### Pipe Visual Structure

#### Main Pipe Path

```svg
<path
  class="pipe-path"
  d="M x1,y1 L x2,y1 C ...,... ...,... x2,y2 L x2,y3"
  stroke-width="10"
  fill="none"
/>
```

#### Joint Patch (at each elbow)

```svg
<path
  class="pipe-joint"
  d="M ... C ... ... ... C ... ... ..."
  stroke-width="12"
  opacity="0.3"
/>
```

### Connection Point Management

#### Spacing Algorithm

```javascript
calculateConnectionPoints(side, connectionCount) {
  const nodeWidth = 200;
  const spacing = 30; // minimum
  const available = nodeWidth - (spacing * 2);
  const gap = available / (connectionCount + 1);

  return Array.from({ length: connectionCount }, (_, i) =>
    spacing + gap * (i + 1)
  );
}
```

#### Collision Detection

- Track all existing connection points per side
- When adding new connection, find nearest available slot
- Maintain minimum 30px spacing between pipes

### Data Model

#### Pipeline JSON Format

```json
{
	"id": "pipeline-uuid",
	"title": "My Pipeline",
	"nodes": [
		{
			"id": "node-1",
			"type": "http_request",
			"title": "Fetch Data",
			"position": { "x": 100, "y": 100 },
			"config": {}
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
			"targetIndex": 0
		}
	]
}
```

### Performance Optimizations

1. **Pipe Rendering**

   - Batch SVG updates
   - Use `requestAnimationFrame` for drag operations
   - Debounce path recalculation (16ms)

2. **DOM Management**

   - Virtual scrolling for large canvases
   - Off-screen node culling
   - Event delegation for interactions

3. **Memory**
   - Reuse SVG paths (update d attribute only)
   - Clear old paths on pipe deletion
   - Throttle hover events

### Keyboard Shortcuts

- `Delete`: Remove selected node/pipe
- `Ctrl+Z`: Undo
- `Ctrl+Y`: Redo
- `Ctrl+C`: Copy selected
- `Ctrl+V`: Paste
- `Space+Drag`: Pan canvas

### Accessibility

- Keyboard navigation between nodes
- Screen reader announcements for connections
- High contrast mode support
- Focus indicators on connection points

## Implementation Architecture

### Class Structure

```
PipelineCanvas (main coordinator)
├── NodeManager (node placement, dragging)
├── PipeManager (pipe creation, routing)
├── ConnectionTracker (manages connection points)
├── PathCalculator (orthogonal routing algorithm)
└── InteractionHandler (mouse/touch events)
```

### Files Organization

```
src/
├── pipeline-builder/
│   ├── canvas.js          # Main PipelineCanvas class
│   ├── node-manager.js    # Node operations
│   ├── pipe-manager.js    # Pipe creation/deletion
│   ├── path-calculator.js # Routing algorithm
│   ├── connection-tracker.js # Connection point management
│   └── interaction-handler.js # Event handling
├── components/
│   ├── pipe-node.js       # Node web component
│   └── node-palette.js    # Sidebar palette
└── styles/
    ├── pipeline-canvas.css
    └── pipe-node.css
```

## Technical Constraints

- **Browser**: Chrome 140+ only
- **No external libraries**: Pure vanilla JS
- **Web Components**: Custom elements without shadow DOM
- **Modern CSS**: Nesting, light-dark(), container queries
- **ES Modules**: All files use import/export

## Visual Reference

### Pipe Joint Detail

```
Normal corner:     With decorative patch:
  │                  │
  │                  │╭─  ← small patch overlay
  └────              └────
```

### Connection Point Spacing

```
Node Top Edge:
├──30px──┼──30px──┼──30px──┤
         ○        ○          (connection points)
```

### Node with Multiple Connections

```
    NodeA (top)
       │  │
       │  │
       │  └──────┐
       │         │
    NodeB     NodeC
```

## Error States

1. **Invalid Connection**: Flash red, show tooltip
2. **Collision Detected**: Auto-route around obstacle
3. **Maximum Connections**: Disable + icon, show warning
4. **Orphaned Node**: Highlight in yellow

## Export/Import

### Export

- JSON format with all nodes and pipes
- Optional: Export as PNG image
- Optional: Export executable pipeline definition

### Import

- Load JSON and recreate visual layout
- Validate node types and connections
- Auto-layout if positions missing
