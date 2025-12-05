# Design Document

## Overview

This design document outlines the architecture for refactoring the pipeline canvas node configuration system from static HTML to reactive Om.js web components. The refactor will introduce a standardized data model (NodeData and Rule classes), create reusable component patterns, and leverage Om.js reactivity features for automatic UI updates.

The system will convert three input node types (manual-upload, file-watch, http-fetch) and establish patterns for processing nodes like filter, transform, and aggregate. All components will follow Om.js best practices including dual binding, proper event handler syntax, and reactive state management.

## Architecture

### Component Hierarchy

```
PipelineCanvas
├── NodeCard (base pattern)
│   ├── NodeConfigHeader (reusable header)
│   └── NodeConfigBody (node-specific)
│       ├── Input Nodes
│       │   ├── ManualUploadNodeCard
│       │   ├── FileWatchNodeCard
│       │   └── HttpFetchNodeCard
│       └── Processing Nodes
│           ├── FilterDataNodeCard
│           │   └── FilterRuleTabRow (extends HTMLTableRowElement)
│           ├── TransformDataNodeCard
│           └── AggregateDataNodeCard
└── Shared Components
    └── MultiChipSelectField
```

### Data Flow

```
User Interaction → Event Handler → Reactive State Update → Automatic UI Re-render
                                          ↓
                                    NodeData.config
                                          ↓
                                   fireEvent('save-node-config')
                                          ↓
                                    PipelineCanvas
                                          ↓
                                    IndexedDB Storage
```

### File Organization

```
extension/pipelines/components/editor/nodes/
├── config-node-header.js          # Reusable header component
├── multi-chip-select-field.js     # Multi-select with chips
├── input/
│   ├── manual-upload-node.js      # Manual input configuration
│   ├── file-watch-node.js         # File watching configuration
│   └── http-fetch-node.js         # HTTP request configuration
└── processing/
    ├── filter-data-node.js        # Filter configuration
    ├── transform-data-node.js     # Transform configuration
    └── aggregate-data-node.js     # Aggregate configuration
```

## Components and Interfaces

### NodeData Class

The core data model for all node configurations:

```javascript
class NodeData {
	constructor(init = {}) {
		this.id = init.id || crypto.randomUUID();
		this.type = init.type || "";
		this.title = init.title || "";
		this.icon = init.icon || "";
		this.posX = init.posX || 0;
		this.posY = init.posY || 0;
		this.summary = init.summary || "";
		this.config = init.config || {};
		this.properties = init.properties || [];
	}

	toJSON() {
		return {
			id: this.id,
			type: this.type,
			title: this.title,
			icon: this.icon,
			posX: this.posX,
			posY: this.posY,
			summary: this.summary,
			config: this.config,
			properties: this.properties,
		};
	}
}
```

### Rule Class

Data structure for filter/validation rules:

```javascript
class Rule {
	constructor(init = {}) {
		this.id = init.id || Date.now();
		this.enabled = init.enabled ?? true;
		this.field = init.field || "";
		this.operator = init.operator || "equals";
		this.value = init.value || "";
	}
}
```

### NodeConfigHeader Component

Reusable header for all node configuration cards:

```javascript
class NodeConfigHeader extends HTMLElement {
	constructor(props) {
		super();
		this.props = props; // { icon: string, title: string }
	}

	handleSave() {
		fireEvent(this, "update");
	}

	handleClose() {
		this.parentElement.hidePopover();
	}

	render() {
		return html`
			<svg class="icon"><use href="/assets/icons.svg#${this.props.icon}"></use></svg>
			<span>${this.props.title}</span>
			<div class="action-btns">
				<button class="icon-btn" @click=${this.handleSave.bind(this)} title="Save & Close">
					<svg class="icon"><use href="/assets/icons.svg#check-all"></use></svg>
				</button>
				<button class="icon-btn" @click=${this.handleClose.bind(this)} title="Close">
					<svg class="icon"><use href="/assets/icons.svg#close"></use></svg>
				</button>
			</div>
		`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}
```

### Base Node Card Pattern

All node configuration cards follow this structure:

