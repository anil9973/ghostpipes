# Home Page Specification

## Overview

The home page (`/`) is the primary entry point where users can:

1. **Create new pipelines** using AI prompt input
2. **View matched pipelines** based on their input
3. **Access existing pipelines** via drawer panel
4. **Run or edit pipelines** directly

---

## Page Structure

### Layout Hierarchy

```
<app-top-header>
  ├── My Pipes drawer button
  ├── Logo/Title
  └── Create Pipeline button
</app-top-header>

<main>
  ├── <prompt-input-field>
  │   ├── Trigger configuration (Manual/Webhook/Schedule)
  │   ├── Contenteditable prompt area
  │   └── Send button
  │
  └── <pipeline-container> (conditional)
      ├── <pipeline-action-bar>
      │   ├── Match count
      │   └── Action buttons (Create/Edit/Run)
      └── <pipeline-list>
          └── <pipeline-card> (multiple)
              ├── Pipeline name
              └── <pipeline-diagram>

<pipelines-drawer-panel popover>
  └── <pipeline-list>
      └── <pipeline-card> (multiple)
          ├── Pipeline name + action menu
          └── <pipeline-diagram>
```

---

## Component Specifications

### 1. `<app-top-header>`

**Purpose:** Navigation and primary actions

**State:**

```javascript
state = react({
	drawerOpen: false,
});
```

**Structure:**

```html
<header class="app-header">
	<button class="drawer-toggle" @click="${this.toggleDrawer.bind(this)}">
		<span>My Pipes</span>
		<svg class="icon">
			<use href="/assets/icons.svg#drawer-open"></use>
		</svg>
	</button>

	<h1 class="logo">GhostPipes 🎃</h1>

	<button class="create-btn" @click="${this.createPipeline.bind(this)}">Create Pipeline</button>
</header>
```

**Events:**

- `toggleDrawer()` - Opens/closes drawer panel
- `createPipeline()` - Navigates to pipeline builder

---

### 2. `<prompt-input-field>`

**Purpose:** AI prompt input with trigger configuration

**State:**

```javascript
state = react({
	trigger: {
		manual: true,
		webhook: false,
		webhookUrl: "",
		schedule: false,
		scheduleType: "every_1_day", // every_1_day, every_7_day, every_30_day, once
		scheduleTime: "09:00",
		scheduleDateTime: "",
	},
	promptText: "",
	isGenerating: false,
	error: null,
});
```

**Structure:**

```html
<div class="prompt-wrapper">
  <div class="prompt-header">
    <span class="trigger-label">Trigger by</span>

    <!-- Manual Trigger -->
    <label class="trigger-option">
      <input
        type="checkbox"
        .checked=${() => this.state.trigger.manual}
        @change=${this.handleTriggerChange.bind(this, 'manual')}
      />
      <span>Manual</span>
    </label>

    <!-- Webhook Trigger -->
    <div class="trigger-option">
      <label>
        <input
          type="checkbox"
          .checked=${() => this.state.trigger.webhook}
          @change=${this.handleTriggerChange.bind(this, 'webhook')}
        />
        <span>Webhook</span>
      </label>

      ${() => this.state.trigger.webhook ? html`
        <input
          type="url"
          class="webhook-url"
          .value=${() => this.state.trigger.webhookUrl}
          placeholder="https://example.com/webhook"
        />
      ` : ''}
    </div>

    <!-- Schedule Trigger -->
    <div class="trigger-option">
      <label>
        <input
          type="checkbox"
          .checked=${() => this.state.trigger.schedule}
          @change=${this.handleTriggerChange.bind(this, 'schedule')}
        />
        <span>Schedule</span>
      </label>

      ${() => this.state.trigger.schedule ? html`
        <div class="schedule-config">
          <select .value=${() => this.state.trigger.scheduleType}>
            <option value="every_1_day">Every 1 day</option>
            <option value="every_7_day">Every 7 days</option>
            <option value="every_30_day">Every 30 days</option>
            <option value="once">Once</option>
          </select>

          ${() => this.state.trigger.scheduleType === 'once' ? html`
            <input
              type="datetime-local"
              .value=${() => this.state.trigger.scheduleDateTime}
            />
          ` : html`
            <input
              type="time"
              .value=${() => this.state.trigger.scheduleTime}
            />
          `}
        </div>
      ` : ''}
    </div>
  </div>

  <!-- Prompt Input Area -->
  <div
    class="prompt-input"
    contenteditable="true"
    @input=${this.handlePromptInput.bind(this)}
    data-placeholder="Describe what you want to automate..."
  ></div>

  <!-- Send Button -->
  <button
    class="send-btn"
    @click=${this.handleSubmit.bind(this)}
    ?disabled=${() => this.state.isGenerating}
  >
    <svg class="icon">
      <use href="/assets/icons.svg#send"></use>
    </svg>
  </button>

  ${() => this.state.error ? html`
    <div class="error-message">${this.state.error}</div>
  ` : ''}
</div>
```

