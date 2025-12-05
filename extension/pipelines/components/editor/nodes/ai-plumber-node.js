import { AiPipelinePreviewDialog } from "./ai-pipeline-preview-dialog.js";
import { PipelineGenerator } from "../../../ai/pipeline-generator.js";
import { html } from "../../../../lib/om.compact.js";

export class AiPlumberNodeCard extends HTMLElement {
	constructor() {
		super();
		this.className = "node-config-popup";
	}

	showPreviewDialog(result) {
		this.pipesPreviewDialog = new AiPipelinePreviewDialog(result);
		this.appendChild(this.pipesPreviewDialog);

		function reGenerate(e) {
			// Pre-fill form with previous values
			/* const intentInput = this.querySelector('input[name="intent"]');
			const dataSourceInput = this.querySelector('input[name="dataSource"]');

			if (intentInput) intentInput.value = e.detail.intent || "";
			if (dataSourceInput) dataSourceInput.value = e.detail.dataSource || "";

			// Trigger generation
			this.handleGenerate(new Event("submit")); */
		}

		$on(this.pipesPreviewDialog, "insertpipeline", (e) => {
			fireEvent(this.parentElement, "insertpipeline", result), this.remove();
		});
		$on(this.pipesPreviewDialog, "regenerate-pipeline", reGenerate);
	}

	async handleGenerate() {
		this.generator = new PipelineGenerator();
		this.isGenerating = true;
		// this.updateGeneratingState(true);
		try {
			const result = await this.generator.generatePipeline();
			// Show preview dialog
			this.showPreviewDialog(result);
		} catch (error) {
			notify(`Generation failed: ${error.message}`, "error");
		} finally {
			this.isGenerating = false;
			// this.updateGeneratingState(false);
		}
	}

	render() {
		return html`<header>
				<svg class="icon">
					<use href="/assets/icons.svg#ai-plumber"></use>
				</svg>
				<span>AI Plumber</span>
				<div class="action-btns">
					<button class="icon-btn" title="Minimize">
						<svg class="icon">
							<use href="/assets/icons.svg#contract"></use>
						</svg>
					</button>
				</div>
			</header>
			<section>
				<ul class="config-field-list">
					<label>Tell me what you want to do</label>
					<blockquote
						class="prompt-input"
						contenteditable="true"
						placeholder="Extract product names, prices, and ratings from Amazon search results"></blockquote>

					<details>
						<summary>Optional</summary>
						<ul>
							<li>
								<div class="top-header">
									Input format:
									<select class="input-format-select">
										<option value="json">Json</option>
										<option value="html">HTML</option>
										<option value="raw">RAW</option>
									</select>
								</div>
								<blockquote
									class="input-sample"
									contenteditable="true"
									placeholder="Paste sample input data..."></blockquote>
							</li>

							<li>
								<div class="top-header">
									Output format:
									<select class="output-format-select">
										<option value="json">Json</option>
										<option value="html">HTML</option>
										<option value="raw">RAW</option>
									</select>
								</div>
								<blockquote
									class="output-sample"
									contenteditable="true"
									placeholder="Paste expected output example..."></blockquote>
							</li>
						</ul>
					</details>

					<button type="submit" class="primary-btn" @click=${this.handleGenerate.bind(this)}>
						<svg class="icon">
							<use href="/assets/icons.svg#generate"></use>
						</svg>
						<span>Generate</span>
					</button>
				</ul>
			</section>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("ai-plumber-node-card", AiPlumberNodeCard);
