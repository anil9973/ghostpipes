# Om.js Framework Rules for Kiro

**CRITICAL: Follow these rules EXACTLY when using Om.js. Violations will cause bugs.**

---

## ✅ Component Structure (Correct Order)

```javascript
import { react, html, map } from "/lib/om.compact.js";

export class MyComponent extends HTMLElement {
	// 1. Static properties (if needed)
	static TAG_NAME = "my-component";

	// 2. Reactive state
	state = react({
		count: 0,
		items: [],
	});

	// 3. Direct properties (NOT in constructor, NOT setAttribute)
	popover = "manual";
	className = "my-class";

	// 4. Event handlers (regular functions, NOT arrow functions)
	handleClick(e) {
		this.state.count++;
	}

	handleInput(e) {
		// Two-way binding handles this automatically
		// No need to manually update state
	}

	// 5. Computed properties (arrow functions)
	get isActive() {
		return () => this.state.count > 0;
	}

	// 6. Render method
	render() {
		return html`
			<div class=${this.isActive()}>
				<button @click=${this.handleClick.bind(this)}>Count: ${() => this.state.count}</button>
			</div>
		`;
	}

	// 7. connectedCallback - ALWAYS LAST METHOD
	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("my-component", MyComponent);
```

---

## 🚫 Common Mistakes to AVOID

### ❌ WRONG: Arrow functions for event handlers

```javascript
// NEVER DO THIS
@click=${() => this.handleClick()}
@input=${() => this.handleInput(e)}
@change=${() => this.state.value = e.target.value}
```

### ✅ CORRECT: Bind regular functions

```javascript
// ALWAYS DO THIS
@click=${this.handleClick.bind(this)}
@input=${this.handleInput.bind(this)}
@change=${this.handleChange.bind(this)}
```

---

### ❌ WRONG: Destructuring in render

```javascript
render() {
  // NEVER DO THIS - Breaks reactivity
  const { config, properties } = this.state;

  return html`
    <div>${config.value}</div>
  `;
}
```

### ✅ CORRECT: Direct property access

```javascript
render() {
  // ALWAYS DO THIS - Maintains reactivity
  return html`
    <div>${() => this.state.config.value}</div>
  `;
}
```

---

### ❌ WRONG: Manual two-way binding

```javascript
// NEVER DO THIS
<input
  .value=${() => this.state.text}
  @input=${this.handleInput.bind(this)}
/>

handleInput(e) {
  this.state.text = e.target.value; // Redundant!
}
```

### ✅ CORRECT: Automatic two-way binding

```javascript
// ALWAYS DO THIS - Om.js handles updates automatically
<input .value=${() => this.state.text} />

// No event handler needed for simple binding!
```

---

### ❌ WRONG: Comments inside template

```javascript
render() {
  return html`
    <div>
      <!-- This will cause errors -->
      ${() => this.state.value}
    </div>
  `;
}
```

### ✅ CORRECT: Comments outside template or use conditionals

```javascript
render() {
  // Comment here is fine

  return html`
    <div>
      ${() => this.state.value}
    </div>
  `;
}
```

---

### ❌ WRONG: connectedCallback at top/middle of class

```javascript
export class MyComponent extends HTMLElement {
  // NEVER PUT connectedCallback HERE
  connectedCallback() {
    this.replaceChildren(this.render());
  }

  state = react({ ... });

  render() { ... }
}
```

### ✅ CORRECT: connectedCallback ALWAYS LAST

```javascript
export class MyComponent extends HTMLElement {
  state = react({ ... });

  handleClick() { ... }

  render() { ... }

  // ALWAYS LAST METHOD IN CLASS
  connectedCallback() {
    this.replaceChildren(this.render());
  }
}
```

---

### ❌ WRONG: Using setAttribute or constructor

```javascript
export class MyComponent extends HTMLElement {
	constructor() {
		super();
		this.setAttribute("class", "my-class"); // WRONG
		this.popover = "manual"; // Wrong place
	}
}
```

### ✅ CORRECT: Direct properties at class level

```javascript
export class MyComponent extends HTMLElement {
  // Direct properties here
  popover = 'manual';
  className = 'my-class';

  state = react({ ... });
}
```

