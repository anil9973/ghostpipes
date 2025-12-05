import { HttpPostConfig } from "../../../../models/configs/output/HttpPostConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { KeyValueRow } from "../input/http-fetch-node.js";
import { pipedb } from "../../../../db/pipeline-db.js";

export class HttpPostRequestNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = react(pipeNode);
		/** @type {HttpPostConfig}  */
		this.config = pipeNode.config;
		this.ensureEmptyRows();
	}

	ensureEmptyRows() {
		this.ensureEmptyRow(this.config.headers);
		this.ensureEmptyRow(this.config.bodyFields);
	}

	ensureEmptyRow(list) {
		const last = list[list.length - 1];
		if (!last || last.key !== "" || last.value !== "") list.push({ key: "", value: "" });
	}

	handleRowInput(list, index) {
		if (index === list.length - 1) this.ensureEmptyRow(list);
	}

	handleRemoveRow(list, index) {
		list.splice(index, 1);
		this.ensureEmptyRow(list);
	}

	async handleSave() {
		try {
			const config = Object.assign({}, this.config);
			this.config.headers = Object.assign([], this.config.headers).filter((h) => h.key.trim() !== "");
			this.config.bodyFields = Object.assign([], this.config.bodyFields).filter((b) => b.key.trim() !== "");
			fireEvent(this, "save-node-config", this.pipeNode);
			await pipedb.updateNodeConfig(config, this.pipeNode.id);
			this.ensureEmptyRows();
			this.hidePopover();
		} catch (error) {
			console.error(error);
		}
	}

	onClosedPopover() {}

	render() {
		return html`<section>
			<ul class="config-field-list">
				<label>
					<div>Request URL</div>
					<div class="row url-input">
						<select .value=${() => this.config.method}>
							<option value="POST">POST</option>
							<option value="PUT">PUT</option>
							<option value="PATCH">PATCH</option>
							<option value="DELETE">DELETE</option>
						</select>
						<input type="url" .value=${() => this.config.url} placeholder="https://api.example.com/data" />
					</div>
				</label>

				<div class="headers-section">
					<label>Headers</label>
					<table class="headers">
						<thead>
							<tr>
								<th>Key</th>
								<th>Value</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							${map(
								this.config.headers,
								(row, i) =>
									new KeyValueRow(
										row,
										() => this.handleRemoveRow(this.config.headers, i),
										i === this.config.headers.length - 1,
										"Header",
										"Value"
									)
							)}
						</tbody>
					</table>
				</div>

				<tabular-carousel>
					<tab-strip-row>
						<div
							class="${() => (this.config.contentType === "urlencoded" ? "active" : "")}"
							@click=${() => (this.config.contentType = "urlencoded")}>
							URL-encoded
						</div>
						<div
							class="${() => (this.config.contentType === "json" ? "active" : "")}"
							@click=${() => (this.config.contentType = "json")}>
							JSON
						</div>
						<div
							class="${() => (this.config.contentType === "raw" ? "active" : "")}"
							@click=${() => (this.config.contentType = "raw")}>
							RAW
						</div>
					</tab-strip-row>

					<carousel-body>
						${() =>
							this.config.contentType === "urlencoded"
								? html`
										<table class="urlencoded-body">
											<thead>
												<tr>
													<th>Key</th>
													<th>Value</th>
													<th></th>
												</tr>
											</thead>
											<tbody>
												${map(
													this.config.bodyFields,
													(row, i) =>
														new KeyValueRow(
															row,
															() => this.handleRemoveRow(this.config.bodyFields, i),
															i === this.config.bodyFields.length - 1,
															"Body Key",
															"Body Value"
														)
												)}
											</tbody>
										</table>
								  `
								: ""}
						${() =>
							this.config.contentType === "json"
								? html`<div class="json-editor-placeholder">
										<textarea .value=${() => this.config.rawBody} placeholder="{ 'key': 'value' }"></textarea>
								  </div>`
								: ""}
						${() =>
							this.config.contentType === "raw"
								? html`<textarea .value=${() => this.config.rawBody} placeholder="Raw text body"></textarea> `
								: ""}
					</carousel-body>
				</tabular-carousel>
			</ul>
		</section> `;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "http-post-large", title: "HTTP POST" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render());
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("http-post-request-node-card", HttpPostRequestNodePopup);
