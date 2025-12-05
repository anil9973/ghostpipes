# Design Document

## Overview

This design converts static HTML node configuration cards into reactive Om.js web components for the GhostPipes pipeline builder. The conversion enables automatic UI updates through two-way data binding, eliminates manual DOM manipulation, and establishes a consistent component architecture following Om.js patterns.

The system will provide:

- Reactive node configuration components with automatic state synchronization
- Reusable component patterns for all node types
- Proper data models with type structure
- Event-driven communication between components
- Consistent UI patterns across all node cards

## Architecture

### Component Hierarchy

```
NodeConfigHeader (reusable header)
├── Icon + Title
└── Action Buttons (Save, Close)

FilterDataNodeCard (extends HTMLElement)
├── NodeConfigHeader
├── Configuration Form
│   ├── Mode Select (Permit/Block)
│   ├── Match Type Select (All/Any)
│   └── Rule Table
│       └── FilterRuleTabRow[] (extends HTMLTableRowElement)
└── Datalist (dynamic properties)

ManualUploadNodeCard (extends HTMLElement)
├── NodeConfigHeader
└── MultiChipSelectField (file types)

FileWatchNodeCard (extends HTMLElement)
├── NodeConfigHeader
├── Directory Picker
└── MultiChipSelectField (file types)

HttpFetchNodeCard (extends HTMLElement)
├── NodeConfigHeader
├── URL Input (method + URL)
└── TabularCarousel
    ├── Headers Table
    └── Query Parameters Table
```

### Data Flow

```
User Action → Event Handler → Update NodeData (reactive)
                                      ↓
                              Om.js detects change
                                      ↓
                              UI updates automatically
                                      ↓
                              Fire custom event (if needed)
```

### File Organization

```
pipelines/components/editor/nodes/
├── shared/
│   ├── NodeConfigHeader.js
│   ├── NodeData.js
│   └── Rule.js
├── input/
│   ├── manual-upload-node-card.js
│   ├── file-watch-node-card.js
│   └── http-fetch-node-card.js
└── operations/
    ├── filter-data-node-card.js
    └── FilterRuleTabRow.js
```

## Components and Interfaces

### NodeData Class

```javascript
export class NodeData {
	constructor(init = {}) {
		this.id = init.id || crypto.randomUUID();
		this.type = init.type || "";
		this.title = init.title || "";
		this.icon = init.icon || "";
		this.config = init.config || {};
		this.posX = init.posX || 0;
		this.posY = init.posY || 0;
		this.summary = init.summary || "";
		this.properties = init.properties || [];
	}
}
```

### Rule Class

```javascript
export class Rule {
	constructor() {
		this.id = Date.now();
		this.enabled = true;
		this.field = "";
		this.operator = "equals";
		this.value = "";
	}
}
```

### NodeConfigHeader Component

```javascript
export class NodeConfigHeader extends HTMLElement {
	constructor(props) {
		super();
		this.props = props; // { icon, title }
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
				<button class="icon-btn" @click=${this.handleSave.bind(this)}>
					<svg class="icon"><use href="/assets/icons.svg#check-all"></use></svg>
				</button>
				<button class="icon-btn" @click=${this.handleClose.bind(this)}>
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

### FilterDataNodeCard Component

```javascript
export class FilterDataNodeCard extends HTMLElement {
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
					<div>
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
					</div>

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
								(rule, index) =>
									new FilterRuleTabRow(rule, index, this.handleRemoveRule.bind(this), this.handleRowInput.bind(this))
							)}
						</tbody>
					</table>

					<datalist id="filter-properties">
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

```javascript
export class FilterRuleTabRow extends HTMLTableRowElement {
	constructor(rule, index, onRemove, onInput) {
		super();
		this.rule = rule;
		this.index = index;
		this.onRemove = onRemove;
		this.onInput = onInput;
	}

	handleRemove() {
		this.onRemove(this.index);
	}

	handleInput() {
		this.onInput(this.index);
	}

	render() {
		const cells = [
			html`<td><input type="checkbox" ?checked=${() => this.rule.enabled} /></td>`,
			html`<td>
				<input
					type="text"
					.value=${() => this.rule.field}
					list="filter-properties"
					@input=${this.handleInput.bind(this)} />
			</td>`,
			html`<td>
				<select .value=${() => this.rule.operator}>
					<option value="equals">=</option>
					<option value="gt">&gt;</option>
					<option value="lt">&lt;</option>
					<option value="contains">contains</option>
				</select>
			</td>`,
			html`<td>
				<input type="text" .value=${() => this.rule.value} @input=${this.handleInput.bind(this)} />
			</td>`,
			html`<td>
				<button
					class="icon-btn"
					@click=${this.handleRemove.bind(this)}
					?disabled=${() => this.rule.field === "" && this.rule.value === ""}>
					<svg class="icon"><use href="/assets/icons.svg#delete"></use></svg>
				</button>
			</td>`,
		];

		cells.forEach((cell) => this.insertCell().replaceChildren(cell));
	}

	connectedCallback() {
		this.render();
	}
}
```

