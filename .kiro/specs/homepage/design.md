# Design Document

## Overview

The GhostPipes Homepage implements a modern, AI-driven interface for pipeline creation and management. The design follows a component-based architecture using Om.js for reactivity, with a focus on progressive disclosure - showing simple options first and revealing complexity only when needed.

## Architecture

### Component Hierarchy

```
pump-station.js (Main Page)
├── app-top-header.js
│   └── Drawer toggle, Logo, Create button
├── prompt-input-field.js
│   ├── Trigger configuration
│   ├── Contenteditable input
│   └── Send button
├── pipeline-container.js (conditional)
│   ├── pipeline-action-bar.js
│   │   ├── Match count
│   │   └── Action buttons
│   └── pipeline-list.js
│       └── pipeline-card.js (multiple)
│           ├── Pipeline name
│           ├── action-menu.js (in drawer only)
│           └── pipeline-diagram.js
└── pipelines-drawer.js (popover)
    └── pipeline-list.js
        └── pipeline-card.js (multiple)
```

### Data Flow

```
User Input (Prompt)
    ↓
prompt-input-field validates
    ↓
Dispatches 'generate-pipeline' event
    ↓
pump-station calls PipelineGenerator
    ↓
AI returns pipeline structure
    ↓
pump-station updates state.matchedPipelines
    ↓
pipeline-container becomes visible
    ↓
pipeline-list renders cards
    ↓
User selects card
    ↓
pipeline-action-bar updates buttons
```

## Components and Interfaces

### 1. pump-station.js (Main Orchestrator)

**Purpose:** Root component that manages global state and coordinates all child components.

**State:**

```javascript
state = react({
	// Prompt data
	promptData: {
		trigger: {
			manual: true,
			webhook: false,
			webhookUrl: "",
			schedule: false,
			scheduleType: "every_1_day",
			scheduleTime: "09:00",
			scheduleDateTime: "",
		},
		text: "",
	},

	// Pipeline management
	matchedPipelines: [],
	selectedPipelineId: null,
	isGenerating: false,

	// Drawer
	allPipelines: [],
	drawerOpen: false,

	// UI state
	error: null,
	loading: false,
});
```

**Methods:**

- `handleGeneratePipeline(promptData)` - Calls AI to generate pipeline
- `handlePipelineSelect(id)` - Updates selected pipeline
- `handlePipelineEdit(id)` - Navigates to builder
- `handlePipelineRun(id)` - Executes pipeline
- `handlePipelineDelete(id)` - Removes from IndexedDB
- `toggleDrawer()` - Opens/closes drawer panel
- `loadAllPipelines()` - Fetches from IndexedDB

### 2. app-top-header.js

**Purpose:** Navigation bar with drawer toggle and create button.

**Interface:**

```javascript
// Props (passed from parent)
onDrawerToggle: Function
onCreatePipeline: Function

// Events dispatched
'drawer-toggle' - User clicked My Pipes button
'create-pipeline' - User clicked Create Pipeline button
```

**Structure:**

- Left: "My Pipes" button with drawer icon
- Center: "GhostPipes 🎃" logo
- Right: "Create Pipeline" button

### 3. prompt-input-field.js

**Purpose:** AI prompt input with trigger configuration.

**State:**

```javascript
state = react({
	trigger: {
		manual: true,
		webhook: false,
		webhookUrl: "",
		schedule: false,
		scheduleType: "every_1_day",
		scheduleTime: "09:00",
		scheduleDateTime: "",
	},
	promptText: "",
	isGenerating: false,
	error: null,
});
```

**Methods:**

- `handleTriggerChange(type, event)` - Toggle trigger checkbox
- `handlePromptInput(event)` - Capture contenteditable text
- `handleSubmit()` - Validate and dispatch generate event
- `validateInput()` - Check triggers and prompt text
- `getPromptText()` - Extract text from contenteditable div

**Validation Rules:**

