# Design Document

## Overview

The Pipeline Canvas Editor Upgrades feature enhances the visual pipeline editor with professional-grade navigation and workspace management capabilities. The design introduces a layered architecture separating zoom/pan transformations from node positioning, implements efficient canvas expansion algorithms, and provides intuitive node deletion workflows with proper cleanup.

The implementation leverages CSS transforms for performant zoom/pan operations, uses browser storage APIs for state persistence, and integrates seamlessly with the existing PipelineEditor and PipelineCanvas architecture.

## Architecture

### Component Hierarchy

```
PipelineCanvas (Web Component)
├── CanvasViewport (New Service)
│   ├── ZoomController
│   ├── PanController
│   └── ViewportState
├── PipelineEditor (Existing)
│   ├── Node Management
│   ├── Pipe Rendering
│   └── Event Handling
└── CanvasExpansion (New Service)
    ├── Boundary Detection
    └── Expansion Logic
```

### Data Flow

```
User Input (Mouse/Keyboard)
    ↓
Event Handlers (PipelineCanvas)
    ↓
CanvasViewport Service
    ↓
Transform Calculation
    ↓
CSS Transform Application
    ↓
Pipe Re-rendering (PipelineEditor)
    ↓
State Persistence (LocalStorage)
```

## Components and Interfaces

### 1. CanvasViewport Service

Manages all viewport transformations including zoom and pan operations.

```javascript
class CanvasViewport {
  /** @param {HTMLElement} canvas - The pipeline canvas element */
  constructor(canvas);

  /** @param {number} delta - Zoom direction (-1 or 1) */
  /** @param {{x: number, y: number}} center - Zoom center point */
  zoom(delta, center);

  /** @param {number} level - Target zoom level (0.25 to 2.0) */
  setZoomLevel(level);

  /** @returns {number} Current zoom level as decimal */
  getZoomLevel();

  /** @param {{x: number, y: number}} delta - Pan offset */
  pan(delta);

  /** Reset viewport to origin */
  reset();

  /** @returns {{x: number, y: number, zoom: number}} */
  getState();

  /** @param {{x: number, y: number, zoom: number}} state */
  setState(state);
}
```

### 2. ZoomController

Handles zoom level calculations and constraints.

```javascript
class ZoomController {
  static LEVELS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  static MIN = 0.25;
  static MAX = 2.0;

  /** @param {number} current - Current zoom level */
  /** @param {number} delta - Direction (-1 or 1) */
  /** @returns {number} Next valid zoom level */
  static getNextLevel(current, delta);

  /** @param {number} level - Proposed zoom level */
  /** @returns {number} Clamped zoom level */
  static clamp(level);

  /** @param {number} level - Zoom level */
  /** @returns {string} CSS transform string */
  static toTransform(level);
}
```

### 3. PanController

Manages pan operations and boundary enforcement.

```javascript
class PanController {
  /** @param {HTMLElement} canvas */
  constructor(canvas);

  /** @param {{x: number, y: number}} delta */
  /** @returns {{x: number, y: number}} Constrained delta */
  constrainPan(delta);

  /** @returns {{minX: number, maxX: number, minY: number, maxY: number}} */
  getBoundaries();

  /** @param {{x: number, y: number}} position */
  /** @returns {boolean} */
  isWithinBounds(position);
}
```

### 4. CanvasExpansion Service

Detects when expansion is needed and performs canvas resizing.

```javascript
class CanvasExpansion {
  static EXPANSION_INCREMENT = 500;
  static EXPANSION_THRESHOLD = 0.9;
  static MAX_HEIGHT = 10000;

  /** @param {HTMLElement} canvas */
  constructor(canvas);

  /** @param {{x: number, y: number}} nodePosition */
  /** @returns {boolean} True if expansion occurred */
  checkAndExpand(nodePosition);

  /** @returns {number} Current canvas height */
  getCurrentHeight();

  /** @param {number} newHeight */
  expandTo(newHeight);
}
```

### 5. NodeDeletion Enhancement

Extends existing node deletion with confirmation and visual feedback.

