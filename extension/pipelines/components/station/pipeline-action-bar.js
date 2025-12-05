import { html } from "../../../lib/om.compact.js";

/** PipelineActionBar - Show match count and action buttons */
export class PipelineActionBar extends HTMLElement {
	/** @param {{ matchCount: number; selectPipelineId: string; }} props */
	constructor(props) {
		super();
		this.props = props;
	}

	handleCreateNew() {
		window.location.search = "?p=new-pipeline";
	}

	handleEdit() {
		window.location.search = `?p=${this.props.selectPipelineId}`;
	}

	async handleRun() {
		const response = await chrome.runtime.sendMessage({
			type: "EXECUTE_PIPELINE",
			pipelineId: this.props.selectPipelineId,
		});
		if (response.errCaused) return notify(response.errCaused, "error");
		notify("Task complete");
	}

	render() {
		return html`<div class="match-count"><data>${() => this.props.matchCount}</data> Pipeline matched</div>
			<div class="action-btns">
				${() =>
					this.props.selectPipelineId
						? html`<button class="text-btn" @click=${this.handleEdit.bind(this)}>
									<svg class="icon">
										<use href="/assets/icons.svg#edit"></use>
									</svg>
									<span>Edit</span>
								</button>

								<button class="primary-btn" @click=${this.handleRun.bind(this)}>
									<svg class="icon">
										<use href="/assets/icons.svg#run"></use>
									</svg>
									<span>Run</span>
								</button>`
						: html`<button class="primary-btn" @click=${this.handleCreateNew.bind(this)}>
								<svg class="icon">
									<use href="/assets/icons.svg#plus-thick"></use>
								</svg>
								<span>Create Pipeline</span>
						  </button>`}
			</div>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("pipeline-action-bar", PipelineActionBar);