---

### ❌ WRONG: Inline styles or Tailwind classes

```javascript
render() {
  return html`
    <div style="color: red; padding: 1em">
      <span class="text-xl font-bold">Text</span>
    </div>
  `;
}
```

### ✅ CORRECT: Use CSS classes from separate files

```javascript
render() {
  return html`
    <div class="error-message">
      <span class="title">Text</span>
    </div>
  `;
}
```

---

## ✅ Reactivity Rules

### Static vs Reactive Expressions

```javascript
// ❌ WRONG: Static (evaluates once)
html`<div>${this.state.count}</div>`;

// ✅ CORRECT: Reactive (updates on change)
html`<div>${() => this.state.count}</div>`;
```

### When to Use Arrow Functions

**ALWAYS use arrow functions for:**

- Text content: `${() => this.state.value}`
- Attributes: `class=${() => this.getClass()}`
- Properties: `.value=${() => this.state.text}`
- Boolean attributes: `?checked=${() => this.state.active}`
- Conditionals: `${() => this.state.show ? html`...` : ''}`

**NEVER use arrow functions for:**

- Event handlers: `@click=${this.handler.bind(this)}`
- Direct function calls in render: `${this.computeValue()}`

---

## ✅ Event Binding

### Standard Events

```javascript
// Click
@click=${this.handleClick.bind(this)}

// Input (two-way binding handles value automatically)
<input .value=${() => this.state.text} />

// Change (only if custom logic needed)
@change=${this.handleChange.bind(this)}

// Submit
<form @submit=${this.handleSubmit.bind(this)}>

// Focus/Blur
@focus=${this.handleFocus.bind(this)}
@blur=${this.handleBlur.bind(this)}
```

### Passing Arguments

```javascript
// ❌ WRONG: Arrow function wrapper
@click=${() => this.handleRemove(index)}

// ✅ CORRECT: Use bind with arguments
@click=${this.handleRemove.bind(this, index)}

// Handler receives event as last argument
handleRemove(index, event) {
  this.state.items.splice(index, 1);
}
```

---

## ✅ Property Binding

### Element Properties (Dot Prefix)

```javascript
// Input value (two-way binding)
<input .value=${() => this.state.text} />

// Checkbox
<input type="checkbox" ?checked=${() => this.state.active} />

// Select
<select .value=${() => this.state.option}>
  <option value="a">A</option>
  <option value="b">B</option>
</select>

// Custom element property
<custom-element .data=${() => this.state.items}></custom-element>
```

### Boolean Attributes (Question Mark Prefix)

```javascript
// Checked
<input type="checkbox" ?checked=${() => this.state.active} />

// Disabled
<button ?disabled=${() => this.state.loading}>Submit</button>

// Hidden
<div ?hidden=${() => !this.state.visible}>Content</div>
```

### Regular Attributes

```javascript
// Static attribute
<img src="/logo.png" alt="Logo" />

// Dynamic attribute
<a href=${() => this.state.url}>Link</a>

// Class attribute
<div class=${() => this.getClass()}>Content</div>
```

---

## ✅ Conditional Rendering

### Simple Conditional

```javascript
${() => this.state.show ? html`
  <div>Visible</div>
` : ''}
```

### If/Else

```javascript
${() => this.state.isLoggedIn ? html`
  <div>Welcome back!</div>
` : html`
  <div>Please log in</div>
`}
```

### Multiple Conditions

```javascript
${() => {
  if (this.state.status === 'loading') {
    return html`<div>Loading...</div>`;
  }
  if (this.state.status === 'error') {
    return html`<div>Error!</div>`;
  }
  return html`<div>Success!</div>`;
}}
```

---

## ✅ List Rendering

### Using map() Helper

```javascript
import { map } from '/lib/om.compact.js';

// ✅ CORRECT: Use map helper
${map(
  this.state.items,
  (item) => html`
    <li>${item.name}</li>
  `
)}

// ❌ WRONG: Native array map
${this.state.items.map(item => html`<li>${item.name}</li>`)}
```

### With Index

