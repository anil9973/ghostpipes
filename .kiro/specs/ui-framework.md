# Om.js - Lightweight Reactive UI Framework

## Overview

**Om.js** is a minimalist reactive UI framework (3KB) for building web components with proxy-based reactivity. Inspired by LitElement and ArrowJS, it provides fine-grained reactivity without virtual DOM overhead or build steps.

**Key Features:**

- Proxy-based reactivity (like Vue 3, Solid.js)
- Native Web Components (Custom Elements)
- No compilation required (works directly in browser)
- Tagged template literals for declarative rendering
- Opt-in reactivity (static by default, reactive by choice)
- Direct DOM manipulation (no virtual DOM diffing)

---

## Installation

```html
<script type="module">
	import { react, html, map, svg } from "/lib/om.compact.js";
	// Start building!
</script>
```

---

## Core API

### `react(object)` - Create Reactive Data

Converts a plain object into a reactive proxy that can trigger UI updates.

**Syntax:**

```javascript
const state = react(initialData);
```

**Example:**

```javascript
import { react } from "/lib/om.compact.js";

export class Counter extends HTMLElement {
	state = react({
		count: 0,
		label: "Counter",
	});

	increment() {
		this.state.count++; // Triggers reactive updates
	}
}
```

**Important:**

- Works with objects and arrays
- Nested objects are automatically reactive
- Properties can be added/deleted dynamically
- Mutations trigger subscribed observers

---

### `$on(property, callback)` - Observe Changes

Subscribe to property changes on reactive objects.

**Syntax:**

```javascript
reactiveObject.$on(propertyName, (newValue, oldValue) => {
	// React to changes
});
```

**Example:**

```javascript
const state = react({
	price: 25,
	quantity: 10,
});

// Log when price changes
state.$on("price", (newPrice) => {
	console.log(`Price updated to $${newPrice}`);
});

// Calculate total whenever price or quantity changes
function updateTotal() {
	console.log(`Total: $${state.price * state.quantity}`);
}

state.$on("price", updateTotal);
state.$on("quantity", updateTotal);
```

---

### `html` - Template Rendering

Tagged template literal for declarative DOM rendering.

**Syntax:**

```javascript
const template = html`<div>Content</div>`;
element.appendChild(template);
```

**Basic Example:**

```javascript
export class Greeting extends HTMLElement {
	render() {
		return html`<div>
			<h1>Hello World</h1>
			<p>Welcome to Om.js</p>
		</div> `;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("my-greeting", Greeting);
```

---

## Reactivity System

### Static vs Reactive Expressions

Om.js distinguishes between static and reactive expressions:

- **Static**: Evaluated once on initial render
- **Reactive**: Re-evaluated when dependencies change

**Rule:** Wrap expressions in arrow functions to make them reactive.

```javascript
const state = react({
	location: "World",
});

html`
	<ul>
		<!-- Static: Evaluated once -->
		<li>Hello ${state.location}</li>

		<!-- Reactive: Updates when state.location changes -->
		<li>Hello ${() => state.location}</li>
	</ul>
`;

// Later...
state.location = "Mars"; // Only second <li> updates
```

**Why This Design?**
Most dynamic data doesn't need reactivity. Product details fetched from an API should render once. Shopping cart totals should be reactive. This opt-in approach improves performance and makes intent explicit.

---

### Reactive Text Content

Use arrow functions for text that updates automatically.

```javascript
export class Counter extends HTMLElement {
	state = react({ count: 0 });

	render() {
		return html`
			<div>Count: ${() => this.state.count}</div>
			<button @click=${() => this.state.count++}>Increment</button>
		`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("my-counter", Counter);
```

---

### Reactive Attributes

Set element attributes reactively using arrow functions.

```javascript
export class ProgressBar extends HTMLElement {
	state = react({ progress: 0 });

	startProgress() {
		const interval = setInterval(() => {
			this.state.progress += 10;
			if (this.state.progress >= 100) {
				clearInterval(interval);
			}
		}, 200);
	}

	render() {
		return html`
			<progress value=${() => this.state.progress} max="100"></progress>
			<button @click=${this.startProgress.bind(this)}>Start</button>
		`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}
```

**Note:** Don't wrap reactive expressions in quotes: `value="${() => state.value}"` ❌

---

### Reactive Properties (Dot Prefix)

Set element **properties** (not attributes) using dot prefix `.propertyName`.

**Use Case:** Setting complex data like objects/arrays on custom elements.

