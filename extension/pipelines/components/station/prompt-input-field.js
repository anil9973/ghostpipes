import { RecommendationService } from "../../services/recommendation/index.js";
import { html, react } from "../../../lib/om.compact.js";
import { db, Store } from "../../db/db.js";
import { RecommendPipelineContainer } from "./recommend-pipeline-container.js";

/** PromptInputField - AI prompt input with trigger configuration */
export class PromptInputField extends HTMLElement {
	state = react({ promptText: "", isGenerating: false, error: null });

	constructor() {
		super();
	}

	async handleSubmit() {
		this.state.isGenerating = true;
		this.state.error = null;

		try {
			const promptText = this.promptField.textContent.trim();
			const pipelines = await db.getAll(Store.Pipelines);
			const recommendationService = new RecommendationService();
			const recommendations = await recommendationService.recommend(promptText, pipelines);
			this.after(new RecommendPipelineContainer(recommendations));
		} catch (error) {
			this.state.error = error.message || "Failed to generate pipeline";
			this.state.isGenerating = false;
		}
	}

	async pickFiles() {
		try {
			//prettier-ignore
			const types = [{ description: "Text/CSV file", accept: { "text/*": [".txt", ".md", ".html", ".csv"], accept: { "application/*": [".xlsx", ".json"], "text/*": [".csv", ".md", ".html"] } } }];
			/** @type {FileSystemFileHandle[]} */
			// @ts-ignore
			const fileHandles = await showOpenFilePicker({ multiple: true, startIn: "documents", types });
			fileHandles.length === 0 || this.files ? this.files.push(...fileHandles) : (this.files = []);
		} catch (error) {
			if (navigator["brave"] && error.message === "showOpenFilePicker is not defined") {
				toast("Enable file access api");
				await new Promise((r) => setTimeout(r, 2000));
			}
			console.warn(error.message);
		}
	}

	render() {
		return html`<div class="prompt-wrapper">
			<section
				contenteditable="true"
				data-placeholder="Paste text or upload files"
				ref=${(node) => (this.promptField = node)}></section>

			<div class="action-btns">
				<button class="icon-btn" @click=${this.pickFiles.bind(this)} title="Upload text and csv files">
					<svg class="icon"><use href="/assets/icons.svg#attachment"></use></svg>
				</button>
				<button
					type="submit"
					class="icon-btn"
					@click=${this.handleSubmit.bind(this)}
					?disabled=${() => this.state.isGenerating}
					title="AI suggest best pipeline">
					<svg class="icon"><use href="/assets/icons.svg#send"></use></svg>
				</button>
			</div>

			${() => (this.state.error ? html` <div class="error-message" role="alert">${this.state.error}</div> ` : "")}
			${() =>
				this.state.isGenerating ? html` <div class="loading-message">Summoning pipeline from the void...</div> ` : ""}
		</div>`;
	}

	async connectedCallback() {
		this.replaceChildren(this.render());
		const { selectedTexts } = await chrome.storage.session.get("selectedTexts");
		//prettier-ignore
		selectedTexts && (this.promptField.textContent = Object.values(selectedTexts) .map((t) => t) .join("\n"));
	}
}

customElements.define("prompt-input-field", PromptInputField);