```javascript
class SomeNodeCard extends HTMLElement {
	constructor(nodeData) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.props = react(nodeData);
	}

	// Event handlers here
	handleSomeAction() {
		// Update this.props.config directly
	}

	// Render method
	render() {
		return html`
			<section>
				<ul class="config-field-list">
					<li>
						<label>Field Label</label>
						<input .value=${() => this.props.config.someField} />
					</li>
				</ul>
			</section>
		`;
	}

	// connectedCallback ALWAYS LAST
	connectedCallback() {
		this.replaceChildren(new NodeConfigHeader({ icon: this.props.icon, title: this.props.title }), this.render());
	}
}
```

### FilterDataNodeCard Component

Complex example with dynamic rule management:

```javascript
class FilterDataNodeCard extends HTMLElement {
	constructor(nodeData) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.props = react(nodeData);
		this.ensureEmptyRow();
	}

	ensureEmptyRow() {
		const rules = this.props.config.rules;
		const lastRule = rules[rules.length - 1];

		if (!lastRule || lastRule.field !== "" || lastRule.value !== "") {
			rules.push(new Rule());
		}
	}

	handleRemoveRule(index) {
		this.props.config.rules.splice(index, 1);
		this.ensureEmptyRow();
	}

	handleRowInput(index) {
		if (index === this.props.config.rules.length - 1) {
			this.ensureEmptyRow();
		}
	}

	async handleSave() {
		const config = Object.assign({}, this.config);
		await pipedb.updateNodeConfig(config, this.pipeNode.id);
		const validRules = this.config.rules.filter((r) => r.field.trim() !== "");
		this.config.rules = validRules;

		fireEvent(this, "save-node-config", this.pipeNode);
		this.hidePopover();

		this.ensureEmptyRow();
	}

	onClosedPopover() {}

	render() {
		return html`
			<section>
				<ul class="config-field-list">
					<li>
						<label>
							<select .value=${() => this.props.config.mode}>
								<option value="permit">Permit</option>
								<option value="block">Block</option>
							</select>
							items that match
							<select .value=${() => this.props.config.matchType}>
								<option value="all">all</option>
								<option value="any">any</option>
							</select>
							of the following:
						</label>
					</li>

					<li>
						<table class="rule-list">
							<thead>
								<tr>
									<th><input type="checkbox" disabled /></th>
									<th>Property</th>
									<th>Condition</th>
									<th>Text</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								${map(
									this.props.config.rules,
									(rule, index) => new FilterRuleTabRow(rule, index, this.props.properties)
								)}
							</tbody>
						</table>
					</li>

					<datalist id="filter-properties-${this.props.id}">
						${map(this.props.properties, (prop) => html`<option value=${prop}></option>`)}
					</datalist>
				</ul>
			</section>
		`;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "filter", title: "Filter Data" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render());
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}
```

### FilterRuleTabRow Component

Table row component extending HTMLTableRowElement:

```javascript
class FilterRuleTabRow extends HTMLTableRowElement {
	constructor(rule, index, properties) {
		super();
		this.rule = rule;
		this.index = index;
		this.properties = properties;
	}

	handleRemove() {
		fireEvent(this, "remove-rule", { index: this.index });
	}

	render() {
		this.innerHTML = "";

		const cells = [
			html`<td><input type="checkbox" ?checked=${() => this.rule.enabled} /></td>`,
			html`<td>
				<input list="filter-properties" .value=${() => this.rule.field} placeholder="Select property" />
			</td>`,
			html`<td>
				<select .value=${() => this.rule.operator}>
					<option value="equals">Equals</option>
					<option value="not_equals">Not Equals</option>
					<option value="contains">Contains</option>
					<option value="greater_than">Greater Than</option>
					<option value="less_than">Less Than</option>
				</select>
			</td>`,
			html`<td><input .value=${() => this.rule.value} /></td>`,
			html`<td>
				<button class="icon-btn" @click=${this.handleRemove.bind(this)}>
					<svg class="icon"><use href="/assets/icons.svg#trash"></use></svg>
				</button>
			</td>`,
		];

		cells.forEach((cell) => this.appendChild(cell));
	}

	connectedCallback() {
		this.render();
	}
}
```