- At least one trigger must be selected
- Prompt text must not be empty (trim whitespace)
- If webhook: URL must match pattern `https?://.*`
- If schedule: time must be set

**Events Dispatched:**

```javascript
new CustomEvent("generate-pipeline", {
	detail: {
		trigger: this.state.trigger,
		text: this.state.promptText,
	},
	bubbles: true,
});
```

### 4. pipeline-container.js

**Purpose:** Wrapper for action bar and pipeline list.

**Props:**

```javascript
pipelines: Array<Pipeline>
selectedId: string | null
matchCount: number
```

**Visibility Logic:**

```javascript
get isVisible() {
  return () => this.pipelines && this.pipelines.length > 0;
}
```

### 5. pipeline-action-bar.js

**Purpose:** Display match count and action buttons.

**Props:**

```javascript
matchCount: number;
selectedPipeline: Pipeline | null;
```

**Computed:**

```javascript
get matchText() {
  return () => {
    const count = this.matchCount;
    return `${count} Pipeline${count !== 1 ? 's' : ''} matched`;
  };
}

get hasSelection() {
  return () => this.selectedPipeline !== null;
}
```

**Events Dispatched:**

- `'create-new'` - Create pipeline from prompt
- `'edit-pipeline'` - Edit selected pipeline
- `'run-pipeline'` - Execute selected pipeline

### 6. pipeline-list.js

**Purpose:** Grid layout of pipeline cards.

**Props:**

```javascript
pipelines: Array<Pipeline>
selectedId: string | null
showActions: boolean // true in drawer, false in main
```

**Layout:**

- CSS Grid with `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`
- Gap: 1.5em
- Responsive: 3 cols desktop, 2 tablet, 1 mobile

**Events Dispatched:**

```javascript
new CustomEvent("pipeline-select", {
	detail: { id: pipelineId },
	bubbles: true,
});
```

### 7. pipeline-card.js

**Purpose:** Visual card showing pipeline name and diagram.

**Props:**

```javascript
pipeline: Pipeline;
selected: boolean;
showActions: boolean;
```

**Structure:**

```html
<div class="pipeline-card ${selected ? 'selected' : ''}">
	<div class="card-header">
		<span class="pipeline-name">{pipeline.name}</span>
		{showActions && <action-menu pipelineId="{pipeline.id}" />}
	</div>
	<pipeline-diagram nodes="{pipeline.nodes}" />
</div>
```

**CSS Classes:**

- `.pipeline-card` - Base card styling
- `.pipeline-card.selected` - Green border when selected
- `.card-header` - Flex container for name and menu
- `.pipeline-name` - Text styling

### 8. pipeline-diagram.js

**Purpose:** Mini visualization of pipeline flow.

**Props:**

```javascript
nodes: Array<PipeNode>
```

**Display Logic:**

```javascript
getNodeSummary() {
  if (nodes.length <= 4) {
    return nodes;
  }

  // Show: [first] → [+N nodes] → [last]
  return [
    nodes[0],
    { type: `+${nodes.length - 2} nodes`, isCollapsed: true },
    nodes[nodes.length - 1]
  ];
}
```

**Structure:**

```html
<div class="pipeline-diagram">
  {nodes.map((node, i) => (
    <>
      <div class="diagram-node">{node.type}</div>
      {i < nodes.length - 1 && <div class="diagram-arrow">⬇︎</div>}
    </>
  ))}
</div>
```

### 9. action-menu.js

**Purpose:** Dropdown menu for pipeline actions.

**Props:**

```javascript
pipelineId: string;
```

**State:**

```javascript
state = react({
	isOpen: false,
});
```

**Methods:**

- `toggleMenu()` - Open/close dropdown
- `handleEdit()` - Dispatch edit event
- `handleDelete()` - Dispatch delete event
- `handleClickOutside(event)` - Close if clicked outside
- `handleEscape(event)` - Close on Escape key