**Methods:**

- `handleTriggerChange(type)` - Toggle trigger type
- `handlePromptInput(e)` - Update prompt text from contenteditable
- `handleSubmit()` - Generate pipeline from prompt
- `validateInput()` - Check if input is valid

**Validation:**

- At least one trigger type must be selected
- Prompt text must not be empty
- If webhook selected, URL must be valid
- If schedule selected, time must be set

---

### 3. `<pipeline-container>`

**Purpose:** Display matched pipelines and actions

**State:**

```javascript
state = react({
	pipelines: [],
	selectedPipelineId: null,
	matchCount: 0,
});
```

**Visibility:**

- Hidden by default
- Shown when pipelines are matched or generated
- Hidden if matchCount = 0

**Structure:**

```html
<div class="pipeline-container">
	<pipeline-action-bar></pipeline-action-bar>
	<pipeline-list></pipeline-list>
</div>
```

---

### 4. `<pipeline-action-bar>`

**Purpose:** Show match count and action buttons

**Props:**

```javascript
// Passed from parent
matchCount: number;
selectedPipeline: Pipeline | null;
```

**Structure:**

```html
<div class="action-bar">
	<div class="match-count">
		${() => this.props.matchCount} Pipeline${() => this.props.matchCount !== 1 ? 's' : ''} matched
	</div>

	<div class="action-buttons">
		${() => !this.props.selectedPipeline ? html`
		<!-- No pipeline selected -->
		<button class="primary-btn" @click="${this.handleCreateNew.bind(this)}">
			<svg class="icon">
				<use href="/assets/icons.svg#play"></use>
			</svg>
			<span>Create Pipeline</span>
		</button>
		` : html`
		<!-- Pipeline selected -->
		<button class="text-btn" @click="${this.handleEdit.bind(this)}">
			<svg class="icon">
				<use href="/assets/icons.svg#edit"></use>
			</svg>
			<span>Edit</span>
		</button>

		<button class="primary-btn" @click="${this.handleRun.bind(this)}">
			<svg class="icon">
				<use href="/assets/icons.svg#run"></use>
			</svg>
			<span>Run</span>
		</button>
		`}
	</div>
</div>
```

**Methods:**

- `handleCreateNew()` - Create new pipeline from prompt
- `handleEdit()` - Open selected pipeline in editor
- `handleRun()` - Execute selected pipeline

---

### 5. `<pipeline-list>`

**Purpose:** Display pipeline cards in grid/list

**Props:**

```javascript
// Passed from parent
pipelines: Array<Pipeline>
selectedId: string | null
onSelect: Function
```

**Structure:**

```html
<div class="pipeline-list">
  ${map(
    () => this.props.pipelines,
    (pipeline) => html`
      <pipeline-card
        .pipeline=${pipeline}
        .selected=${() => this.props.selectedId === pipeline.id}
        @click=${this.handleSelect.bind(this, pipeline.id)}
      ></pipeline-card>
    `
  )}
</div>
```

**Layout:**

- Grid layout (3 columns on desktop, 2 on tablet, 1 on mobile)
- Gap: 1.5em between cards
- Cards are clickable

---

### 6. `<pipeline-card>`

**Purpose:** Visual representation of pipeline