### MultiChipSelectField Component

Multi-select component with chip visualization:

```javascript
class MultiChipSelectField extends HTMLElement {
	constructor(dataList, selected) {
		super();
		this.tabIndex = 0;
		this.dataList = dataList;
		this.selected = selected;
	}

	onSelectChange({ target }) {
		if (target.checked) {
			this.selected.push(target.value);
		} else {
			const index = this.selected.indexOf(target.value);
			if (index !== -1) this.selected.splice(index, 1);
		}
	}

	onInputFieldClick({ target }) {
		if (target.closest("atom-icon")) {
			const index = +target.closest("chip-item").dataset.index;
			this.selected.splice(index, 1);
			this.lastElementChild.children[index].firstElementChild.checked = false;
		}
	}

	filterChip({ target }) {
		const query = target.value;
		const domainElements = this.lastElementChild.children;

		if (!query) {
			for (const elem of domainElements) elem.hidden = false;
		} else {
			for (const elem of domainElements) {
				elem.hidden = !elem.lastElementChild.textContent.includes(query);
			}
		}
	}

	onKeyDown({ code, target }) {
		if (code !== "Enter") return;
		this.selected.push(target.value);
		target.value = "";
	}

	render() {
		const chipItem = (item, index) => html`
			<chip-item data-index="${index}">
				<span>${item}</span>
				<atom-icon ico="close"></atom-icon>
			</chip-item>
		`;

		const dataItem = (item) => html`
			<li>
				<input type="checkbox" value="${item}" ?checked=${this.selected.includes(item)} />
				<span>${item}</span>
			</li>
		`;

		return html`
			<span><span>Field(s) to compare:</span></span>
			<chip-input-box>
				<ul @click=${this.onInputFieldClick.bind(this)}>
					${map(this.selected, chipItem)}
				</ul>
				<input type="text" @keydown=${this.onKeyDown.bind(this)} @input=${this.filterChip.bind(this)} />
			</chip-input-box>
			<multi-select-popup @click=${this.onSelectChange.bind(this)}>
				${map(this.dataList, dataItem)}
			</multi-select-popup>
		`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}
```

## Data Models

### NodeData Structure

```javascript
{
  id: string,              // UUID
  type: string,            // 'filter', 'transform', 'http-fetch', etc.
  title: string,           // Display name
  icon: string,            // Icon identifier
  posX: number,            // Canvas X position
  posY: number,            // Canvas Y position
  summary: string,         // Brief description
  config: object,          // Node-specific configuration
  properties: string[]     // Available data properties
}
```

### Filter Config Structure

```javascript
{
  mode: 'permit' | 'block',
  matchType: 'all' | 'any',
  rules: Rule[]
}
```

### Rule Structure

```javascript
{
  id: number,              // Timestamp
  enabled: boolean,        // Rule active state
  field: string,           // Property to check
  operator: string,        // Comparison operator
  value: string            // Comparison value
}
```

### HTTP Fetch Config Structure

```javascript
{
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  headers: { [key: string]: string },
  body: string,
  timeout: number
}
```

### File Watch Config Structure

