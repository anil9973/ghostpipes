# Home Page - Static to Om.js Conversion Guide

This guide shows EXACTLY how to convert `.kiro/reference/index.html` to dynamic Om.js components.

---

## Conversion Strategy

### Reference Files to Read

1. `.kiro/reference/index.html` - Static HTML structure
2. `.kiro/reference/css/home-page.css` - Existing styles (DO NOT MODIFY)
3. `.kiro/reference/css/base.css` - Global styles (DO NOT MODIFY)

### Output Files to Create

1. `/pipelines/pages/pump-station.js` - Main page component
2. `/pipelines/components/station/prompt-input-field.js` - Prompt input component
3. `/pipelines/components/station/pipeline-container.js` - Pipeline display component
4. `/pipelines/components/station/pipeline-card.js` - Individual pipeline card
5. `/pipelines/components/station/pipeline-diagram.js` - Mini diagram component
6. `/pipelines/components/station/pipelines-drawer.js` - Drawer panel component
7. `/pipelines/components/station/action-menu.js` - Dropdown menu component

---

## Component Hierarchy

```
home-page (main container)
├── app-top-header
├── prompt-input-field
│   ├── trigger-config (inline)
│   └── prompt-area (contenteditable)
├── pipeline-container (conditional)
│   ├── pipeline-action-bar
│   └── pipeline-list
│       └── pipeline-card (multiple)
│           └── pipeline-diagram
└── pipelines-drawer (popover)
    └── pipeline-list
        └── pipeline-card (multiple)
            ├── action-menu
            └── pipeline-diagram
```

---

## 1. Main Page Component

### Static HTML (Reference)

```html
<!DOCTYPE html>
<html>
	<head>
		<link rel="stylesheet" href="css/base.css" />
		<link rel="stylesheet" href="css/home-page.css" />
	</head>
	<body>
		<app-top-header>...</app-top-header>
		<main>...</main>
		<pipelines-drawer-panel>...</pipelines-drawer-panel>
	</body>
</html>
```

### Om.js Component (`/pipelines/pages/pump-station.js`)

```javascript
import { react, html } from "/lib/om.compact.js";
import "../components/app-top-header.js";
import "../components/prompt-input-field.js";
import "../components/pipeline-container.js";
import "../components/pipelines-drawer.js";

export class HomePage extends HTMLElement {
	state = react({
		matchedPipelines: [],
		selectedPipelineId: null,
		isGenerating: false,
		drawerOpen: false,
	});

	handlePipelineGenerated(e) {
		this.state.matchedPipelines = e.detail.nodes;
		this.state.isGenerating = false;
	}

	handlePipelineSelected(e) {
		this.state.selectedPipelineId = e.detail.id;
	}

	handleDrawerToggle() {
		const drawer = this.querySelector("pipelines-drawer");
		if (drawer) {
			drawer.toggle();
		}
	}

	render() {
		return html`
			<app-top-header @drawer-toggle=${this.handleDrawerToggle.bind(this)}></app-top-header>

			<main>
				<prompt-input-field @pipeline-generated=${this.handlePipelineGenerated.bind(this)}></prompt-input-field>

				${() =>
					this.state.matchedPipelines.length > 0
						? html`
								<pipeline-container
									.pipelines=${() => this.state.matchedPipelines}
									.selectedId=${() => this.state.selectedPipelineId}
									@pipeline-selected=${this.handlePipelineSelected.bind(this)}></pipeline-container>
						  `
						: ""}
			</main>

			<pipelines-drawer></pipelines-drawer>
		`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("home-page", HomePage);
```

---

## 2. App Top Header

### Static HTML (Reference)

```html
<app-top-header>
	<div class="my-pipes-drawer-btn">
		<span>My Pipes</span>
		<svg class="icon">
			<use href="/assets/icons.svg#drawer-open" />
		</svg>
	</div>
	<div>Ghostpipes 🎃</div>
	<button>Create pipeline</button>
</app-top-header>
```

### Om.js Component (`/pipelines/components/app-top-header.js`)

```javascript
import { react, html } from "/lib/om.compact.js";

export class AppTopHeader extends HTMLElement {
	handleDrawerClick() {
		this.dispatchEvent(
			new CustomEvent("drawer-toggle", {
				bubbles: true,
			})
		);
	}

	handleCreateClick() {
		// Navigate to pipeline builder
		window.location.href = "/pipeline-builder";
	}

	render() {
		return html`
			<header class="app-header">
				<button class="my-pipes-drawer-btn" @click=${this.handleDrawerClick.bind(this)}>
					<span>My Pipes</span>
					<svg class="icon">
						<use href="/assets/icons.svg#drawer-open"></use>
					</svg>
				</button>

				<div class="logo">GhostPipes 🎃</div>

				<button class="create-btn" @click=${this.handleCreateClick.bind(this)}>Create Pipeline</button>
			</header>
		`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("app-top-header", AppTopHeader);
```

