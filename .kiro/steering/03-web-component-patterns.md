# Web Component Patterns for GhostPipes

## Component Structure Pattern

Based on `pipelines/components/editor/drawer/input-resources.js`, follow this pattern for all web components:

### 1. Imports

```javascript
import { html } from "../../../../lib/om.compact.js";
import { DefNode } from "../../../db/Node.js";
import { DefNodeCard } from "./node-card.js";
```

### 2. Data Definition (Outside Class)

Define data arrays/objects outside the class for better organization:

```javascript
const ManualInputNodes = [
	new DefNode({
		id: "manual-input",
		iconId: "manual-input",
		title: "Paste text / Upload file",
		subtitle: "Paste text / Upload file",
	}),
	new DefNode({
		id: "extension-data",
		iconId: "extension-data",
		title: "Selected data from extension",
		subtitle: "Selected data from extension",
	}),
];
```

### 3. Class Definition

```javascript
/**
 * ComponentName - brief description
 * Extends HTMLDetailsElement for native expand/collapse behavior (if applicable)
 */
export class ComponentName extends HTMLDetailsElement {
	constructor() {
		super();
		this.id = "component-id";
		this.name = "component-group"; // For grouping related components
	}

	handleEvent(event) {
		// Event handler methods
		// Use descriptive names: handleToggle, handleClick, handleSubmit
	}

	render() {
		// Return Om.js html template
		return html`
			<summary>
				<svg class="icon">
					<use href="/assets/icons.svg#icon-id"></use>
				</svg>
				<span>Label</span>
			</summary>
			<ul>
				${DataArray.map((item) => new ComponentChild(item))}
			</ul>
		`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
		// Add event listeners using global $on helper
		$on(this, "toggle", this.handleToggle.bind(this));
	}
}

customElements.define("component-name", ComponentName, { extends: "details" });
```

## Key Patterns

### Use Global Helpers

```javascript
// ✅ Use global fireEvent
fireEvent(this, "node-selected", { nodeType, title });

// ❌ Don't use dispatchEvent directly
this.dispatchEvent(new CustomEvent("node-selected", { detail: { nodeType, title } }));

// ✅ Use global $on
$on(this, "click", this.handleClick.bind(this));

// ❌ Don't use addEventListener directly
this.addEventListener("click", this.handleClick.bind(this));
```

### Data Organization

```javascript
// ✅ Group related data outside class
const CategoryNodes = [
	new DefNode({ id: "node1", iconId: "icon1", title: "Title 1", subtitle: "Subtitle 1" }),
	new DefNode({ id: "node2", iconId: "icon2", title: "Title 2", subtitle: "Subtitle 2" }),
];

// ❌ Don't hardcode in render method
render() {
	return html`
		<node-card id="node1" icon-id="icon1" title="Title 1"></node-card>
		<node-card id="node2" icon-id="icon2" title="Title 2"></node-card>
	`;
}
```

### Nested Components

```javascript
// ✅ Use nested details for subcategories
return html`
	<summary>Main Category</summary>
	<ul>
		<details>
			<summary>Subcategory</summary>
			<ul>
				${SubcategoryNodes.map((item) => new DefNodeCard(item))}
			</ul>
		</details>
		${StandaloneNodes.map((item) => new DefNodeCard(item))}
	</ul>
`;
```

### Icon Usage

```javascript
// ✅ Use SVG sprite with <use>
<svg class="icon">
	<use href="/assets/icons.svg#icon-id"></use>
</svg>

// ❌ Don't inline SVG paths
<svg class="icon">
	<path d="M21 11V9h-2V7..."></path>
</svg>
```

### Event Binding

```javascript
// ✅ Always bind 'this' context
$on(this, "toggle", this.handleToggle.bind(this));

// ❌ Don't forget to bind
$on(this, "toggle", this.handleToggle); // 'this' will be undefined
```

## Component Types

### 1. Category Components (extends HTMLDetailsElement)

Use for expandable/collapsible sections:

```javascript
export class CategoryComponent extends HTMLDetailsElement {
	constructor() {
		super();
		this.id = "category-id";
	}
	// ... rest of implementation
}

customElements.define("category-component", CategoryComponent, { extends: "details" });
```

### 2. Card Components (extends HTMLElement)

Use for individual items:

```javascript
export class CardComponent extends HTMLElement {
	constructor() {
		super();
	}
	// ... rest of implementation
}

customElements.define("card-component", CardComponent);
```

### 3. Dialog Components (extends HTMLDialogElement)

Use for modals and popups:

```javascript
export class DialogComponent extends HTMLDialogElement {
	constructor() {
		super();
	}

	show() {
		this.showModal();
	}

	close() {
		this.close();
	}
}

customElements.define("dialog-component", DialogComponent, { extends: "dialog" });
```

## Best Practices

1. **One component per file** - Keep files focused and maintainable
2. **Descriptive IDs** - Use kebab-case for element IDs
3. **Event bubbling** - Let events bubble up for parent handling
4. **Data separation** - Define data outside class for clarity
5. **Om.js patterns** - Use html template literals and map() helper
6. **Global helpers** - Use fireEvent and $on for consistency
7. **Icon sprites** - Always use SVG sprite references
8. **Bind context** - Always bind 'this' in event handlers
9. **Semantic HTML** - Extend native elements when appropriate
10. **Accessibility** - Use proper ARIA labels and keyboard support