**Props:**

```javascript
// Passed from parent
pipeline: Pipeline;
selected: boolean;
showActions: boolean; // true in drawer, false in main area
```

**Structure:**

```html
<div class="pipeline-card ${() => this.props.selected ? 'selected' : ''}">
  <div class="card-header">
    <span class="pipeline-name">${() => this.props.pipeline.name}</span>

    ${() => this.props.showActions ? html`
      <action-menu .pipelineId=${() => this.props.pipeline.id}></action-menu>
    ` : ''}
  </div>

  <pipeline-diagram .nodes=${() => this.props.pipeline.nodes}></pipeline-diagram>
</div>
```

**States:**

- Default (white background)
- Hover (highlight)
- Selected (green border)

---

### 7. `<pipeline-diagram>`

**Purpose:** Mini visual representation of pipeline flow

**Props:**

```javascript
// Passed from parent
nodes: Array<PipeNode>
```

**Structure:**

```html
<div class="pipeline-diagram">
	${map( () => this.getNodeSummary(), (node, index) => html`
	<div class="diagram-node">
		<span class="node-type">${node.type}</span>
	</div>

	${() => index < this.getNodeSummary().length - 1 ? html`
	<div class="diagram-arrow">⬇︎</div>
	` : ''} ` )}
</div>
```

**Display Logic:**

- Show max 4 nodes (first, middle nodes collapsed, last)
- If more than 4 nodes: [first] → [+N nodes] → [last]
- Use node type names (filter, transform, etc.)

**Example Output:**

```
HTTP Request
    ⬇︎
  Filter
    ⬇︎
[+3 nodes]
    ⬇︎
 Download
```

---

### 8. `<pipelines-drawer-panel>`

**Purpose:** Side panel showing all user pipelines

**State:**

```javascript
state = react({
	pipelines: [],
	searchQuery: "",
	isLoading: false,
});
```

**Structure:**

```html
<div class="drawer-panel" popover="manual" id="pipelines-drawer">
  <div class="drawer-header">
    <h2>My Pipelines</h2>
    <button class="close-btn" @click=${this.closeDrawer.bind(this)}>✕</button>
  </div>

  <div class="drawer-search">
    <input
      type="search"
      .value=${() => this.state.searchQuery}
      placeholder="Search pipelines..."
    />
  </div>

  <pipeline-list
    .pipelines=${() => this.filteredPipelines()}
    .showActions=${true}
  ></pipeline-list>
</div>
```

**Methods:**

- `loadPipelines()` - Fetch from IndexedDB
- `filteredPipelines()` - Filter by search query
- `closeDrawer()` - Hide drawer panel

---

### 9. `<action-menu>`

**Purpose:** Dropdown menu for pipeline actions

**Props:**

```javascript
// Passed from parent
pipelineId: string;
```

**State:**

```javascript
state = react({
	isOpen: false,
});
```

**Structure:**

```html
<div class="action-menu" tabindex="0">
	<button class="menu-trigger" @click="${this.toggleMenu.bind(this)}">
		<svg class="icon">
			<use href="/assets/icons.svg#menu"></use>
		</svg>
	</button>

	${() => this.state.isOpen ? html`
	<menu class="menu-dropdown">
		<li @click="${this.handleEdit.bind(this)}">
			<svg class="icon">
				<use href="/assets/icons.svg#edit"></use>
			</svg>
			<span>Edit</span>
		</li>

		<li @click="${this.handleDelete.bind(this)}">
			<svg class="icon">
				<use href="/assets/icons.svg#delete"></use>
			</svg>
			<span>Delete</span>
		</li>
	</menu>
	` : ''}
</div>
```

**Methods:**

- `toggleMenu()` - Open/close menu
- `handleEdit()` - Emit edit event
- `handleDelete()` - Emit delete event

**Behavior:**

- Click outside closes menu
- Escape key closes menu
- Menu positioned relative to trigger button

---

## Data Flow

### 1. Pipeline Generation Flow