```javascript
export class Parent extends HTMLElement {
	data = {
		colors: ["red", "green", "blue"],
		config: { theme: "dark" },
	};

	render() {
		return html`
			<!-- Pass object as property -->
			<child-element .colors=${this.data.colors}></child-element>

			<!-- Reactive property -->
			<child-element .colors=${() => this.state.colors}></child-element>
		`;
	}
}
```

**Difference:**

- `attribute="value"` → Sets HTML attribute (strings only)
- `.property=${value}` → Sets JavaScript property (any type)

---

### Boolean Attributes (Question Mark Prefix)

Toggle boolean attributes using `?attributeName`.

```javascript
export class Form extends HTMLElement {
	state = react({
		isChecked: false,
		isHidden: true,
		isDisabled: false,
	});

	render() {
		return html`
			<input type="checkbox" ?checked=${() => this.state.isChecked} ?disabled=${() => this.state.isDisabled} />

			<div ?hidden=${() => this.state.isHidden}>Content</div>
		`;
	}
}
```

---

### Reactive Styles

**Method 1: Inline Style Attribute**

```javascript
const state = react({
	textAlign: "center",
	color: "#ff0000",
});

html` <h3 style="text-align:${() => state.textAlign}; color:${() => state.color}">Styled Heading</h3> `;
```

**Method 2: Class Binding**

```javascript
const state = react({
	theme: "dark",
	size: "large",
});

html` <div class="${() => state.theme} ${() => state.size}">Content</div> `;
```

---

## Conditional Rendering

Use arrow functions with ternary operators for conditional content.

### Simple Conditional

```javascript
const state = react({
	isLoggedIn: false,
});

html` <div>${() => (state.isLoggedIn ? html`<span>Welcome back!</span>` : html`<span>Please log in</span>`)}</div> `;
```

### Complex Conditionals

```javascript
const state = react({
	todos: [],
});

html`
	<section>
		${() =>
			state.todos.length === 0
				? html`<em>No todos found</em>`
				: html`
						<span>${state.todos.length} todos</span>
						<ul>
							${map(state.todos, (todo) => html`<li>${todo.task}</li>`)}
						</ul>
				  `}
	</section>
`;
```

---

## Lists with `map()`

Render arrays using the `map` helper function.

**Syntax:**

```javascript
map(array, itemTemplate, [updateFunction]);
```

### Basic List

```javascript
const state = react({
	todos: [
		{ id: 1, task: "Buy milk" },
		{ id: 2, task: "Walk dog" },
		{ id: 3, task: "Write code" },
	],
});

html`
	<ul>
		${map(state.todos, (todo) => html` <li>${todo.task}</li> `)}
	</ul>
`;
```

### List with DOM Reuse

When using array mutations like `splice()`, provide an `updateFunction` to reuse DOM nodes instead of destroying and recreating them.

```javascript
const state = react({
	todos: [
		{ task: "Buy milk", isDone: false },
		{ task: "Walk dog", isDone: true },
	],
});

// Update function reuses existing DOM nodes
function updateTodoItem(domNode, todo) {
	domNode.querySelector("span").textContent = todo.task;
	domNode.querySelector("i").textContent = todo.isDone;
}

function todoTemplate(todo) {
	return html`
		<li>
			<span>${todo.task}</span>
			is done: <i>${todo.isDone}</i>
		</li>
	`;
}

html`
	<ul>
		${map(state.todos, todoTemplate, updateTodoItem)}
	</ul>
`;

// Later...
state.todos.splice(0, 1, { task: "Study", isDone: false });
// DOM nodes are reused, not destroyed!
```

### Adding Items

```javascript
function addTodo(task) {
	state.todos.push({
		id: Date.now(),
		task: task,
		isDone: false,
	});
}

function submit() {
	e.preventDefault();
	const input = e.target.querySelector("input");
	addTodo(input.value);
	input.value = "";
}

html`
	<form @submit=${submit}>
		<input type="text" placeholder="New todo" />
		<button>Add</button>
	</form>

	<ul>
		${map(state.todos, (todo) => html`<li>${todo.task}</li>`)}
	</ul>
`;
```

---

## Event Handling

Bind event listeners using the `@eventName` shorthand.
Note: Don't wrap reactive expressions in quotes: value="@eventname=${handlerFunction}" ❌

**Syntax:**

```javascript
<element @eventname=${handlerFunction}></element>
```

### Click Events

