# Design Document

## Overview

The Node Picker Drawer Enhancement implements a hierarchical, category-based node selection interface using Web Components and Om.js reactive patterns. The design leverages native HTML elements (HTMLDetailsElement) for category sections to ensure accessibility and browser-native behavior, while custom elements provide the interactive node cards.

## Architecture

### Component Hierarchy

```
<node-picker-drawer>
  ├── <node-card> (AI Piper Witch - standalone)
  ├── <input-resources> extends HTMLDetailsElement
  │   ├── <summary> (category header)
  │   └── <ul>
  │       ├── <details> (Manual Input subcategory)
  │       │   └── <node-card> × N
  │       ├── <details> (HTTP Request subcategory)
  │       │   └── <node-card> × N
  │       └── <node-card> × N (standalone items)
  ├── <data-operations> extends HTMLDetailsElement
  │   ├── <summary> (category header)
  │   └── <ul>
  │       ├── <node-card> × N
  │       └── <details> (Show All)
  │           └── <node-card> × N (advanced nodes)
  └── <output-destinations> extends HTMLDetailsElement
      ├── <summary> (category header)
      └── <ul>
          └── <node-card> × N
```

### Data Flow

```
User Click on Node Card
    ↓
NodeCard.handleClick()
    ↓
Dispatch 'node-selected' CustomEvent
    ↓
NodePickerDrawer catches event
    ↓
Dispatch 'addnode' CustomEvent with node metadata
    ↓
PipelineCanvas receives event
    ↓
Create and position new node
```

## Components and Interfaces

### 1. NodeCard Component

**Purpose:** Displays a single node type option with icon, title, and subtitle.

**Interface:**

```javascript
class NodeCard extends HTMLElement {
  // Properties
  nodeType: string;      // e.g., 'manual-input', 'http-request'
  iconId: string;        // SVG sprite icon ID
  title: string;         // Display name
  subtitle: string;      // Description text

  // Methods
  render(): HTMLElement[];
  handleClick(event: Event): void;

  // Events Dispatched
  'node-selected': CustomEvent<{
    nodeType: string,
    title: string,
    metadata: object
  }>
}
```

**Attributes:**

- `node-type` (required): Identifier for the node type
- `icon-id` (required): ID of the icon in the SVG sprite
- `title` (required): Display title
- `subtitle` (required): Description text

**Example Usage:**

```html
<node-card
	node-type="manual-input"
	icon-id="manual-input"
	title="Paste text / Upload file"
	subtitle="Paste text / Upload file">
</node-card>
```

### 2. Category Section Components

**Purpose:** Group related nodes under expandable categories.

**Base Class:**

```javascript
class CategorySection extends HTMLDetailsElement {
  // Properties
  categoryName: string;
  iconId: string;

  // Methods
  render(): void;
  handleToggle(event: Event): void;

  // Lifecycle
  connectedCallback(): void;
}
```

**Specific Categories:**

- `InputResources` (class name: `input-resources`)
- `DataOperations` (class name: `data-operations`)
- `OutputDestinations` (class name: `output-destinations`)

**Example Usage:**

```html
<input-resources>
	<summary>
		<svg class="icon"><use href="/assets/icons.svg#input-sources" /></svg>
		<span>Input sources</span>
	</summary>
	<ul>
		<!-- node cards here -->
	</ul>
</input-resources>
```

### 3. NodePickerDrawer Component

**Purpose:** Container for all category sections and standalone node cards.

**Interface:**

```javascript
class NodePickerDrawer extends HTMLElement {
  // Properties
  categories: CategorySection[];

  // Methods
  render(): HTMLElement[];
  handleNodeSelected(event: CustomEvent): void;

  // Events Dispatched
  'addnode': CustomEvent<{
    nodeType: string,
    title: string,
    position?: {x: number, y: number}
  }>
}
```

## Data Models

### Node Metadata Structure

```javascript
const nodeMetadata = {
	type: "manual-input", // Unique identifier
	category: "input", // Category grouping
	subcategory: "manual", // Optional subcategory
	icon: "manual-input", // Icon ID in sprite
	title: "Paste text / Upload file",
	subtitle: "Paste text / Upload file",
	description: "Manually input data by pasting text or uploading a file",
	inputs: 0, // Number of input ports
	outputs: 1, // Number of output ports
	configSchema: {
		// Configuration options
		dataType: ["text", "file"],
		maxSize: "10MB",
	},
};
```

### Icon Sprite Structure

```xml
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <symbol id="icon-id" viewBox="0 0 24 24">
    <path d="..." />
  </symbol>
</svg>
```

## Error Handling

### Missing Icon Handling