## Data Models

### NodeData Structure

```javascript
{
  id: string,           // Unique identifier (UUID)
  type: string,         // Node type (e.g., 'filter', 'http-fetch')
  title: string,        // Display title
  icon: string,         // Icon identifier for SVG sprite
  config: object,       // Node-specific configuration
  posX: number,         // Canvas X position
  posY: number,         // Canvas Y position
  summary: string,      // Human-readable summary
  properties: string[]  // Available properties for this node
}
```

### Filter Configuration

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
  id: number,           // Timestamp-based ID
  enabled: boolean,     // Whether rule is active
  field: string,        // Property to match
  operator: string,     // Comparison operator
  value: string         // Value to compare against
}
```

### HTTP Fetch Configuration

```javascript
{
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  headers: { key: string, value: string }[],
  queryParams: { key: string, value: string }[]
}
```

### File Watch Configuration

```javascript
{
  directory: string,
  fileTypes: string[]  // MIME types
}
```

### Manual Upload Configuration

```javascript
{
  allowedTypes: string[]  // MIME types
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property Reflection

After analyzing all acceptance criteria, several properties were identified as redundant:

- Properties 1.2 and 7.4 both test that data is wrapped in react() - consolidated into Property 1
- Properties 3.2 and 7.2 both test Rule class structure - consolidated into Property 3
- Multiple properties test reactivity working correctly - consolidated into Property 1

The following properties provide unique validation value:

### Property 1: Reactive data propagation

_For any_ node component and any configuration change, modifying the reactive data should automatically update all UI elements bound to that data without manual DOM manipulation
**Validates: Requirements 1.1, 1.2, 1.3, 7.4**

### Property 2: Component constructor API

_For any_ node component class, instantiating it with a NodeData object should successfully create a component with that data accessible
**Validates: Requirements 1.4**

### Property 3: Rule data model structure

_For any_ Rule instance, it should have id, enabled, field, operator, and value properties with correct default values (enabled=true, field='', operator='equals', value='')
**Validates: Requirements 3.2, 7.2**

### Property 4: Empty row maintenance

_For any_ filter rule list, there should always be exactly one empty row (where field='' and value='') at the end of the list
**Validates: Requirements 3.5, 3.6**

### Property 5: Rule removal preserves invariants

_For any_ non-empty filter rule list, removing a rule should decrease the list length by 1 and maintain the empty row invariant
**Validates: Requirements 3.8**

### Property 6: Datalist population

_For any_ properties array passed to FilterDataNodeCard, the rendered datalist should contain exactly those properties as options
**Validates: Requirements 3.7**

### Property 7: NodeConfigHeader props acceptance

_For any_ icon and title strings, creating a NodeConfigHeader with those props should render them in the output
**Validates: Requirements 5.1, 5.4**

### Property 8: Save button event firing

_For any_ NodeConfigHeader instance, clicking the save button should fire an "update" custom event
**Validates: Requirements 5.2**

### Property 9: Close button behavior

_For any_ NodeConfigHeader with a parent element that has hidePopover method, clicking close should invoke that method
**Validates: Requirements 5.3**

### Property 10: NodeData structure completeness

_For any_ NodeData instance, it should have all required properties: id, type, title, icon, config, posX, posY, summary, and properties
**Validates: Requirements 7.1**

### Property 11: Data model initialization

_For any_ data model class (NodeData, Rule) and any initialization object, passing the object to the constructor should set the corresponding properties
**Validates: Requirements 7.3**

## Error Handling

### Component Initialization Errors

```javascript
constructor(nodeData) {
  super();

  if (!nodeData) {
    console.error('NodeData is required');
    nodeData = new NodeData();
  }

  if (!nodeData.config) {
    console.warn('Config missing, using defaults');
    nodeData.config = this.getDefaultConfig();
  }

  this.props = react(nodeData);
}
```

### Event Handler Errors

```javascript
handleRemoveRule(index) {
  try {
    if (index < 0 || index >= this.props.config.rules.length) {
      console.error('Invalid rule index:', index);
      return;
    }

    this.props.config.rules.splice(index, 1);
    this.ensureEmptyRow();
  } catch (error) {
    console.error('Error removing rule:', error);
    fireEvent(this, 'error', { message: 'Failed to remove rule' });
  }
}
```

### Reactive Binding Errors

If reactivity breaks (e.g., due to destructuring), the system should:

1. Log a warning to console
2. Attempt to re-establish binding
3. Fire an error event for parent components to handle

### Missing Properties

```javascript
render() {
  const properties = this.props.properties || [];

  if (properties.length === 0) {
    console.warn('No properties available for filtering');
  }

  return html`
    <datalist id="filter-properties">
      ${map(properties, prop => html`<option value=${prop}></option>`)}
    </datalist>
  `;
}
```

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

**Component Instantiation:**

- Test that each component class can be instantiated with valid NodeData
- Test that components handle missing or invalid data gracefully
- Test that components set popover and className correctly

**Event Handling:**

- Test that save button fires "update" event
- Test that close button calls hidePopover()
- Test that remove button removes correct rule

**Edge Cases:**

- Test empty rule list displays one empty row
- Test that invalid rule indices are handled
- Test that missing properties array doesn't crash

**Data Models:**

- Test NodeData constructor with various initialization objects
- Test Rule constructor creates correct defaults
- Test that all required properties exist

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using fast-check (JavaScript property testing library):

**Configuration:**

- Each property test should run minimum 100 iterations
- Use custom generators for NodeData, Rule, and configuration objects
- Tag each test with the property number from design doc

**Test Structure:**

```javascript
// Feature: pipeline-canvas, Property 1: Reactive data propagation
test("Property 1: Reactive data propagation", () => {
	fc.assert(
		fc.property(nodeDataGenerator(), configChangeGenerator(), (nodeData, change) => {
			// Create component with nodeData
			// Apply change to reactive data
			// Verify UI updated without manual DOM manipulation
		}),
		{ numRuns: 100 }
	);
});
```

**Generators:**

```javascript
const nodeDataGenerator = () =>
	fc.record({
		id: fc.uuid(),
		type: fc.constantFrom("filter", "http-fetch", "file-watch", "manual-upload"),
		title: fc.string(),
		icon: fc.string(),
		config: fc.object(),
		posX: fc.integer(),
		posY: fc.integer(),
		summary: fc.string(),
		properties: fc.array(fc.string()),
	});

const ruleGenerator = () =>
	fc.record({
		id: fc.integer(),
		enabled: fc.boolean(),
		field: fc.string(),
		operator: fc.constantFrom("equals", "gt", "lt", "contains"),
		value: fc.string(),
	});
```

**Property Test Coverage:**

- Property 1: Generate random NodeData and config changes, verify UI updates
- Property 2: Generate random NodeData objects, verify component creation
- Property 3: Generate random Rule instances, verify structure
- Property 4: Generate random rule lists, verify empty row exists
- Property 5: Generate random rule lists, remove random rules, verify invariants
- Property 6: Generate random property arrays, verify datalist contents
- Property 7: Generate random icon/title pairs, verify rendering
- Property 8: Generate random NodeConfigHeader instances, verify event firing
- Property 9: Generate random NodeConfigHeader instances, verify close behavior
- Property 10: Generate random NodeData instances, verify all properties exist
- Property 11: Generate random initialization objects, verify property setting

### Integration Testing

Integration tests will verify component interactions:

**Filter Node Workflow:**

1. Create FilterDataNodeCard with initial rules
2. Add new rule by filling empty row
3. Verify new empty row appears
4. Remove a rule
5. Verify list updates and empty row maintained
6. Click save
7. Verify "update" event fired with correct data

**Component Communication:**

1. Create node card with NodeConfigHeader
2. Click save in header
3. Verify parent component receives "update" event
4. Click close in header
5. Verify popover hides

**Reactive Updates:**

1. Create component with NodeData
2. Modify NodeData properties directly
3. Verify all bound UI elements update
4. Verify no manual DOM manipulation occurred