```javascript
export class TodoList extends HTMLElement {
	state = react({ count: 0 });

	// Use regular function (not arrow) to preserve 'this' context
	handleClick() {
		this.state.count++;
	}

	render() {
		return html` <button @click=${this.handleClick.bind(this)}>Clicked ${() => this.state.count} times</button> `;
	}
}
```

### Input Events

```javascript
export class SearchBox extends HTMLElement {
	state = react({ query: "" });

	handleInput(e) {
		this.state.query = e.target.value;
	}

	render() {
		return html`
			<input type="text" @input=${this.handleInput.bind(this)} placeholder="Search..." />

			<p>Searching for: ${() => this.state.query}</p>
		`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}
```

### Form Submit

```javascript
export class LoginForm extends HTMLElement {
	handleSubmit(e) {
		e.preventDefault();
		const formData = new FormData(e.target);
		console.log("Email:", formData.get("email"));
	}

	render() {
		return html`
			<form @submit=${this.handleSubmit.bind(this)}>
				<input type="email" name="email" required />
				<button>Submit</button>
			</form>
		`;
	}
}
```

**Critical:** Always use `.bind(this)` with methods, or use arrow functions:

```javascript
// Method 1: Bind
@click=${this.handleClick.bind(this)}

// NOTE: Don't Arrow function  ❌
@click=${() => this.handleClick()}

```

---

## Two-Way Binding

Om.js automatically updates input element values when using `.value` property binding.

```javascript
const state = react({
	username: "",
	bio: "",
	isActive: false,
});

html`
	<!-- Text input -->
	<input type="text" .value=${() => state.username} />

	<!-- Textarea -->
	<textarea .value=${() => state.bio}></textarea>

	<!-- Checkbox -->
	<input type="checkbox" ?checked=${() => state.isActive} />

	<!-- Display values -->
	<div>
		Username: ${() => state.username}<br />
		Bio: ${() => state.bio}<br />
		Active: ${() => state.isActive}
	</div>
`;

// State automatically updates when user types!
```

---

## Array Operations

### Adding Items

```javascript
const state = react({ todos: [] });

// Push
state.todos.push({ task: "New task" });

// Unshift
state.todos.unshift({ task: "First task" });

// Splice (insert at index)
state.todos.splice(1, 0, { task: "Inserted task" });
```

### Removing Items

```javascript
// Splice (remove by index)
state.todos.splice(index, 1);

// Filter
state.todos = state.todos.filter((todo) => !todo.isDone);

// Pop
state.todos.pop();

// Shift
state.todos.shift();
```

### Sorting & Filtering

```javascript
// Sort in-place
state.todos.sort((a, b) => a.priority - b.priority);

// Filter (creates new array, must reassign)
state.todos = state.todos.filter((todo) => todo.isDone);

// Reverse
state.todos.reverse();
```

---

## Working with Objects

### Adding Properties

```javascript
const state = react({ user: {} });

// Add property
state.user.name = "John";
state.user.email = "john@example.com";
```

### Deleting Properties

```javascript
// Delete property
delete state.user.email;

// Later, add it back
setTimeout(() => {
	state.user.email = "new@example.com";
}, 1000);
```

### Conditional Rendering Based on Property Existence

```javascript
const state = react({
	person: { name: "Alice" },
});

html`
	<section>
		${() => (state.person ? html`<h3>Name: ${state.person.name}</h3>` : html`<em>No person found</em>`)}
	</section>

	<button @click=${() => delete state.person}>Delete Person</button>
`;
```

---

## SVG Support

Use the `svg` template tag for SVG elements.

```javascript
import { svg, react } from "/lib/om.compact.js";

const state = react({
	x: 10,
	y: 20,
	width: 100,
	height: 50,
	fill: "red",
});

const svgElement = document.querySelector("svg");

const rectangle = svg`
  <g>
    <rect
      x=${() => state.x}
      y=${() => state.y}
      width=${() => state.width}
      height=${() => state.height}
      fill=${() => state.fill}
      rx="3" />
  </g>
`;

svgElement.appendChild(rectangle);
```

---

## Parent-Child Communication

### Passing Data to Child Components

**Method 1: Properties (Objects/Arrays)**

```javascript
export class Parent extends HTMLElement {
	data = {
		colors: ["red", "green", "blue"],
		config: { theme: "dark" },
	};

	render() {
		return html` <child-element .data=${this.data}></child-element> `;
	}
}

export class ChildElement extends HTMLElement {
	connectedCallback() {
		console.log(this.data); // Access passed data
	}
}
```

**Method 2: Attributes (Strings)**