```javascript
class NodeDeletionHandler {
  /** @param {PipelineEditor} editor */
  constructor(editor);

  /** @param {string} nodeId */
  /** @returns {Promise<boolean>} True if deleted */
  async deleteNode(nodeId);

  /** @param {string} nodeId */
  /** @returns {boolean} True if node has connections */
  hasConnections(nodeId);

  /** @param {string} nodeId */
  /** @returns {Promise<boolean>} User confirmation result */
  async confirmDeletion(nodeId);
}
```

## Data Models

### ViewportState

```javascript
class ViewportState {
  /** @type {number} Zoom level (0.25 to 2.0) */
  zoom = 1.0;

  /** @type {number} Pan offset X */
  panX = 0;

  /** @type {number} Pan offset Y */
  panY = 0;

  /** @type {string} Pipeline ID for persistence */
  pipelineId = null;

  /** Serialize for storage */
  toJSON();

  /** @param {Object} data */
  static fromJSON(data);
}
```

### CanvasMetrics

```javascript
class CanvasMetrics {
  /** @type {number} Current canvas width */
  width;

  /** @type {number} Current canvas height */
  height;

  /** @type {{x: number, y: number}} Furthest node position */
  maxNodePosition;

  /** @type {number} Number of nodes */
  nodeCount;

  /** Calculate from current canvas state */
  static calculate(canvas);
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated:

- Properties 1.4 and 2.6 both test that transformations don't affect node positions - combine into single invariant
- Properties 4.6 and 7.4 are identical - keep only one
- Properties 3.2 and 8.4 both test expansion notifications - combine
- Zoom boundary tests (1.7, 3.3) are edge cases that will be covered by property test generators
- Several cursor and styling properties (8.2, 8.3, 8.5, 8.6) can be combined into a visual feedback property

### Correctness Properties

Property 1: Zoom preserves node absolute positions
_For any_ canvas with nodes at specific coordinates, applying any zoom level change should result in nodes maintaining their exact x,y positions in the coordinate system
**Validates: Requirements 1.4, 2.6**

Property 2: Zoom levels are discrete
_For any_ zoom operation (wheel scroll or button click), the resulting zoom level should be exactly one of: 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, or 2.0
**Validates: Requirements 1.3**

Property 3: Zoom centers correctly
_For any_ mouse wheel zoom at position (x, y), the point under the cursor should remain visually stationary after the zoom completes
**Validates: Requirements 1.1**

Property 4: Pipes follow nodes through transformations
_For any_ canvas with connected nodes, after any zoom or pan operation, all pipe endpoints should align with their respective node port positions
**Validates: Requirements 1.5**

Property 5: Zoom UI reflects actual state
_For any_ zoom level, the displayed zoom percentage in the UI should equal the actual zoom level multiplied by 100
**Validates: Requirements 1.6**

Property 6: Pan mode prevents node interaction
_For any_ drag operation in pan mode (spacebar held or empty space drag), node positions should remain unchanged regardless of cursor position
**Validates: Requirements 2.4**

Property 7: Pan boundaries are enforced
_For any_ pan operation, the resulting pan offset should satisfy: panX >= -500 AND panX <= (maxNodeX + 500) AND panY >= -500 AND panY <= (maxNodeY + 500)
**Validates: Requirements 6.1, 6.2**

Property 8: Canvas expansion triggers at threshold
_For any_ node placement or drag operation, if the node's y-coordinate exceeds 0.9 \* canvasHeight AND canvasHeight < 10000, then canvas height should increase by 500 pixels
**Validates: Requirements 3.1, 3.5**

Property 9: Expansion preserves content
_For any_ canvas expansion operation, all node positions and pipe connections should remain identical before and after expansion
**Validates: Requirements 3.4**

Property 10: Node deletion cleans up connections
_For any_ node deletion, all pipes connected to that node should be removed, and all connected nodes should have the deleted pipe IDs removed from their socket arrays
**Validates: Requirements 4.4, 4.7**

Property 11: Deletion confirmation for connected nodes
_For any_ node with at least one connection, clicking the delete icon should display a confirmation dialog before deletion occurs
**Validates: Requirements 4.3**

Property 12: Database synchronization on deletion
_For any_ node deletion that completes successfully, querying IndexedDB for that node ID should return null
**Validates: Requirements 4.5**

Property 13: Zoom persistence round-trip
_For any_ pipeline and zoom level, setting the zoom level, then reloading the pipeline should restore the exact same zoom level
**Validates: Requirements 5.1, 5.2**

Property 14: Zoom isolation per pipeline
_For any_ two different pipelines, changing the zoom level in one pipeline should not affect the zoom level of the other pipeline
**Validates: Requirements 5.4**

Property 15: Keyboard shortcuts modify state correctly
_For any_ canvas state, pressing Ctrl+Plus should increase zoom to the next level, Ctrl+Minus should decrease to the previous level, and Ctrl+0 should set zoom to 1.0
**Validates: Requirements 7.1, 7.2, 7.3**

Property 16: Delete key triggers deletion
_For any_ selected node, pressing the Delete key should initiate the same deletion process as clicking the delete icon
**Validates: Requirements 4.6**

Property 17: Visual feedback matches state
_For any_ canvas operation (zoom, pan, hover), the cursor style and visual indicators should accurately reflect the current interaction mode
**Validates: Requirements 2.3, 8.2, 8.3, 8.5, 8.6**

Property 18: Zoom animation timing is consistent
_For any_ zoom operation, the CSS transition duration should be set to 200ms
**Validates: Requirements 8.1**

## Error Handling

### Zoom Errors

1. **Invalid Zoom Level**: If a zoom level outside 0.25-2.0 is requested, clamp to nearest valid level
2. **Zoom Calculation Overflow**: If zoom calculations result in NaN or Infinity, reset to 1.0
3. **Transform Application Failure**: If CSS transform fails to apply, log error and maintain previous state

### Pan Errors

1. **Boundary Calculation Failure**: If node positions cannot be determined, use default 2000x2000 boundary
2. **Pan State Corruption**: If pan offset becomes NaN, reset to (0, 0)
3. **Cursor Update Failure**: If cursor style cannot be set, continue operation without visual feedback

### Expansion Errors

1. **Maximum Height Exceeded**: If expansion would exceed 10000px, cap at maximum and show warning
2. **Height Calculation Error**: If current height cannot be determined, use default 3000px
3. **Expansion During Zoom**: If expansion is triggered during zoom operation, queue expansion for after zoom completes

### Deletion Errors

1. **Node Not Found**: If deletion is requested for non-existent node, log warning and continue
2. **Database Deletion Failure**: If IndexedDB deletion fails, remove from UI but show error notification
3. **Pipe Cleanup Failure**: If pipe removal fails, log error but complete node deletion
4. **Confirmation Dialog Blocked**: If dialog cannot be shown, default to requiring manual confirmation

### Persistence Errors

1. **LocalStorage Full**: If storage quota exceeded, clear old viewport states and retry
2. **Storage Access Denied**: If localStorage is unavailable, continue with in-memory state only
3. **Corrupted State Data**: If stored state cannot be parsed, reset to defaults

## Testing Strategy

### Unit Testing Approach

Unit tests will verify individual components and methods in isolation:

1. **ZoomController Tests**

   - Test getNextLevel() with all zoom levels and directions
   - Test clamp() with values below, within, and above range
   - Test toTransform() generates correct CSS strings

2. **PanController Tests**

   - Test constrainPan() with various boundary scenarios
   - Test getBoundaries() with different node configurations
   - Test isWithinBounds() with edge positions

3. **CanvasExpansion Tests**

   - Test checkAndExpand() at various height thresholds
   - Test expandTo() updates canvas height correctly
   - Test maximum height enforcement

4. **NodeDeletionHandler Tests**
   - Test hasConnections() with connected and unconnected nodes
   - Test deleteNode() removes node from DOM and database
   - Test confirmDeletion() shows dialog for connected nodes

### Property-Based Testing Approach

Property-based tests will verify correctness properties across many randomly generated inputs using **fast-check** library for JavaScript. Each test will run a minimum of 100 iterations.

1. **Zoom Properties**

   - Generate random zoom operations and verify discrete levels (Property 2)
   - Generate random node layouts and verify positions unchanged after zoom (Property 1)
   - Generate random mouse positions and verify zoom centering (Property 3)

2. **Pan Properties**

   - Generate random pan operations and verify boundaries (Property 7)
   - Generate random node configurations and verify no movement in pan mode (Property 6)

3. **Expansion Properties**

   - Generate random node placements and verify expansion triggers (Property 8)
   - Generate random canvas states and verify content preservation (Property 9)

4. **Deletion Properties**

   - Generate random pipeline graphs and verify connection cleanup (Property 10)
   - Generate random node configurations and verify confirmation logic (Property 11)

5. **Persistence Properties**
   - Generate random zoom levels and verify round-trip (Property 13)
   - Generate multiple pipelines and verify isolation (Property 14)

### Integration Testing

Integration tests will verify end-to-end workflows:

1. **Zoom + Pan + Expansion**: Verify all three systems work together correctly
2. **Delete + Persistence**: Verify deletion persists across page reloads
3. **Keyboard Shortcuts**: Verify all shortcuts work in realistic scenarios
4. **Visual Feedback**: Verify UI updates correctly during operations

### Test Configuration

```javascript
// fast-check configuration for property tests
const fcConfig = {
	numRuns: 100,
	seed: 42, // For reproducibility
	endOnFailure: true,
};

