# Instructions for Kiro: Home Page Development

## 🎯 Your Task

Convert the static HTML reference design (`.kiro/reference/index.html`) into dynamic Om.js web components while preserving the exact visual design.

---

## 📚 Required Reading (IN ORDER)

**MUST read before writing ANY code:**

1. `/specs/06-homepage-specification.md` - Complete home page specs
2. `/steering/04-omjs-framework-rules.md` - Om.js rules (CRITICAL!)
3. `/docs/homepage-conversion-guide.md` - Conversion examples
4. `.kiro/reference/index.html` - Reference HTML structure
5. `.kiro/reference/css/home-page.css` - Existing styles

---

## 🚨 CRITICAL Rules (Must Follow)

### Om.js Framework Rules

**✅ ALWAYS DO:**

- `connectedCallback()` is the LAST method in every class
- Event handlers use `.bind(this)`: `@click=${this.handler.bind(this)}`
- Reactive expressions use arrow functions: `${() => this.state.value}`
- Two-way binding: `<input .value=${() => this.state.text} />` (no @input handler)
- Use `map()` helper for lists: `${map(() => array, item => html`...`)}`
- Direct properties at class level: `this.pipeline = null`
- No comments inside html`` templates

**❌ NEVER DO:**

- Arrow functions for events: `@click=${() => this.handler()}` ❌
- Destructuring in render: `const { config } = this.state` ❌
- Manual two-way binding: `@input=${this.handleInput.bind(this)}` ❌
- connectedCallback at top of class ❌
- Inline styles or Tailwind classes ❌
- Comments inside templates ❌
- setAttribute or constructor initialization ❌

### Design Preservation Rules

**✅ MUST DO:**

- Use EXACT CSS class names from reference HTML
- Keep all existing CSS files unchanged
- No inline styles
- No Tailwind classes
- Enhance design, don't alter it

**❌ DON'T:**

- Modify `.kiro/reference/css/*` files
- Add new CSS classes (use existing ones)
- Change HTML structure drastically
- Add inline styles

---

## 📁 Files to Create

Create these files IN THIS ORDER:

### Phase 1: Base Components

1. `/pipelines/components/station/app-top-header.js`
2. `/pipelines/components/station/pipeline-diagram.js`
3. `/pipelines/components/station/pipeline-card.js`
4. `/pipelines/components/station/action-menu.js`

### Phase 2: Container Components

5. `/pipelines/components/station/pipeline-list.js`
6. `/pipelines/components/station/pipeline-action-bar.js`
7. `/pipelines/components/station/pipeline-container.js`

### Phase 3: Input Components

8. `/pipelines/components/station/prompt-input-field.js` (Complex - uses PipelineGenerator)

### Phase 4: Drawer

9. `/pipelines/components/station/pipelines-drawer.js` (Uses IndexedDB)

### Phase 5: Main Page

10. `/pipelines/pages/pump-station.js` (Orchestrates everything)

---

## 🏗️ Component Template

**Use this exact structure for EVERY component:**

```javascript
import { react, html, map } from "/lib/om.compact.js";

/**
 * Component description
 */
export class ComponentName extends HTMLElement {
	// 1. Direct properties (for props passed from parent)
	someProp = null;

	// 2. Reactive state
	state = react({
		someValue: "",
		items: [],
	});

	// 3. Event handlers (regular functions, NOT arrow)
	handleEvent(arg1, arg2, event) {
		// Implementation
	}

	// 4. Computed properties (arrow functions)
	get computedValue() {
		return () => {
			// Computation using this.state
			return result;
		};
	}

	// 5. Render method
	render() {
		return html`
			<div class="existing-css-class">
				<button @click=${this.handleEvent.bind(this, arg1, arg2)}>${() => this.state.someValue}</button>
			</div>
		`;
	}

	// 6. connectedCallback - ALWAYS LAST METHOD
	connectedCallback() {
		this.replaceChildren(this.render());

		// Optional: Additional setup
		this.loadData();
	}
}

customElements.define("component-name", ComponentName);
```

---

## 🔍 Component-by-Component Checklist

### For Each Component, Verify:

**Before Writing:**

- [ ] Read reference HTML for this component
- [ ] Identify existing CSS classes to use
- [ ] Understand data flow (props in, events out)
- [ ] Check if it uses other components (import them)

**While Writing:**

- [ ] State properties use `react()`
- [ ] Props as direct properties (not in constructor)
- [ ] Event handlers bound with `.bind(this)`
- [ ] Reactive values wrapped in arrow functions
- [ ] No destructuring in render method
- [ ] Using `map()` for lists
- [ ] No comments inside html`` templates

**After Writing:**

- [ ] `connectedCallback` is last method
- [ ] No inline styles anywhere
- [ ] No Tailwind classes
- [ ] Using exact CSS class names from reference
- [ ] All imports at top
- [ ] JSDoc comments for public methods
- [ ] Custom element registered with `customElements.define()`

---

## 💡 Quick Reference

### Reactivity Patterns

```javascript
// Text content
${() => this.state.text}

// Attribute
class=${() => this.computedClass()}

// Property binding
.value=${() => this.state.text}

// Boolean attribute
?checked=${() => this.state.active}

// Conditional rendering
${() => this.state.show ? html`<div>Visible</div>` : ''}

// List rendering
${map(() => this.state.items, item => html`<li>${item}</li>`)}
```

### Event Binding Patterns

```javascript
// Simple event
@click=${this.handleClick.bind(this)}

// Event with arguments
@click=${this.handleDelete.bind(this, item.id)}

// Form submit
<form @submit=${this.handleSubmit.bind(this)}>

// Stop propagation (do in handler)
handleClick(e) {
  e.stopPropagation();
  // ...
}
```

### Two-Way Binding (Automatic)

```javascript
// Text input
<input type="text" .value=${() => this.state.text} />

// Checkbox
<input type="checkbox" ?checked=${() => this.state.active} />

// Select
<select .value=${() => this.state.option}>
  <option value="a">A</option>
</select>

// Textarea
<textarea .value=${() => this.state.text}></textarea>
```

---

## 🔗 Integration Points

### Using PipelineGenerator

```javascript
import { PipelineGenerator } from "../../core/ai/PipelineGenerator.js";

const generator = new PipelineGenerator({
	apiKey: "YOUR_KEY",
});

const result = await generator.generatePipeline({
	intent: this.state.promptText,
	trigger: "manual",
});

// result.nodes - Array of PipeNode
// result.pipes - Array of pipe connections
// result.reasoning - AI explanation
```

### Using IndexedDB

```javascript
import { IndexedDBManager } from '../../core/storage/IndexedDBManager.js';

const db = new IndexedDBManager();
await db.init();

// Get all pipelines
const pipelines = await db.getAll('pipelines');

// Save pipeline
await db.put('pipelines', {
  id: 'pipe_123',
  name: 'My Pipeline',
  nodes: [...]
});
```

### Component Communication

```javascript
// Child → Parent (emit event)
this.dispatchEvent(new CustomEvent('pipeline-selected', {
  detail: { id: pipelineId },
  bubbles: true
}));

// Parent → Child (pass props)
<child-component
  .someProp=${() => this.state.value}
  @some-event=${this.handleEvent
```