```javascript
class NodeCard extends HTMLElement {
	validateIcon() {
		const sprite = document.querySelector(`#${this.iconId}`);
		if (!sprite) {
			console.warn(`Icon '${this.iconId}' not found in sprite`);
			// Fallback to default icon
			this.iconId = "default-node";
		}
	}
}
```

### Invalid Node Type

```javascript
handleNodeSelected(event) {
  const { nodeType } = event.detail;

  if (!this.isValidNodeType(nodeType)) {
    console.error(`Invalid node type: ${nodeType}`);
    return;
  }

  this.dispatchEvent(new CustomEvent('addnode', {
    bubbles: true,
    detail: { nodeType, ...event.detail }
  }));
}
```

### Event Propagation Errors

```javascript
handleClick(event) {
  try {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('node-selected', {
      bubbles: true,
      composed: true,
      detail: this.getNodeMetadata()
    }));
  } catch (error) {
    console.error('Failed to dispatch node-selected event:', error);
  }
}
```

## Testing Strategy

### Unit Tests

1. **NodeCard Component**

   - Renders with correct icon, title, subtitle
   - Dispatches 'node-selected' event on click
   - Applies hover styles correctly
   - Handles missing icons gracefully

2. **Category Section Components**

   - Extends HTMLDetailsElement correctly
   - Toggles open/closed state
   - Renders summary with icon and text
   - Contains child node cards

3. **NodePickerDrawer Component**
   - Renders all category sections
   - Catches and re-dispatches node-selected events
   - Maintains drawer state

### Integration Tests

1. **End-to-End Node Addition**

   - Click node card → event dispatched → node appears on canvas
   - Verify node metadata is correctly passed
   - Verify node positioning

2. **Category Interaction**

   - Expand/collapse categories
   - Multiple categories can be open simultaneously
   - State persists during session

3. **Icon Sprite Integration**
   - All icons load correctly
   - SVG use elements reference correct symbols
   - Icons scale appropriately

### Visual Regression Tests

1. Compare rendered drawer against reference design
2. Verify hover states and animations
3. Check responsive behavior at different viewport sizes

## Implementation Notes

### Om.js Integration

The components will use Om.js patterns for reactivity:

```javascript
import { html } from "/lib/om.compact.js";

class NodeCard extends HTMLElement {
	render() {
		return html`
			<div class="node-card" @click=${this.handleClick.bind(this)}>
				<svg class="icon">
					<use href="/assets/icons.svg#${this.iconId}"></use>
				</svg>
				<div class="column">
					<div class="title">${this.title}</div>
					<div class="subtitle">${this.subtitle}</div>
				</div>
			</div>
		`;
	}
}
```

### CSS Custom Properties

```css
.node-card {
	--card-bg: var(--bg-secondary);
	--card-hover-bg: var(--bg-tertiary);
	--card-border: var(--accent-green);
	--icon-size: 24px;
	--spacing: var(--spacing-md);
}
```

### Accessibility Considerations

1. **Keyboard Navigation**

   - All node cards are focusable (tabindex="0")
   - Enter/Space triggers click
   - Arrow keys navigate between cards

2. **Screen Reader Support**

   - ARIA labels on node cards
   - Role="button" for clickable cards
   - Announce category expansions

3. **Focus Management**
   - Visible focus indicators
   - Focus trap within drawer when active
   - Restore focus after node addition

### Performance Optimizations

1. **Lazy Rendering**

   - Only render visible categories
   - Defer rendering of collapsed categories

2. **Event Delegation**

   - Single click handler on drawer container
   - Identify clicked node via event.target

3. **Icon Sprite Loading**
   - Load sprite once on app initialization
   - Cache sprite in memory
   - Reuse across all node cards

## Design Decisions and Rationales

### Why Extend HTMLDetailsElement?

**Decision:** Category sections extend HTMLDetailsElement instead of custom implementation.

**Rationale:**

- Native browser support for expand/collapse
- Built-in accessibility features
- Semantic HTML structure
- No JavaScript required for basic functionality
- Progressive enhancement approach

### Why Use SVG Sprite?

**Decision:** Centralize all icons in a single SVG sprite file.

**Rationale:**

- Single HTTP request for all icons
- Easy to maintain and update
- Consistent sizing and styling
- Better performance than individual SVG files
- Supports CSS color inheritance

### Why Custom Events?

**Decision:** Use CustomEvent for component communication instead of direct method calls.

**Rationale:**

- Loose coupling between components
- Easy to add new listeners
- Follows Web Components best practices
- Enables event bubbling through DOM
- Testable in isolation

### Why Separate Node Metadata?

**Decision:** Store node metadata separately from component attributes.

**Rationale:**

- Keeps HTML attributes minimal
- Allows for complex configuration objects
- Easier to extend with new properties
- Centralized source of truth
- Can be loaded from external JSON

## Future Enhancements

1. **Search Functionality**

   - Add search input to filter nodes
   - Highlight matching nodes
   - Show/hide categories based on results

2. **Favorites/Recent**

   - Track frequently used nodes
   - Display favorites at top
   - Persist preferences in localStorage

3. **Drag-and-Drop**

   - Drag node cards directly to canvas
   - Visual feedback during drag
   - Drop to position node

4. **Node Previews**

   - Hover to show detailed description
   - Display example configurations
   - Show input/output schema

5. **Custom Node Categories**
   - Allow users to create custom categories
   - Organize nodes by project
   - Import/export category configurations