// Generators for property tests
const zoomLevelGen = fc.constantFrom(0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0);
const positionGen = fc.record({
	x: fc.integer({ min: 0, max: 5000 }),
	y: fc.integer({ min: 0, max: 5000 }),
});
const nodeGen = fc.record({
	id: fc.uuid(),
	position: positionGen,
	connections: fc.array(fc.uuid(), { maxLength: 5 }),
});
```

## Implementation Notes

### Performance Considerations

1. **CSS Transform vs DOM Manipulation**: Use CSS transforms for zoom/pan to leverage GPU acceleration
2. **Pipe Re-rendering**: Only re-render pipes when necessary (zoom/pan complete, not during drag)
3. **Debounced Persistence**: Debounce localStorage writes to avoid excessive I/O
4. **Event Delegation**: Use event delegation for node delete icons to minimize listeners

### Browser Compatibility

- Target Chrome 140+ (as per project requirements)
- Use CSS `transform` and `transform-origin` for zoom/pan
- Use `wheel` event for mouse wheel detection
- Use `localStorage` API for persistence
- Use CSS `cursor` property for visual feedback

### Accessibility Considerations

1. **Keyboard Navigation**: All zoom/pan operations accessible via keyboard
2. **Screen Reader Announcements**: Announce zoom level changes and canvas expansions
3. **Focus Management**: Maintain focus on canvas during keyboard operations
4. **High Contrast**: Ensure delete icons and cursors visible in high contrast mode

### Migration Strategy

1. **Backward Compatibility**: Existing pipelines without viewport state should default to 100% zoom
2. **Storage Schema**: Use versioned storage keys to allow future schema changes
3. **Graceful Degradation**: If viewport features fail, canvas should still function in basic mode

## File Structure

```
extension/pipelines/
├── services/
│   ├── Plumbing/
│   │   ├── PipelineEditor.js (existing - modify)
│   │   ├── PipeRenderer.js (existing - no changes)
│   │   └── PathFinder.js (existing - no changes)
│   └── Viewport/
│       ├── CanvasViewport.js (new)
│       ├── ZoomController.js (new)
│       ├── PanController.js (new)
│       └── CanvasExpansion.js (new)
├── components/
│   └── editor/
│       ├── pipeline-canvas.js (existing - modify)
│       └── nodes/
│           └── pipeline-node.js (existing - modify)
└── utils/
    └── viewport-storage.js (new)
```

## Dependencies

### Existing Dependencies

- Om.js reactive framework
- IndexedDB wrapper (db.js)
- PipelineEditor service
- PipeNode and Pipeline models

### New Dependencies

- fast-check (for property-based testing) - install via npm

### No External Dependencies Needed

- Zoom/pan implemented with native CSS transforms
- Persistence uses native localStorage API
- Event handling uses native DOM APIs