```javascript
html` <child-element title="Hello" count="5"> </child-element> `;

// In child
export class ChildElement extends HTMLElement {
	connectedCallback() {
		const title = this.getAttribute("title");
		const count = Number(this.getAttribute("count"));
	}
}
```

---

## Complete Examples

### Todo List Application

```javascript
import { react, html, map } from "/lib/om.compact.js";

const state = react({
	todos: [
		{ id: 1, task: "Buy milk", isDone: false },
		{ id: 2, task: "Walk dog", isDone: true },
	],
	filter: "all", // all, active, completed
});

export class TodoApp extends HTMLElement {
	addTodo(e) {
		e.preventDefault();
		const input = e.target.querySelector("input");
		if (input.value.trim()) {
			state.todos.push({
				id: Date.now(),
				task: input.value,
				isDone: false,
			});
			input.value = "";
		}
	}

	toggleTodo(id) {
		const todo = state.todos.find((t) => t.id === id);
		if (todo) todo.isDone = !todo.isDone;
	}

	deleteTodo(id) {
		const index = state.todos.findIndex((t) => t.id === id);
		if (index !== -1) state.todos.splice(index, 1);
	}

	get filteredTodos() {
		return () => {
			if (state.filter === "active") {
				return state.todos.filter((t) => !t.isDone);
			} else if (state.filter === "completed") {
				return state.todos.filter((t) => t.isDone);
			}
			return state.todos;
		};
	}

	render() {
		return html`
			<div class="todo-app">
				<h1>Todo List</h1>

				<form @submit=${this.addTodo.bind(this)}>
					<input type="text" placeholder="What needs to be done?" />
					<button>Add</button>
				</form>

				<div class="filters">
					<button @click=${() => (state.filter = "all")} class=${() => (state.filter === "all" ? "active" : "")}>
						All
					</button>
					<button
						@click=${() => (state.filter = "active")}
						class=${() => (state.filter === "active" ? "active" : "")}>
						Active
					</button>
					<button
						@click=${() => (state.filter = "completed")}
						class=${() => (state.filter === "completed" ? "active" : "")}>
						Completed
					</button>
				</div>

				${() =>
					this.filteredTodos().length === 0
						? html`<p><em>No todos found</em></p>`
						: html`
								<ul>
									${map(
										this.filteredTodos(),
										(todo) => html`
											<li class=${todo.isDone ? "done" : ""}>
												<input type="checkbox" ?checked=${todo.isDone} @change=${() => this.toggleTodo(todo.id)} />
												<span>${todo.task}</span>
												<button @click=${() => this.deleteTodo(todo.id)}>Delete</button>
											</li>
										`
									)}
								</ul>
						  `}
			</div>
		`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("todo-app", TodoApp);
```

### Shopping Cart

```javascript
const state = react({
	items: [
		{ id: 1, name: "Laptop", price: 999, quantity: 1 },
		{ id: 2, name: "Mouse", price: 29, quantity: 2 },
	],
	discount: 0,
});

export class ShoppingCart extends HTMLElement {
	get total() {
		return () => {
			const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
			return subtotal * (1 - state.discount / 100);
		};
	}

	updateQuantity(id, delta) {
		const item = state.items.find((i) => i.id === id);
		if (item) {
			item.quantity = Math.max(0, item.quantity + delta);
			if (item.quantity === 0) {
				this.removeItem(id);
			}
		}
	}

	removeItem(id) {
		const index = state.items.findIndex((i) => i.id === id);
		if (index !== -1) state.items.splice(index, 1);
	}

	render() {
		return html` <div class="cart">
			<h2>Shopping Cart</h2>

			${() =>
				state.items.length === 0
					? html`<p>Your cart is empty</p>`
					: html`
							<table>
								<thead>
									<tr>
										<th>Item</th>
										<th>Price</th>
										<th>Quantity</th>
										<th>Total</th>
										<th></th>
									</tr>
								</thead>
								<tbody>
									${map(
										state.items,
										(item) => html`
											<tr>
												<td>${item.name}</td>
												<td>$${item.price}</td>
												<td>
													<button @click=${() => this.updateQuantity(item.id, -1)}>-</button>
													${item.quantity}
													<button @click=${() => this.updateQuantity(item.id, 1)}>+</button>
												</td>
												<td>$${item.price * item.quantity}</td>
												<td>
													<button @click=${() => this.removeItem(item.id)}>Remove</button>
												</td>
											</tr>
										`
									)}
								</tbody>
							</table>

							<div class="summary">
								<label>
									Discount (%):
									<input
										type="number"
										.value=${() => state.discount}
										@input=${(e) => (state.discount = Number(e.target.value))}
										min="0"
										max="100" />
								</label>

								<h3>Total: $${this.total}</h3>

								<button>Checkout</button>
							</div>
					  `}
		</div>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("shopping-cart", ShoppingCart);