```
User enters prompt
    ↓
<prompt-input-field> validates input
    ↓
Calls PipelineGenerator.generatePipeline()
    ↓
AI returns nodes + reasoning
    ↓
PipelineGenerator calculates positions + pipes
    ↓
<pipeline-container> displays matched pipelines
    ↓
User selects pipeline
    ↓
<pipeline-action-bar> shows Edit/Run buttons
```

### 2. Pipeline Selection Flow

```
User clicks <pipeline-card>
    ↓
Card emits 'pipeline-selected' event
    ↓
Parent updates selectedPipelineId
    ↓
Card shows selected state (green border)
    ↓
<pipeline-action-bar> updates buttons
```

### 3. Drawer Flow

```
User clicks "My Pipes" button
    ↓
<app-top-header> opens drawer
    ↓
<pipelines-drawer-panel>.showPopover()
    ↓
Loads pipelines from IndexedDB
    ↓
Displays in <pipeline-list>
    ↓
User can search, edit, delete
```

---

## State Management

### Global State (Page Level)

```javascript
state = react({
  // Prompt input
  promptData: {
    trigger: { ... },
    text: ''
  },

  // Pipeline matching
  matchedPipelines: [],
  selectedPipelineId: null,
  isGenerating: false,

  // Drawer
  allPipelines: [],
  drawerOpen: false,

  // UI
  error: null,
  loading: false
});
```

### Component Communication

**Events (bubble up):**

- `pipeline-selected` - User selects pipeline
- `pipeline-edit` - User wants to edit
- `pipeline-run` - User wants to run
- `pipeline-delete` - User wants to delete
- `pipeline-created` - New pipeline generated

**Props (pass down):**

- `pipelines` - Array of pipelines
- `selectedId` - Currently selected pipeline
- `loading` - Loading state

---

### Desktop (> 1024px)

- Header: Full width with logo centered
- Prompt field: 60% width, centered
- Pipeline grid: 3 columns
- Drawer: 400px wide, slides from left

---

### Screen Reader Announcements

```javascript
// When pipelines match
announcer.announce("Found 5 matching pipelines");

// When pipeline selected
announcer.announce("Selected pipeline: Price Tracker");

// When generating
announcer.announce("Generating pipeline from your description");
```

---

## Error Handling

### Validation Errors

```javascript
errors = {
	"empty-prompt": "Please describe what you want to automate",
	"no-trigger": "Select at least one trigger type",
	"invalid-webhook": "Please enter a valid webhook URL",
	"invalid-schedule": "Please set a schedule time",
};
```

### API Errors

```javascript
errors = {
	"api-failed": "Failed to generate pipeline. Please try again.",
	"invalid-response": "AI returned invalid pipeline. Please rephrase your request.",
	"network-error": "Network error. Check your connection.",
};
```

### Display

- Show error message below prompt field
- Red text with icon
- Auto-dismiss after 5 seconds (except validation errors)

---

## Performance Considerations

### Lazy Loading

- Load drawer pipelines only when drawer opens
- Load pipeline diagrams only when visible (intersection observer)

### Debouncing

- Search input: 300ms debounce
- Prompt input: No debounce (immediate reactivity)

### Caching

- Cache matched pipelines for 5 minutes
- Cache all pipelines list
- Invalidate on create/edit/delete

---

## Integration Points

### PipelineGenerator

```javascript
import { PipelineGenerator } from "./core/ai/PipelineGenerator.js";

const generator = new PipelineGenerator({
	apiKey: await getApiKey(),
});

const result = await generator.generatePipeline({
	intent: this.state.promptText,
	trigger: this.state.trigger,
});
```

### IndexedDB

```javascript
import { IndexedDBManager } from "./core/storage/IndexedDBManager.js";

const db = new IndexedDBManager();
await db.init();

// Load all pipelines
const pipelines = await db.getAll("pipelines");

// Save pipeline
await db.put("pipelines", pipelineData);
```

### Router (if applicable)

```javascript
// Navigate to pipeline builder
window.location.href = `/pipeline-builder?id=${pipelineId}`;

// Or emit event for SPA routing
this.dispatchEvent(
	new CustomEvent("navigate", {
		detail: { path: "/pipeline-builder", pipelineId },
	})
);
```