**Events Dispatched:**

- `'pipeline-edit'` - Edit pipeline
- `'pipeline-delete'` - Delete pipeline

**Behavior:**

- Click outside closes menu
- Escape key closes menu
- Menu positioned absolutely relative to trigger

### 10. pipelines-drawer.js

**Purpose:** Slide-out panel with all user pipelines.

**State:**

```javascript
state = react({
	pipelines: [],
	searchQuery: "",
	isLoading: false,
});
```

**Methods:**

- `showDrawer()` - Open drawer and load pipelines
- `closeDrawer()` - Hide drawer
- `loadPipelines()` - Fetch from IndexedDB
- `filteredPipelines()` - Filter by search query
- `handleSearch(event)` - Update search query

**Computed:**

```javascript
get filteredPipelines() {
  return () => {
    const query = this.state.searchQuery.toLowerCase();
    if (!query) return this.state.pipelines;

    return this.state.pipelines.filter(p =>
      p.name.toLowerCase().includes(query)
    );
  };
}
```

**Popover API:**

```javascript
// Use native popover attribute
<div popover="manual" id="pipelines-drawer">

// Show/hide methods
this.showPopover();
this.hidePopover();
```

## Data Models

### Pipeline Model

```javascript
{
  id: string,              // Unique identifier
  name: string,            // User-friendly name
  nodes: Array<PipeNode>,  // Pipeline nodes
  pipes: Array<Pipe>,      // Connections between nodes
  trigger: {               // Execution trigger
    type: 'manual' | 'webhook' | 'schedule',
    config: object
  },
  createdAt: Date,
  updatedAt: Date,
  lastRun: Date | null,
  status: 'active' | 'paused' | 'error'
}
```

### PipeNode Model

```javascript
{
  id: string,
  type: string,            // 'http-request', 'filter', etc.
  position: { x: number, y: number },
  config: object,          // Node-specific configuration
  inputs: Array<string>,   // IDs of input nodes
  outputs: Array<string>   // IDs of output nodes
}
```

### Trigger Model

```javascript
{
  manual: boolean,
  webhook: boolean,
  webhookUrl: string,
  schedule: boolean,
  scheduleType: 'every_1_day' | 'every_7_day' | 'every_30_day' | 'once',
  scheduleTime: string,    // HH:MM format
  scheduleDateTime: string // ISO datetime for 'once'
}
```

## Error Handling

### Validation Errors

```javascript
const VALIDATION_ERRORS = {
	EMPTY_PROMPT: "Please describe what you want to automate",
	NO_TRIGGER: "Select at least one trigger type",
	INVALID_WEBHOOK: "Please enter a valid webhook URL",
	INVALID_SCHEDULE: "Please set a schedule time",
};
```

**Display:**

- Show below prompt input field
- Red text with error icon
- Persist until user corrects

### API Errors

```javascript
const API_ERRORS = {
	GENERATION_FAILED: "Failed to generate pipeline. Please try again.",
	INVALID_RESPONSE: "AI returned invalid pipeline. Please rephrase your request.",
	NETWORK_ERROR: "Network error. Check your connection.",
	RATE_LIMIT: "Too many requests. Please wait a moment.",
};
```

**Display:**

- Show as toast notification
- Auto-dismiss after 5 seconds
- Allow manual dismiss

### IndexedDB Errors

```javascript
try {
	await db.put("pipelines", pipeline);
} catch (error) {
	console.error("Failed to save pipeline:", error);
	this.state.error = "Failed to save pipeline. Please try again.";
}
```

## Testing Strategy

### Unit Tests

1. **Component Rendering**

   - Each component renders without errors
   - Props are correctly passed and displayed
   - State updates trigger re-renders

2. **Event Handling**

   - Click events dispatch correct custom events
   - Event details contain expected data
   - Event bubbling works correctly