```javascript
{
  path: string,
  pattern: string,
  recursive: boolean,
  events: string[]         // ['create', 'modify', 'delete']
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

Property 1: Component reactivity
_For any_ node configuration component and any change to its reactive state, the DOM should automatically reflect the updated values without manual manipulation
**Validates: Requirements 1.2, 2.4**

Property 2: Dual binding round-trip
_For any_ input element with dual binding, programmatically changing the bound data should update the input value, and user input should update the bound data
**Validates: Requirements 1.3, 6.3, 8.2**

Property 3: NodeData completeness
_For any_ NodeData instance created with any initialization data, the instance should contain all required properties: id, type, title, icon, posX, posY, summary, config, and properties
**Validates: Requirements 2.1**

Property 4: NodeData serialization round-trip
_For any_ NodeData instance, serializing to JSON and deserializing should produce an equivalent NodeData object
**Validates: Requirements 2.5**

Property 5: Rule completeness
_For any_ Rule instance created with any initialization data, the instance should contain all required properties: id, enabled, field, operator, and value
**Validates: Requirements 3.1**

Property 6: Rule ID uniqueness
_For any_ set of Rule instances created at different times, all Rule IDs should be unique
**Validates: Requirements 3.2**

Property 7: Array reactivity preservation
_For any_ reactive array of Rules, array mutations (push, splice, pop) should trigger UI updates for all bound elements
**Validates: Requirements 3.5**

Property 8: Save button event dispatch
_For any_ NodeConfigHeader component, clicking the save button should dispatch an "update" custom event
**Validates: Requirements 5.2**

Property 9: Checkbox dual binding
_For any_ checkbox bound to a rule's enabled property, toggling the checkbox should update the property and changing the property should update the checkbox
**Validates: Requirements 6.4**

Property 10: Select dual binding
_For any_ select element bound to a rule property, changing the selection should update the property and changing the property should update the selection
**Validates: Requirements 6.5, 8.4**

Property 11: Textarea dual binding
_For any_ textarea element bound to a config property, typing in the textarea should update the property and changing the property should update the textarea content
**Validates: Requirements 8.5**

Property 12: Datalist reactivity
_For any_ datalist element bound to a properties array, adding or removing properties should reactively update the available options
**Validates: Requirements 9.2, 9.3**

Property 13: Datalist ID uniqueness
_For any_ set of datalist elements in a component, all datalist IDs should be unique to prevent association conflicts
**Validates: Requirements 9.5**

Property 14: Empty row invariant
_For any_ filter node configuration at any point in time, there should always be at least one empty Rule in the rules array
**Validates: Requirements 10.1, 10.2, 10.4**

Property 15: Dynamic row addition
_For any_ filter node configuration, when the last row receives input, a new empty row should be automatically added
**Validates: Requirements 10.3**

Property 16: Empty rule filtering on save
_For any_ filter node configuration being saved, the persisted rules array should not contain any Rule instances where both field and value are empty
**Validates: Requirements 10.5**

Property 17: Event detail propagation
_For any_ custom event dispatched with detail data, the receiving event handler should receive the exact detail object that was passed
**Validates: Requirements 13.3**

Property 18: Event bubbling
_For any_ custom event dispatched from a child component, parent components should be able to listen for and receive the event
**Validates: Requirements 13.5**

Property 19: MultiChipSelectField selection
_For any_ MultiChipSelectField component, selecting an item should add it to the selected array and display it as a chip in the DOM
**Validates: Requirements 14.2**

Property 20: MultiChipSelectField removal
_For any_ MultiChipSelectField component with selected items, clicking a chip's close icon should remove the item from both the selected array and the DOM
**Validates: Requirements 14.3**

Property 21: MultiChipSelectField filtering
_For any_ MultiChipSelectField component, typing a query should show only datalist items whose text contains the query string
**Validates: Requirements 14.4**

Property 22: MultiChipSelectField keyboard entry
_For any_ MultiChipSelectField component, pressing Enter with text in the input should add the text to selected array and clear the input field
**Validates: Requirements 14.5**

## Error Handling

### Validation Errors

Components should validate configuration before saving:

```javascript
class FilterDataNodeCard extends HTMLElement {
	validate() {
		const errors = [];

		// Check for at least one valid rule
		const validRules = this.props.config.rules.filter((r) => r.field.trim() !== "" && r.value.trim() !== "");

		if (validRules.length === 0) {
			errors.push("At least one complete rule is required");
		}

		// Check for duplicate fields
		const fields = validRules.map((r) => r.field);
		const duplicates = fields.filter((f, i) => fields.indexOf(f) !== i);

		if (duplicates.length > 0) {
			errors.push(`Duplicate fields: ${duplicates.join(", ")}`);
		}

		return errors;
	}