```

---

## Best Practices

### 1. Always Bind Event Handlers

```javascript
// ✅ Correct
<button @click=${this.handleClick.bind(this)}>Click</button>

// ❌ Wrong - loses 'this' context
<button @click=${this.handleClick}>Click</button>
```

### 2. Use Arrow Functions for Reactivity

```javascript
// ✅ Reactive
<div>${() => state.value}</div>

// ❌ Static (evaluates once)
<div>${state.value}</div>
```

### 3. Don't Quote Reactive Attributes

```javascript
// ✅ Correct
<input .value=${() => state.text} />

// ❌ Wrong
<input .value="${() => state.text}" />
```

### 4. Use map() for Lists

```javascript
// ✅ Correct
${map(items, item => html`<li>${item}</li>`)}

// ❌ Wrong (creates unnecessary wrappers)
${items.map(item => html`<li>${item}</li>`)}
```

### 5. Provide updateFunction for Splice

```javascript
// ✅ Optimized (reuses DOM)
${map(items, itemTemplate, updateFunction)}

// ⚠️ Slower (recreates DOM)
${map(items, itemTemplate)}
```

---

## Comparison with Other Frameworks

### Om.js vs LitElement

| Feature        | Om.js       | LitElement          |
| -------------- | ----------- | ------------------- |
| Reactivity     | Proxy-based | Property decorators |
| Size           | 3KB         | 15KB                |
| Compilation    | None        | Optional            |
| Learning Curve | Low         | Medium              |
| TypeScript     | Optional    | Recommended         |

### Om.js vs ArrowJS

| Feature         | Om.js           | ArrowJS     |
| --------------- | --------------- | ----------- |
| Component Model | Web Components  | Functions   |
| Reactivity      | Proxy-based     | Proxy-based |
| Templates       | html``          | html``      |
| Event Binding   | @eventname      | @eventname  |
| Lifecycle       | Custom Elements | Manual      |

### Om.js vs Svelte

| Feature     | Om.js                  | Svelte           |
| ----------- | ---------------------- | ---------------- |
| Compilation | None                   | Required         |
| Reactivity  | Runtime proxy          | Compile-time     |
| Size        | 3KB                    | 2KB (compiled)   |
| DX          | Imperative             | Declarative      |
| Debugging   | Direct (no sourcemaps) | Needs sourcemaps |

---

## API Reference Quick Guide

### Import

```javascript
import { react, html, map, svg } from "/lib/om.compact.js";
```

### Functions

- `react(object)` - Create reactive proxy
- `html`...`` - Template for HTML elements
- `svg`...`` - Template for SVG elements
- `map(array, template, [update])` - Render lists

### Special Attributes

- `.property` - Set element property
- `?attribute` - Toggle boolean attribute
- `@event` - Bind event listener

### Reactive Object Methods

- `$on(prop, callback)` - Subscribe to changes

---

## Troubleshooting

### Component Not Updating

**Problem:** Changes to state don't trigger UI updates.

**Solution:** Wrap expressions in arrow functions:

```javascript
// ❌ Won't update
<div>${state.value}</div>

// ✅ Updates
<div>${() => state.value}</div>
```

### Event Handler Loses Context

**Problem:** `this` is undefined in event handlers.

**Solution:** Use `.bind(this)`:

```javascript
// ❌ Wrong
<button @click=${this.handleClick}>

// ✅ Correct
<button @click=${this.handleClick.bind(this)}>
```

### List Not Updating

**Problem:** Adding items to array doesn't update UI.

**Solution:** Ensure array is reactive:

```javascript
// ✅ Correct
const state = react({ todos: [] });
state.todos.push(newItem);

// ❌ Wrong
let todos = [];
todos.push(newItem); // Not reactive!
```

### Performance Issues with Large Lists

**Problem:** Slow updates when list has many items.

**Solution:** Provide `updateFunction` to `map()`:

```javascript
function updateItem(domNode, item) {
  domNode.textContent = item.text;
}

${map(items, template, updateItem)}
```

---

<!--
## License

MIT

## Links

 - GitHub: [your-repo]
- NPM: [your-package]
- Examples: [examples-url] -->