3. **Validation Logic**

   - Empty prompt shows error
   - Invalid webhook URL shows error
   - At least one trigger required

4. **Data Filtering**
   - Search filters pipelines correctly
   - Case-insensitive search works
   - Empty search shows all pipelines

### Integration Tests

1. **Pipeline Generation Flow**

   - User enters prompt → AI generates → Cards display
   - Validation errors prevent submission
   - Loading state shows during generation

2. **Pipeline Selection**

   - Click card → Card shows selected state
   - Action bar updates buttons
   - Only one card selected at a time

3. **Drawer Interaction**
   - Open drawer → Pipelines load
   - Search filters list
   - Edit/Delete actions work

### Visual Regression Tests

1. Compare rendered components against reference HTML
2. Verify responsive layouts at different breakpoints
3. Check hover and selected states

## Performance Optimizations

### Lazy Loading

```javascript
// Load drawer pipelines only when opened
async showDrawer() {
  this.showPopover();
  if (this.state.pipelines.length === 0) {
    await this.loadPipelines();
  }
}
```

### Debouncing

```javascript
// Debounce search input
handleSearch(event) {
  clearTimeout(this.searchTimeout);
  this.searchTimeout = setTimeout(() => {
    this.state.searchQuery = event.target.value;
  }, 300);
}
```

### Caching

```javascript
// Cache matched pipelines
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

if (this.cacheTimestamp && Date.now() - this.cacheTimestamp < CACHE_DURATION) {
	return this.cachedPipelines;
}
```

## Accessibility Features

### Keyboard Navigation

```javascript
// Handle keyboard events
handleKeyDown(event) {
  switch(event.key) {
    case 'Escape':
      this.closeDrawer();
      break;
    case 'Enter':
    case ' ':
      if (event.target.matches('.pipeline-card')) {
        this.handleSelect(event);
      }
      break;
  }
}
```

### ARIA Labels

```html
<button aria-label="Open my pipelines drawer">
	<div role="list" aria-label="Matched pipelines">
		<div role="listitem" aria-label="Pipeline: ${pipeline.name}">
			<menu role="menu" aria-label="Pipeline actions"></menu>
		</div>
	</div>
</button>
```

### Screen Reader Announcements

```javascript
// Announce state changes
announcer.announce(`Found ${count} matching pipelines`);
announcer.announce(`Selected pipeline: ${pipeline.name}`);
announcer.announce("Generating pipeline from your description");
```

## Design Decisions and Rationales

### Why Om.js?

**Decision:** Use Om.js for reactivity instead of React/Vue.

**Rationale:**

- Lightweight (3KB)
- No build step required
- Native Web Components
- Fine-grained reactivity
- Direct DOM manipulation

### Why Popover API?

**Decision:** Use native Popover API for drawer instead of custom implementation.

**Rationale:**

- Native browser support
- Built-in focus management
- Automatic backdrop
- Accessibility features included
- Less JavaScript code

### Why ContentEditable?

**Decision:** Use contenteditable div for prompt input instead of textarea.

**Rationale:**

- Better styling control
- Can insert rich content (future: drag-drop files)
- More natural editing experience
- Easier to implement placeholder

### Why Custom Events?

**Decision:** Use CustomEvent for component communication instead of callbacks.

**Rationale:**

- Loose coupling between components
- Event bubbling through DOM
- Easy to add new listeners
- Follows Web Components best practices

## Future Enhancements

1. **Drag-and-Drop**

   - Drag files into prompt field
   - Drag pipeline cards to reorder

2. **Pipeline Templates**

   - Quick-start templates
   - Template marketplace
   - Save custom templates

3. **Collaborative Features**

   - Share pipelines via URL
   - Team workspaces
   - Comments on pipelines

4. **Advanced Search**

   - Filter by trigger type
   - Filter by node types
   - Sort by last run, created date

5. **Pipeline Analytics**
   - Execution history
   - Success/failure rates
   - Performance metrics