```javascript
${map(
  this.state.items,
  (item, index) => html`
    <li>
      ${index + 1}. ${item.name}
      <button @click=${this.handleRemove.bind(this, index)}>
        Remove
      </button>
    </li>
  `
)}
```

### With Update Function (Performance Optimization)

```javascript
function updateItem(domNode, item) {
  domNode.querySelector('.name').textContent = item.name;
  domNode.querySelector('.price').textContent = item.price;
}

${map(
  this.state.items,
  (item) => html`
    <li class="item">
      <span class="name">${item.name}</span>
      <span class="price">${item.price}</span>
    </li>
  `,
  updateItem // Reuses DOM nodes on update
)}
```

---

## ✅ Two-Way Binding (Automatic)

Om.js automatically syncs input values with state:

```javascript
state = react({
  text: '',
  checked: false,
  selected: 'option1'
});

render() {
  return html`
    <!-- Text input: value updates automatically -->
    <input type="text" .value=${() => this.state.text} />

    <!-- Checkbox: checked updates automatically -->
    <input type="checkbox" ?checked=${() => this.state.checked} />

    <!-- Select: value updates automatically -->
    <select .value=${() => this.state.selected}>
      <option value="option1">Option 1</option>
      <option value="option2">Option 2</option>
    </select>

    <!-- Textarea: value updates automatically -->
    <textarea .value=${() => this.state.text}></textarea>
  `;
}
```

**No event handlers needed for simple binding!**

---

## ✅ Component Communication

### Parent → Child (Props)

```javascript
// Parent
render() {
  return html`
    <child-component .data=${() => this.state.items}></child-component>
  `;
}

// Child
connectedCallback() {
  console.log(this.data); // Access passed property
}
```

### Child → Parent (Events)

```javascript
// Child
handleAction() {
  this.dispatchEvent(new CustomEvent('action', {
    detail: { value: 123 },
    bubbles: true
  }));
}

// Parent
render() {
  return html`
    <child-component @action=${this.handleChildAction.bind(this)}>
    </child-component>
  `;
}
```

---

## ✅ Computed Properties

```javascript
export class MyComponent extends HTMLElement {
	state = react({
		firstName: "John",
		lastName: "Doe",
	});

	// Computed property (arrow function)
	get fullName() {
		return () => `${this.state.firstName} ${this.state.lastName}`;
	}

	get isValid() {
		return () => this.state.firstName.length > 0;
	}

	render() {
		return html`
			<div>Name: ${this.fullName()}</div>
			<button ?disabled=${() => !this.isValid()}>Submit</button>
		`;
	}
}
```

---

## ✅ Lifecycle Methods

### connectedCallback (ALWAYS LAST)

```javascript
connectedCallback() {
  // 1. Render component
  this.replaceChildren(this.render());

  // 2. Optional: Setup after render
  this.loadData();
  this.setupEventListeners();
}
```

### disconnectedCallback (Cleanup)

```javascript
disconnectedCallback() {
  // Cleanup subscriptions, timers, etc.
  if (this.intervalId) {
    clearInterval(this.intervalId);
  }
}
```

---

## ✅ Working with External Data

### Loading Data

```javascript
state = react({
  items: [],
  loading: false,
  error: null
});

async loadData() {
  this.state.loading = true;
  this.state.error = null;

  try {
    const response = await fetch('/api/items');
    const data = await response.json();
    this.state.items = data;
  } catch (error) {
    this.state.error = error.message;
  } finally {
    this.state.loading = false;
  }
}

render() {
  return html`
    ${() => this.state.loading ? html`
      <div>Loading...</div>
    ` : this.state.error ? html`
      <div class="error">${this.state.error}</div>
    ` : html`
      <ul>
        ${map(this.state.items, item => html`<li>${item.name}</li>`)}
      </ul>
    `}
  `;
}

connectedCallback() {
  this.replaceChildren(this.render());
  this.loadData(); // Load after render
}
```

---

## ✅ Refs (Accessing DOM Elements)

### Using Direct Property

```javascript
export class MyComponent extends HTMLElement {
	inputElement = null;

	handleMount() {
		// Access after render
		this.inputElement = this.querySelector("input");
		this.inputElement.focus();
	}

	render() {
		return html`
			<input type="text" />
			<button @click=${this.handleMount.bind(this)}>Focus Input</button>
		`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}
```

