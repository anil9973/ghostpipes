# UI Design & Interaction Rules

## Design Philosophy

### 1. Progressive Disclosure

```
Complexity Level 1 (80% users):
- AI generates everything
- Single prompt input
- Click "Run" button
- See results

Complexity Level 2 (15% users):
- Click "Edit Pipeline"
- See visual flow
- Tweak node settings
- Re-run pipeline

Complexity Level 3 (5% users):
- Drag new nodes
- Custom code nodes
- Complex branching
- Advanced debugging
```

### 2. Spooky Theme Guidelines

**DO:**

- Dark background (#0a0a0a to #1a1a1a)
- Neon green accent (#00ff88)
- Purple highlights (#8844ff)
- Subtle animations (glow, pulse)
- Realistic metallic pipes
- Ghost particle effects (CSS)

**DON'T:**

- Blood/gore imagery
- Jump scares
- Excessive animations
- Childish cartoons
- Bright colors
- Comic Sans (obviously)

### 3. Visual Hierarchy

```
Primary: Node cards (largest, most colorful)
Secondary: Pipes (thick, visible)
Tertiary: Controls (subtle, available on hover)
Background: Canvas (dark, recedes)
```

---

## Layout Rules

### 1. Home Page (`/`)

```
┌─────────────────────────────────────────────────────┐
│ Header                                              │
│  [Logo] GhostPipes          [My Pipelines] [Login] │
├─────────────────────────────────────────────────────┤
│                                                     │
│           🔮 AI Pipeline Builder                    │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │ Drag file, paste data, or describe task    │   │
│  │                                             │   │
│  │ Example: "Track Amazon prices daily"       │   │
│  │                                             │   │
│  │                               [Build It] ➤  │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  Quick Templates                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Price    │ │ Lead     │ │ News     │           │
│  │ Tracker  │ │ Scraper  │ │ Monitor  │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Key Points:**

- **Input field**: 60% viewport width, centered
- **Drag-and-drop zone**: Entire input area accepts files
- **Templates**: Grid layout, 3 columns on desktop
- **No clutter**: Hide advanced options until needed

### 2. Pipeline Builder Canvas (`/pipeline-builder`)

```
┌─────────────────────────────────────────────────────┐
│ Toolbar: [Save] [Run] [Export] [Settings]    [×]   │
├─────────────────┬───────────────────────────────────┤
│ Node Library    │ Canvas (Infinite Scroll)          │
│                 │                                    │
│ Input           │   ┌──────────┐                    │
│  • Manual       │   │ HTTP GET │                    │
│  • HTTP         │   └────┬─────┘                    │
│  • Webhook      │        │ 👁️                       │
│                 │        ▼                           │
│ Processing      │   ┌──────────┐                    │
│  • Filter       │   │  Parse   │                    │
│  • Transform    │   └────┬─────┘                    │
│  • AI           │        │ 👁️                       │
│                 │        ▼                           │
│ Output          │   ┌──────────┐                    │
│  • Download     │   │ Download │                    │
│  • Email        │   └──────────┘                    │
│                 │                                    │
└─────────────────┴───────────────────────────────────┘
```

**Key Points:**

- **Left sidebar**: 200px wide, collapsible
- **Canvas**: Fills remaining space, pan/zoom enabled
- **Nodes**: 150px × 80px cards
- **Pipes**: 10px thick, right-angle routing only
- **Eye icons**: 👁️ on pipes for data preview

### 3. Node Edit Dialog

```
┌─────────────────────────────────────────────┐
│ 🕸️ Filter                            [Done] │
├─────────────────────────────────────────────┤
│                                             │
│  Action:                                    │
│  ○ Permit   ● Block                         │
│                                             │
│  Match:                                     │
│  ● All   ○ Any   of the following:          │
│                                             │
│  Rules:                                     │
│  ┌─────────────────────────────────────┐   │
│  │ [item.price ▾] [> ▾] [50       ]  ✕ │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [+ Add Rule]                               │
│                                             │
│  Preview (first 3 items):                   │
│  ✓ Product A ($100)                         │
│  ✓ Product B ($75)                          │
│  ✗ Product C ($25) — blocked                │
│                                             │
└─────────────────────────────────────────────┘
```

**Key Points:**

- **Modal dialog**: Center screen, 500px wide
- **Preview**: Show impact of changes in real-time
- **Form controls**: Large touch targets (44px min)
- **Validation**: Inline errors below fields

---

This property avaialble globally

```js
// Instead of this.dispatchEvent(), use this
globalThis.fireEvent = (target, eventName, detail) =>
	target.dispatchEvent(detail ? new CustomEvent(eventName, { detail }) : new CustomEvent(eventName));
// Instead of this.addEventListener(), use this
globalThis.$on = (target, type, /** @type {Function} */ callback) => target.addEventListener(type, callback);
```

## Interaction Patterns

### 1. Extension Selection Mode (Alt+E)

```javascript
/**
 * Visual feedback when selection mode is active
 */
class SelectionMode {
	activate() {
		// 1. Show overlay
		document.body.insertAdjacentHTML(
			"beforeend",
			`
      <div id="ghost-overlay" style="
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 255, 136, 0.1);
        pointer-events: none;
        z-index: 999998;
      "></div>
    `
		);

		// 2. Change cursor
		document.body.style.cursor = "crosshair";

		// 3. Add hover effect
		document.addEventListener("mouseover", this.handleHover);
		document.addEventListener("click", this.handleSelect);
	}

	handleHover(e) {
		// Add green border to hovered element
		e.target.style.outline = "2px solid #00ff88";
	}

	handleSelect(e) {
		e.preventDefault();
		e.stopPropagation();

		// Toggle selection
		const el = e.target;
		if (el.dataset.ghostSelected) {
			delete el.dataset.ghostSelected;
			el.style.outline = "";
		} else {
			el.dataset.ghostSelected = "true";
			el.style.outline = "3px solid #00ff88";
			el.style.backgroundColor = "rgba(0, 255, 136, 0.1)";
		}

		// Update counter badge
		this.updateBadge();
	}

	updateBadge() {
		const count = document.querySelectorAll("[data-ghost-selected]").length;
		// Show floating badge with count
	}
}
```

### 2. Floating Action Menu (Alt+P)

```javascript
/**
 * Context menu that appears near selected content
 */
class FloatingMenu {
	show(x, y, selectedElements) {
		const menu = html`
			<div
				class="floating-menu"
				style="
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        background: #1a1a1a;
        border: 2px solid #00ff88;
        border-radius: 0.5em;
        padding: 1em;
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
        z-index: 999999;
      ">
				<h3>Selected ${selectedElements.length} items</h3>

				<div class="suggestions">${this.getSuggestions(selectedElements)}</div>

				<button @click=${() => this.buildCustom()}>Build Custom Pipeline</button>
			</div>
		`;

		document.body.appendChild(menu);
	}

	getSuggestions(elements) {
		// AI analyzes selected elements and suggests templates
		// e.g., if on Amazon + product selected → "Price Tracker"
	}
}
```

### 3. Pipe Connection Animation

```javascript
/**
 * Animate pipe drawing when connecting nodes
 */
class PipeAnimator {
	animateConnection(startNode, endNode) {
		const pipe = this.createPipe(startNode, endNode);

		// Start with zero length
		pipe.style.strokeDasharray = "1000";
		pipe.style.strokeDashoffset = "1000";

		// Animate to full length
		pipe.animate([{ strokeDashoffset: "1000" }, { strokeDashoffset: "0" }], {
			duration: 500,
			easing: "ease-out",
		});

		// Add glow effect on completion
		setTimeout(() => {
			pipe.style.filter = "drop-shadow(0 0 5px #00ff88)";
		}, 500);
	}
}
```

### 4. Data Flow Visualization

```javascript
/**
 * Animate particles flowing through pipes
 */
class DataFlowAnimator {
	startFlow(pipeId) {
		const pipe = document.getElementById(pipeId);
		const pathLength = pipe.getTotalLength();

		// Create particle
		const particle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		particle.setAttribute("r", "3");
		particle.setAttribute("fill", "#00ff88");

		// Animate along path
		particle.innerHTML = `
      <animateMotion
        dur="2s"
        repeatCount="indefinite"
        path="${pipe.getAttribute("d")}"
      />
    `;

		pipe.parentElement.appendChild(particle);
	}
}
```

---

## Responsive Design Rules

### 1. Breakpoints

```css
/* Mobile: 320px - 768px */
@media (max-width: 48em) {
	.node-library {
		display: none;
	} /* Hide sidebar */
	.node-card {
		width: 100%;
	} /* Full width cards */
	.canvas {
		overflow-x: auto;
	} /* Horizontal scroll */
}

/* Tablet: 768px - 1024px */
@media (min-width: 48em) and (max-width: 64em) {
	.node-library {
		width: 150px;
	} /* Narrow sidebar */
	.node-card {
		width: 200px;
	}
}

/* Desktop: 1024px+ */
@media (min-width: 64em) {
	.node-library {
		width: 250px;
	} /* Wide sidebar */
	.node-card {
		width: 150px;
	}
}
```

### 2. Touch Targets

```css
/* Minimum 44px × 44px for touch devices */
button,
.node-card,
.pipe-joint {
	min-width: 2.75em; /* 44px at 16px base */
	min-height: 2.75em;
}

/* Increase tap area without visual change */
.eye-icon {
	position: relative;
	padding: 1em; /* Visual size */
}

.eye-icon::before {
	content: "";
	position: absolute;
	top: -0.5em;
	bottom: -0.5em;
	left: -0.5em;
	right: -0.5em;
	/* Invisible hit area */
}
```

### 3. Keyboard Navigation

```javascript
/**
 * Full keyboard support for accessibility
 */
class KeyboardHandler {
	constructor() {
		// Pipeline builder shortcuts
		this.shortcuts = {
			"ctrl+s": () => this.savePipeline(),
			"ctrl+r": () => this.runPipeline(),
			"ctrl+z": () => this.undo(),
			"ctrl+y": () => this.redo(),
			delete: () => this.deleteSelected(),
			escape: () => this.deselectAll(),
		};

		// Extension shortcuts
		this.extensionShortcuts = {
			"alt+e": () => this.enterSelectionMode(),
			"alt+p": () => this.showFloatingMenu(),
		};
	}

	handleKeydown(e) {
		const key = this.getShortcut(e);
		const handler = this.shortcuts[key];

		if (handler) {
			e.preventDefault();
			handler();
		}
	}

	getShortcut(e) {
		const parts = [];
		if (e.ctrlKey) parts.push("ctrl");
		if (e.altKey) parts.push("alt");
		if (e.shiftKey) parts.push("shift");
		parts.push(e.key.toLowerCase());
		return parts.join("+");
	}
}
```

---

## Animation Guidelines

### 1. Timing Functions

```css
/* Use custom easing for natural feel */
:root {
	--ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
	--ease-in-out-quad: cubic-bezier(0.45, 0, 0.55, 1);
}

/* Node appearance */
.node-card {
	animation: fade-in-up 0.3s var(--ease-out-expo);
}

@keyframes fade-in-up {
	from {
		opacity: 0;
		transform: translateY(1em);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* Pipe connection */
.pipe {
	animation: draw-pipe 0.5s var(--ease-out-expo);
}

@keyframes draw-pipe {
	from {
		stroke-dashoffset: 1000;
	}
	to {
		stroke-dashoffset: 0;
	}
}
```

### 2. Loading States

```html
<!-- Skeleton loading for pipeline list -->
<div class="pipeline-skeleton">
	<div class="skeleton-header"></div>
	<div class="skeleton-body"></div>
	<div class="skeleton-footer"></div>
</div>

<style>
	.skeleton-header,
	.skeleton-body,
	.skeleton-footer {
		background: linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%);
		background-size: 200% 100%;
		animation: skeleton-pulse 1.5s ease-in-out infinite;
	}

	@keyframes skeleton-pulse {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
</style>
```

### 3. Success/Error Feedback

```javascript
/**
 * Visual feedback for user actions
 */
class FeedbackManager {
	showSuccess(message) {
		const toast = html`
			<div class="toast toast--success">
				<span class="toast__icon">✓</span>
				<span class="toast__message">${message}</span>
			</div>
		`;

		document.body.appendChild(toast);

		// Animate in
		toast.animate(
			[
				{ transform: "translateY(-100%)", opacity: 0 },
				{ transform: "translateY(0)", opacity: 1 },
			],
			{ duration: 300, easing: "ease-out" }
		);

		// Auto-dismiss
		setTimeout(() => {
			toast.animate(
				[
					{ transform: "translateY(0)", opacity: 1 },
					{ transform: "translateY(-100%)", opacity: 0 },
				],
				{ duration: 200 }
			).onfinish = () => toast.remove();
		}, 3000);
	}

	showError(message) {
		// Similar to success, but red color + skull icon
	}
}
```

---

## Accessibility Rules

### 1. ARIA Labels

```html
<!-- Node cards -->
<div class="node-card" role="button" aria-label="Filter node: Block items where price > $50" tabindex="0">...</div>

<!-- Pipe connections -->
<path
	class="pipe"
	role="img"
	aria-label="Data flow from HTTP Request to Parse node"
	d="M 100 100 L 100 200 L 200 200">
</path>

<!-- Edit button -->
<button class="node-edit" aria-label="Edit filter node configuration">⚙️</button>
```

### 2. Screen Reader Support

```javascript
/**
 * Announce dynamic changes to screen readers
 */
class A11yAnnouncer {
	constructor() {
		// Create live region
		this.liveRegion = document.createElement("div");
		this.liveRegion.setAttribute("role", "status");
		this.liveRegion.setAttribute("aria-live", "polite");
		this.liveRegion.className = "sr-only";
		document.body.appendChild(this.liveRegion);
	}

	announce(message) {
		this.liveRegion.textContent = message;

		// Clear after announcement
		setTimeout(() => {
			this.liveRegion.textContent = "";
		}, 1000);
	}
}

// Usage
const announcer = new A11yAnnouncer();
announcer.announce("Pipeline execution started");
announcer.announce("Node 1 completed successfully");
```

### 3. Focus Management

```javascript
/**
 * Manage focus for dialogs and modals
 */
class FocusManager {
	openDialog(dialog) {
		// Store previously focused element
		this.previousFocus = document.activeElement;

		// Move focus to dialog
		dialog.setAttribute("tabindex", "-1");
		dialog.focus();

		// Trap focus within dialog
		dialog.addEventListener("keydown", this.trapFocus.bind(this));
	}

	closeDialog(dialog) {
		// Restore previous focus
		if (this.previousFocus) {
			this.previousFocus.focus();
		}
	}

	trapFocus(e) {
		if (e.key !== "Tab") return;

		const focusable = this.getFocusableElements(e.currentTarget);
		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	getFocusableElements(container) {
		return Array.from(
			container.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])')
		);
	}
}
```

---

## Error State Design

### 1. Node Error Display

```html
<div class="node-card node-card--error">
	<div class="node-header">
		<span class="node-icon">💀</span>
		<span class="node-name">HTTP Request</span>
		<span class="node-status">Failed</span>
	</div>

	<div class="node-error">
		<strong>Error:</strong> Timeout after 5s

		<button class="retry-btn">Retry</button>
		<button class="skip-btn">Skip & Continue</button>
	</div>
</div>
```

### 2. Pipeline Error Modal

```html
<dialog class="error-modal">
	<h2>💀 Pipeline Cursed!</h2>

	<p>Node <code>fetch_product_page</code> failed:</p>
	<pre class="error-stack">
Error: HTTP 429 Too Many Requests
  at HttpRequestNode.execute (line 45)
  at PipelineRunner.executeNode (line 123)
  </pre>

	<h3>Suggested Fixes:</h3>
	<ul>
		<li>Add rate limiting node before this request</li>
		<li>Increase timeout to 10 seconds</li>
		<li>Enable retry with backoff</li>
	</ul>

	<div class="modal-actions">
		<button class="primary">Fix Automatically</button>
		<button class="secondary">Edit Manually</button>
		<button>Cancel</button>
	</div>
</dialog>
```

---

## Dark Mode Implementation

```css
:root {
	/* Background layers */
	--bg-primary: #0a0a0a;
	--bg-secondary: #1a1a1a;
	--bg-tertiary: #2a2a2a;

	/* Text colors */
	--text-primary: #e0e0e0;
	--text-secondary: #a0a0a0;
	--text-tertiary: #707070;

	/* Accent colors */
	--accent-green: #00ff88;
	--accent-purple: #8844ff;
	--accent-red: #ff4444;

	/* Shadows & glows */
	--glow-green: 0 0 10px rgba(0, 255, 136, 0.5);
	--glow-purple: 0 0 10px rgba(136, 68, 255, 0.5);
	--shadow-deep: 0 4px 20px rgba(0, 0, 0, 0.5);
}

body {
	background: var(--bg-primary);
	color: var(--text-primary);
}

.node-card {
	background: var(--bg-secondary);
	box-shadow: var(--shadow-deep);
}

.node-card:hover {
	box-shadow: var(--glow-green);
}
```

---

## Icon System

```html
<!-- Load sprite sheet -->
<svg style="display: none;">
	<defs>
		<symbol id="icon-filter" viewBox="0 0 24 24">
			<path d="M3 6h18M7 12h10M11 18h2" />
		</symbol>

		<symbol id="icon-transform" viewBox="0 0 24 24">
			<path d="M12 2v20M2 12h20" />
		</symbol>

		<!-- ... 31+ more icons -->
	</defs>
</svg>

<!-- Use icons -->
<svg class="icon icon--filter">
	<use href="#icon-filter"></use>
</svg>
```