---

## 3. Prompt Input Field

### Static HTML (Reference)

```html
<prompt-input-field>
	<div class="wrapper">
		<div class="prompt-header">
			<span>Trigger by</span>
			<label> <input type="checkbox" /> <span>Manual</span> </label>
			<!-- ... more triggers ... -->
		</div>
		<section contenteditable="true"></section>
		<svg class="icon">
			<use href="/assets/icons.svg#send" />
		</svg>
	</div>
</prompt-input-field>
```

### Om.js Component (`/pipelines/components/prompt-input-field.js`)

```javascript
import { react, html } from "/lib/om.compact.js";
import { PipelineGenerator } from "../../core/ai/PipelineGenerator.js";

export class PromptInputField extends HTMLElement {
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

	handleTriggerChange(type, e) {
		this.state.trigger[type] = e.target.checked;
	}

	handlePromptInput(e) {
		this.state.promptText = e.target.textContent;
	}

	async handleSubmit() {
		if (!this.state.promptText.trim()) {
			this.state.error = "Please describe what you want to automate";
			return;
		}

		this.state.isGenerating = true;
		this.state.error = null;

		try {
			const generator = new PipelineGenerator({
				apiKey: await this.getApiKey(),
			});

			const result = await generator.generatePipeline({
				intent: this.state.promptText,
				trigger: this.getTriggerType(),
			});

			this.dispatchEvent(
				new CustomEvent("pipeline-generated", {
					detail: result,
					bubbles: true,
				})
			);
		} catch (error) {
			this.state.error = error.message;
		} finally {
			this.state.isGenerating = false;
		}
	}

	getTriggerType() {
		if (this.state.trigger.schedule) return "schedule";
		if (this.state.trigger.webhook) return "webhook";
		return "manual";
	}

	async getApiKey() {
		// Get from settings or prompt user
		return "YOUR_API_KEY";
	}

	render() {
		return html`
			<div class="prompt-wrapper">
				<div class="prompt-header">
					<span class="trigger-label">Trigger by</span>

					<label class="trigger-option">
						<input
							type="checkbox"
							?checked=${() => this.state.trigger.manual}
							@change=${this.handleTriggerChange.bind(this, "manual")} />
						<span>Manual</span>
					</label>

					<div class="trigger-option">
						<label>
							<input
								type="checkbox"
								?checked=${() => this.state.trigger.webhook}
								@change=${this.handleTriggerChange.bind(this, "webhook")} />
							<span>Webhook</span>
						</label>

						${() =>
							this.state.trigger.webhook
								? html`
										<input
											type="url"
											class="webhook-url"
											.value=${() => this.state.trigger.webhookUrl}
											placeholder="https://example.com/webhook" />
								  `
								: ""}
					</div>

					<div class="trigger-option">
						<label>
							<input
								type="checkbox"
								?checked=${() => this.state.trigger.schedule}
								@change=${this.handleTriggerChange.bind(this, "schedule")} />
							<span>Schedule</span>
						</label>

						${() =>
							this.state.trigger.schedule
								? html`
										<div class="schedule-config">
											<select .value=${() => this.state.trigger.scheduleType}>
												<option value="every_1_day">Every 1 day</option>
												<option value="every_7_day">Every 7 days</option>
												<option value="every_30_day">Every 30 days</option>
												<option value="once">Once</option>
											</select>

											${() =>
												this.state.trigger.scheduleType === "once"
													? html`
															<input type="datetime-local" .value=${() => this.state.trigger.scheduleDateTime} />
													  `
													: html` <input type="time" .value=${() => this.state.trigger.scheduleTime} /> `}
										</div>
								  `
								: ""}
					</div>
				</div>

				<div
					class="prompt-input"
					contenteditable="true"
					@input=${this.handlePromptInput.bind(this)}
					data-placeholder="Describe what you want to automate..."></div>

				<button class="send-btn" @click=${this.handleSubmit.bind(this)} ?disabled=${() => this.state.isGenerating}>
					<svg class="icon">
						<use href="/assets/icons.svg#send"></use>
					</svg>
				</button>

				${() => (this.state.error ? html` <div class="error-message">${this.state.error}</div> ` : "")} ${() =>
					this.state.isGenerating
						? html` <div class="loading-message">Summoning pipeline from the void...</div> `
						: ""}
			</div>
		`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("prompt-input-field", PromptInputField);
```

---

## 4. Pipeline Container

### Static HTML (Reference)

```html
<pipeline-container>
	<pipeline-action-bar>
		<div>10 Pipeline matched</div>
		<div class="action-btns">
			<button class="primary-btn">Create pipeline</button>
		</div>
	</pipeline-action-bar>
	<pipeline-list>
		<pipeline-card>...</pipeline-card>
	</pipeline-list>
</pipeline-container>
```