---

## ✅ Styling

### Use External CSS (ALWAYS)

```javascript
// ❌ WRONG: Inline styles
render() {
  return html`
    <div style="color: red; padding: 1em">
      Text
    </div>
  `;
}

// ✅ CORRECT: CSS classes
render() {
  return html`
    <div class="error-box">
      Text
    </div>
  `;
}
```

### Dynamic Classes

```javascript
get statusClass() {
  return () => {
    if (this.state.status === 'success') return 'status-success';
    if (this.state.status === 'error') return 'status-error';
    return 'status-idle';
  };
}

render() {
  return html`
    <div class="status ${this.statusClass()}">
      Status message
    </div>
  `;
}
```

---

## ✅ Complete Component Example

```javascript
import { react, html, map } from "/lib/om.compact.js";

export class TodoList extends HTMLElement {
	// 1. Reactive state
	state = react({
		todos: [],
		newTodo: "",
		filter: "all", // all, active, completed
	});

	// 2. Event handlers
	handleAddTodo(e) {
		e.preventDefault();

		if (this.state.newTodo.trim()) {
			this.state.todos.push({
				id: Date.now(),
				text: this.state.newTodo,
				completed: false,
			});
			this.state.newTodo = "";
		}
	}

	handleToggleTodo(id) {
		const todo = this.state.todos.find((t) => t.id === id);
		if (todo) {
			todo.completed = !todo.completed;
		}
	}

	handleDeleteTodo(id) {
		const index = this.state.todos.findIndex((t) => t.id === id);
		if (index !== -1) {
			this.state.todos.splice(index, 1);
		}
	}

	// 3. Computed properties
	get filteredTodos() {
		return () => {
			if (this.state.filter === "active") {
				return this.state.todos.filter((t) => !t.completed);
			}
			if (this.state.filter === "completed") {
				return this.state.todos.filter((t) => t.completed);
			}
			return this.state.todos;
		};
	}

	// 4. Render method
	render() {
		return html`
			<div class="todo-app">
				<h1>Todo List</h1>

				<form @submit=${this.handleAddTodo.bind(this)}>
					<input type="text" .value=${() => this.state.newTodo} placeholder="What needs to be done?" />
					<button type="submit">Add</button>
				</form>

				<div class="filters">
					<button
						class=${() => (this.state.filter === "all" ? "active" : "")}
						@click=${() => (this.state.filter = "all")}>
						All
					</button>
					<button
						class=${() => (this.state.filter === "active" ? "active" : "")}
						@click=${() => (this.state.filter = "active")}>
						Active
					</button>
					<button
						class=${() => (this.state.filter === "completed" ? "active" : "")}
						@click=${() => (this.state.filter = "completed")}>
						Completed
					</button>
				</div>

				<ul class="todo-list">
					${map(
						this.filteredTodos,
						(todo) => html`
							<li class=${todo.completed ? "completed" : ""}>
								<input
									type="checkbox"
									?checked=${todo.completed}
									@change=${this.handleToggleTodo.bind(this, todo.id)} />
								<span>${todo.text}</span>
								<button @click=${this.handleDeleteTodo.bind(this, todo.id)}>Delete</button>
							</li>
						`
					)}
				</ul>
			</div>
		`;
	}

	// 5. connectedCallback - ALWAYS LAST
	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("todo-list", TodoList);
```

---

## 📋 Pre-Code Checklist for Kiro

Before writing ANY Om.js component, verify:

- [ ] `connectedCallback` is the LAST method in class
- [ ] Event handlers use `.bind(this)`, NOT arrow functions
- [ ] No destructuring in render method
- [ ] Reactive expressions use arrow functions: `${() => ...}`
- [ ] Two-way binding uses `.value` (no manual @input handler)
- [ ] No comments inside html`` templates
- [ ] No inline styles or Tailwind classes
- [ ] Direct properties at class level (not constructor)
- [ ] Using `map()` helper for lists, not native array.map()
- [ ] Boolean attributes use `?` prefix
- [ ] Element properties use `.` prefix

**If ANY checkbox is unchecked, STOP and fix before proceeding!**
