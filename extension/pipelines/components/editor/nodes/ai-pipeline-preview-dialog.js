import { html } from "../../../../lib/om.compact.js";
import { Pipeline } from "../../../models/Pipeline.js";
import { PipelineDiagram } from "../../station/pipeline-diagram.js";

/**
 * AiPipelinePreviewDialog - Shows generated pipeline preview with Insert button
 * Extends HTMLDialogElement for native modal behavior
 */
export class AiPipelinePreviewDialog extends HTMLDialogElement {
	/** @param {Pipeline} pipeline */
	constructor(pipeline) {
		super();
		this.id = "ai-pipeline-preview-dialog";
		this.pipeline = pipeline;
	}

	handleInsert() {
		// Dispatch event to insert pipeline into canvas
		fireEvent(this, "insertpipeline");
		this.close();
	}

	handleRegenerate() {
		// Dispatch event to regenerate with same input
		/* fireEvent(this, "regenerate-pipeline", {
			intent: this.pipeline?.metadata?.userIntent,
			dataSource: this.pipeline?.metadata?.dataSource,
		}); */
	}

	/* renderNodeList() {
		if (!this.pipeline?.nodes) {
			return html`<p class="error">No nodes generated</p>`;
		}

		const item = (node, index) => html`
			<div class="node-preview-item">
				<div class="node-number">${index + 1}</div>
				<div class="node-details">
					<div class="node-type">${node.type}</div>
					<div class="node-id">${node.id}</div>
					${node.config
						? html`
								<details class="node-config">
									<summary>Config</summary>
									<pre>${JSON.stringify(node.config, null, 2)}</pre>
								</details>
						  `
						: ""}
				</div>
			</div>
		`;

		return html`<div class="node-list">${this.pipeline.nodes.map(item)}</div> `;
	}

	renderMetadata() {
		if (!this.pipeline?.metadata) return "";

		return html`<div class="metadata-section">
			<h3>Pipeline Info</h3>
			<dl>
				<dt>Intent:</dt>
				<dd>${this.pipeline.metadata.userIntent}</dd>
				<dt>Data Source:</dt>
				<dd>${this.pipeline.metadata.dataSource}</dd>
				<dt>Generated:</dt>
				<dd>${new Date(this.pipeline.metadata.generatedAt).toLocaleString()}</dd>
				<dt>Nodes:</dt>
				<dd>${this.pipeline.nodes?.length || 0}</dd>
			</dl>
		</div>`;
	}

	renderReasoning() {
		if (!this.pipeline?.reasoning) return "";

		return html`<div class="reasoning-section">
			<h3>AI Reasoning</h3>
			<p>${this.pipeline.reasoning}</p>
		</div>`;
	}

	renderTrigger() {
		if (!this.pipeline?.trigger) return "";

		return html`<div class="trigger-section">
			<h3>Trigger</h3>
			<div class="trigger-info">
				<span class="trigger-type">${this.pipeline.trigger.type}</span>
				${this.pipeline.trigger.config
					? html` <pre>${JSON.stringify(this.pipeline.trigger.config, null, 2)}</pre> `
					: ""}
			</div>
		</div>`;
	} */

	render() {
		// ${this.renderMetadata()} ${this.renderReasoning()} ${this.renderTrigger()}
		return html`<header>
				<svg class="icon"><use href="/assets/icons.svg#ai-plumber"></use></svg>
				<h3>AI Generated Pipeline</h3>
			</header>
			${new PipelineDiagram(this.pipeline)}

			<div class="dialog-footer">
				${this.pipeline
					? html`<button class="secondary-btn" @click=${this.handleRegenerate.bind(this)}>
								<svg class="icon"><use href="/assets/icons.svg#generate"></use></svg>
								<span>Regenerate</span>
							</button>
							<button class="outline-btn" @click=${this.remove.bind(this)}>Cancel</button>
							<button class="primary-btn" @click=${this.handleInsert.bind(this)}>
								<svg class="icon"><use href="/assets/icons.svg#send"></use></svg>
								<span>Insert Pipeline</span>
							</button>`
					: html`<button class="secondary-btn" @click=${this.handleRegenerate.bind(this)}>Try Again</button>
							<button class="primary-btn" @click=${this.remove.bind(this)}>Close</button> `}
			</div>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
		this.showModal();
	}
}

customElements.define("ai-pipeline-preview-dialog", AiPipelinePreviewDialog, { extends: "dialog" });
