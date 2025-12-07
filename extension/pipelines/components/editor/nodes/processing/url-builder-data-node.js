import { UrlBuilderConfig } from "../../../../models/configs/processing/UrlBuilderConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { ConfigErrorBox } from "../config-error-box.js";

export class UrlBuilderDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {UrlBuilderConfig}  */
		this.config = pipeNode.config;
		this.errors = react([]);
		this.ensureEmptyRows();
	}

	ensureEmptyRows() {
		this.ensureEmptyQueryParam();
	}

	ensureEmptyQueryParam() {
		const list = this.config.queryParams;
		const last = list[list.length - 1];
		if (!last || last.key !== "") {
			list.push({ key: "", value: "" });
		}
	}

	handleAddSegment() {
		this.config.pathSegments.push("");
	}

	handleRemoveSegment(index) {
		this.config.pathSegments.splice(index, 1);
	}

	handleQueryInput(index) {
		if (index === this.config.queryParams.length - 1) this.ensureEmptyQueryParam();
	}

	handleRemoveQuery(index) {
		this.config.queryParams.splice(index, 1);
		this.ensureEmptyQueryParam();
	}

	async handleSave() {
		try {
			this.config.pathSegments = this.config.pathSegments.filter((s) => s.trim() !== "");
			this.config.queryParams = this.config.queryParams.filter((q) => q.key.trim() !== "");
			this.errors.splice(0, this.errors.length, ...this.config.validate());
			if (this.errors.length !== 0) return;
			this.pipeNode.summary = this.config.getSummary();

			const config = Object.assign({}, this.config);
			config.pathSegments = Object.assign([], this.config.pathSegments);
			//prettier-ignore
			config.queryParams = Object.assign([], this.config.queryParams.map((q) => Object.assign({}, q)));

			await pipedb.updateNodeConfig(this.pipeNode.id, config, this.pipeNode.summary);
			fireEvent(this, "savenodeconfig", this.pipeNode);
			this.hidePopover();
			this.ensureEmptyRows();
		} catch (error) {
			console.error(error);
			notify(error.message, "error");
		}
	}

	onClosedPopover() {
		// TODO validate
	}

	render() {
		return html`<section>
			<div class="url-chunks">
				<label>
					<div class="header-card">Base Path</div>
					<input type="text" class="full-width-input" .value=${() => this.config.baseUrl} />
				</label>

				<label>
					<div class="header-card">Path segments</div>
					<ul class="path-segments">
						${map(
							this.config.pathSegments,
							(seg, index) => html`
								<li>
									<input type="text" .value=${() => seg.value} />
									<span class="segment-remove" @click=${this.handleRemoveSegment.bind(this, index)}>×</span>
								</li>
							`
						)}
						<li>
							<button class="icon-btn" @click=${this.handleAddSegment}>
								<svg class="icon"><use href="/assets/icons.svg#plus"></use></svg>
							</button>
						</li>
					</ul>
				</label>

				<div>
					<div class="header-card">Query Params</div>
					<table class="urlencoded-body">
						<thead>
							<tr>
								<th><input type="checkbox" disabled /></th>
								<th>Key</th>
								<th>Value</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							${map(
								this.config.queryParams,
								(param, index) => html`
									<tr @input=${this.handleQueryInput.bind(this, index)}>
										<td><input type="checkbox" disabled /></td>
										<td><input type="text" .value=${() => param.key} placeholder="Key" /></td>
										<td><input type="text" .value=${() => param.value} placeholder="Value" /></td>
										<td>
											<button
												class="icon-btn delete-btn"
												@click=${this.handleRemoveQuery.bind(this, index)}
												style="${() =>
													index === this.config.queryParams.length - 1 && !param.key ? "visibility:hidden" : ""}">
												<svg class="icon"><use href="/assets/icons.svg#delete"></use></svg>
											</button>
										</td>
									</tr>
								`
							)}
						</tbody>
					</table>
				</div>
			</div>
		</section> `;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "url-builder", title: "URL Builder" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("url-builder-data-node-card", UrlBuilderDataNodePopup);