### Om.js Component (`/pipelines/components/station/pipeline-container.js`)

```javascript
import { react, html } from "/lib/om.compact.js";
import "./pipeline-action-bar.js";
import "./pipeline-list.js";

export class PipelineContainer extends HTMLElement {
	pipelines = [];
	selectedId = null;

	get matchCount() {
		return () => this.pipelines.length;
	}

	get selectedPipeline() {
		return () => this.pipelines.find((p) => p.id === this.selectedId);
	}

	render() {
		return html`
			<div class="pipeline-container">
				<pipeline-action-bar
					.matchCount=${this.matchCount()}
					.selectedPipeline=${this.selectedPipeline()}></pipeline-action-bar>

				<pipeline-list .pipelines=${() => this.pipelines} .selectedId=${() => this.selectedId}></pipeline-list>
			</div>
		`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("pipeline-container", PipelineContainer);
```

---

## 5. Pipeline Card

### Static HTML (Reference)

```html
<pipeline-card>
	<div class="pipeline-name">pipeline name</div>
	<pipeline-diagram>
		<div>trigger type</div>
		⬇︎
		<div>filter</div>
		⬇︎
		<div>Loop</div>
		⬇︎
		<div>output</div>
	</pipeline-diagram>
</pipeline-card>
```

### Om.js Component (`/pipelines/components/station/pipeline-card.js`)

```javascript
import { react, html } from "/lib/om.compact.js";
import "./pipeline-diagram.js";
import "./action-menu.js";

export class PipelineCard extends HTMLElement {
	pipeline = null;
	selected = false;
	showActions = false;

	handleClick() {
		this.dispatchEvent(
			new CustomEvent("pipeline-selected", {
				detail: { id: this.pipeline.id },
				bubbles: true,
			})
		);
	}

	render() {
		return html`
			<div class="pipeline-card ${() => (this.selected ? "selected" : "")}" @click=${this.handleClick.bind(this)}>
				<div class="card-header">
					<span class="pipeline-name"> ${() => this.pipeline?.name || "Untitled Pipeline"} </span>

					${() =>
						this.showActions ? html` <action-menu .pipelineId=${() => this.pipeline?.id}></action-menu> ` : ""}
				</div>

				<pipeline-diagram .nodes=${() => this.pipeline?.nodes || []}></pipeline-diagram>
			</div>
		`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("pipeline-card", PipelineCard);
```

---

## 6. Pipeline Diagram

### Om.js Component (`/pipelines/components/station/pipeline-diagram.js`)

```javascript
import { react, html, map } from "/lib/om.compact.js";

export class PipelineDiagram extends HTMLElement {
	nodes = [];

	get displayNodes() {
		return () => {
			if (this.nodes.length <= 4) {
				return this.nodes;
			}

			return [this.nodes[0], { type: "collapsed", count: this.nodes.length - 2 }, this.nodes[this.nodes.length - 1]];
		};
	}

	render() {
		return html`
			<div class="pipeline-diagram">
				${map(
					this.displayNodes,
					(node, index) => html`
						<div class="diagram-node">
							${() =>
								node.type === "collapsed"
									? html` <span class="node-collapsed">+${node.count} nodes</span> `
									: html` <span class="node-type">${node.type}</span> `}
						</div>

						${() => (index < this.displayNodes().length - 1 ? html` <div class="diagram-arrow">⬇︎</div> ` : "")}
					`
				)}
			</div>
		`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("pipeline-diagram", PipelineDiagram);
```

---

## 7. Pipelines Drawer

### Static HTML (Reference)

```html
<pipelines-drawer-panel popover="">
	<pipeline-list>
		<pipeline-card>...</pipeline-card>
	</pipeline-list>
</pipelines-drawer-panel>
```

### Om.js Component (`/pipelines/components/station/pipelines-drawer.js`)