	handleSave() {
		const errors = this.validate();

		if (errors.length > 0) {
			fireEvent(this, "validation-error", { errors });
			return;
		}

		// Filter empty rules
		const validRules = this.props.config.rules.filter((r) => r.field.trim() !== "" && r.value.trim() !== "");

		this.props.config.rules = validRules;
		fireEvent(this, "save-node-config", this.props);
		this.hidePopover();
	}
}
```

### Runtime Errors

Handle missing or invalid data gracefully:

```javascript
class NodeConfigHeader extends HTMLElement {
	constructor(props) {
		super();

		// Provide defaults for missing props
		this.props = {
			icon: props?.icon || "settings",
			title: props?.title || "Configure Node",
		};
	}
}
```

### Event Handler Errors

Wrap event handlers in try-catch for debugging:

```javascript
handleRemoveRule(index) {
  try {
    this.props.config.rules.splice(index, 1);
    this.ensureEmptyRow();
  } catch (error) {
    console.error('Error removing rule:', error);
    fireEvent(this, 'error', {
      message: 'Failed to remove rule',
      error
    });
  }
}
```

## Testing Strategy

### Unit Testing

Unit tests will verify individual component behavior:

**NodeData Class Tests:**

- Test initialization with various input combinations
- Test default value assignment
- Test JSON serialization/deserialization
- Test property access and modification

**Rule Class Tests:**

- Test initialization with defaults
- Test ID generation uniqueness
- Test property assignment

**Component Tests:**

- Test component instantiation
- Test popover and className properties
- Test event handler binding
- Test render output structure

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** (JavaScript property-based testing library):

**Configuration:**

- Each property test should run a minimum of 100 iterations
- Tests should generate random but valid input data
- Tests should verify properties hold across all generated inputs

**Test Tagging:**

- Each property-based test must include a comment referencing the design document property
- Format: `// Feature: node-config-refactor, Property N: [property description]`

**Example Property Test Structure:**

```javascript
import fc from "fast-check";

describe("NodeData Properties", () => {
	// Feature: node-config-refactor, Property 3: NodeData completeness
	test("NodeData instances always contain required properties", () => {
		fc.assert(
			fc.property(
				fc.record({
					id: fc.option(fc.uuid()),
					type: fc.option(fc.string()),
					title: fc.option(fc.string()),
					posX: fc.option(fc.integer()),
					posY: fc.option(fc.integer()),
				}),
				(init) => {
					const nodeData = new NodeData(init);

					expect(nodeData).toHaveProperty("id");
					expect(nodeData).toHaveProperty("type");
					expect(nodeData).toHaveProperty("title");
					expect(nodeData).toHaveProperty("icon");
					expect(nodeData).toHaveProperty("posX");
					expect(nodeData).toHaveProperty("posY");
					expect(nodeData).toHaveProperty("summary");
					expect(nodeData).toHaveProperty("config");
					expect(nodeData).toHaveProperty("properties");
				}
			),
			{ numRuns: 100 }
		);
	});

	// Feature: node-config-refactor, Property 4: NodeData serialization round-trip
	test("NodeData serialization round-trip preserves data", () => {
		fc.assert(
			fc.property(
				fc.record({
					id: fc.uuid(),
					type: fc.string(),
					title: fc.string(),
					posX: fc.integer(),
					posY: fc.integer(),
					config: fc.object(),
				}),
				(init) => {
					const original = new NodeData(init);
					const json = JSON.stringify(original.toJSON());
					const restored = new NodeData(JSON.parse(json));

					expect(restored.id).toBe(original.id);
					expect(restored.type).toBe(original.type);
					expect(restored.title).toBe(original.title);
					expect(restored.posX).toBe(original.posX);
					expect(restored.posY).toBe(original.posY);
				}
			),
			{ numRuns: 100 }
		);
	});
});
```

### Integration Testing

Integration tests will verify component interaction:

- Test parent-child component communication
- Test event bubbling through component hierarchy
- Test data flow from user input to storage
- Test popover show/hide behavior
- Test multi-component scenarios (e.g., multiple node cards)

### Manual Testing Checklist

- Verify visual appearance matches design
- Test keyboard navigation and accessibility
- Test with various screen sizes
- Verify popover positioning
- Test rapid user interactions
- Verify error messages display correctly