```javascript
import { react, html } from "/lib/om.compact.js";
import { IndexedDBManager } from "../../core/storage/IndexedDBManager.js";
import "./pipeline-list.js";

export class PipelinesDrawer extends HTMLElement {
	popover = "manual";

	state = react({
		pipelines: [],
		searchQuery: "",
		isLoading: false,
	});

	async loadPipelines() {
		this.state.isLoading = true;

		try {
			const db = new IndexedDBManager();
			await db.init();
			const pipelines = await db.getAll("pipelines");
			this.state.pipelines = pipelines;
		} catch (error) {
			console.error("Failed to load pipelines:", error);
		} finally {
			this.state.isLoading = false;
		}
	}

	get filteredPipelines() {
		return () => {
			if (!this.state.searchQuery) {
				return this.state.pipelines;
			}

			const query = this.state.searchQuery.toLowerCase();
			return this.state.pipelines.filter((p) => p.name.toLowerCase().includes(query));
		};
	}

	toggle() {
		if (this.matches(":popover-open")) {
			this.hidePopover();
		} else {
			this.showPopover();
			this.loadPipelines();
		}
	}

	handleClose() {
		this.hidePopover();
	}

	render() {
		return html`
			<div class="drawer-header">
				<h2>My Pipelines</h2>
				<button class="close-btn" @click=${this.handleClose.bind(this)}>✕</button>
			</div>

			<div class="drawer-search">
				<input type="search" .value=${() => this.state.searchQuery} placeholder="Search pipelines..." />
			</div>

			${() =>
				this.state.isLoading
					? html` <div class="loading">Loading pipelines...</div> `
					: html` <pipeline-list .pipelines=${this.filteredPipelines()} .showActions=${true}></pipeline-list> `}
		`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("pipelines-drawer", PipelinesDrawer);
```

---

## 8. Action Menu

### Om.js Component (`/pipelines/components/station/action-menu.js`)

```javascript
import { react, html } from "/lib/om.compact.js";

export class ActionMenu extends HTMLElement {
	pipelineId = null;

	state = react({
		isOpen: false,
	});

	handleToggle(e) {
		e.stopPropagation();
		this.state.isOpen = !this.state.isOpen;
	}

	handleEdit(e) {
		e.stopPropagation();
		this.dispatchEvent(
			new CustomEvent("pipeline-edit", {
				detail: { id: this.pipelineId },
				bubbles: true,
			})
		);
		this.state.isOpen = false;
	}

	handleDelete(e) {
		e.stopPropagation();
		this.dispatchEvent(
			new CustomEvent("pipeline-delete", {
				detail: { id: this.pipelineId },
				bubbles: true,
			})
		);
		this.state.isOpen = false;
	}

	render() {
		return html`
			<div class="action-menu" tabindex="0">
				<button class="menu-trigger" @click=${this.handleToggle.bind(this)}>
					<svg class="icon">
						<use href="/assets/icons.svg#menu"></use>
					</svg>
				</button>

				${() =>
					this.state.isOpen
						? html`
								<menu class="menu-dropdown">
									<li @click=${this.handleEdit.bind(this)}>
										<svg class="icon">
											<use href="/assets/icons.svg#edit"></use>
										</svg>
										<span>Edit</span>
									</li>

									<li @click=${this.handleDelete.bind(this)}>
										<svg class="icon">
											<use href="/assets/icons.svg#delete"></use>
										</svg>
										<span>Delete</span>
									</li>
								</menu>
						  `
						: ""}
			</div>
		`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());

		document.addEventListener("click", (e) => {
			if (!this.contains(e.target)) {
				this.state.isOpen = false;
			}
		});
	}
}

customElements.define("action-menu", ActionMenu);
```

---

## Key Conversion Patterns

### Pattern 1: Static Text → Reactive Text

```javascript
// Static HTML
<div>10 Pipeline matched</div>

// Om.js
<div>${() => this.matchCount} Pipeline${() => this.matchCount !== 1 ? 's' : ''} matched</div>
```

### Pattern 2: Conditional Classes

```javascript
// Static HTML
<div class="pipeline-card selected">

// Om.js
<div class="pipeline-card ${() => this.selected ? 'selected' : ''}">
```

### Pattern 3: Checkbox with State

```javascript
// Static HTML
<input type="checkbox">

// Om.js
<input
  type="checkbox"
  ?checked=${() => this.state.trigger.manual}
  @change=${this.handleTriggerChange.bind(this, 'manual')}
/>
```

### Pattern 4: Conditional Rendering

```javascript
// Static HTML
<!-- If checked -->
<input type="url" name="webhook-api">

// Om.js
${() => this.state.trigger.webhook ? html`
  <input type="url" .value=${() => this.state.trigger.webhookUrl} />
` : ''}
```

### Pattern 5: Loop Rendering

```javascript
// Static HTML
<pipeline-card>...</pipeline-card>
<pipeline-card>...</pipeline-card>

// Om.js
${map(
  () => this.pipelines,
  (pipeline) => html`
    <pipeline-card .pipeline=${pipeline}></pipeline-card>
  `
)}
```

---

## Important Reminders for Kiro

1. **Keep existing CSS classes** - Use exact class names from reference HTML
2. **No inline styles** - All styling via external CSS
3. **connectedCallback last** - Always the last method in class
4. **Bind event handlers** - Always use `.bind(this)`, never arrow functions
5. **Arrow functions for reactivity** - Use `${() => ...}` for dynamic values
6. **Two-way binding** - Just `.value=${() => state.prop}`, no @input needed
7. **No comments in templates** - Comments cause errors in html`` blocks
8. **Props as direct properties** - `this.pipeline = null`, not in constructor
