import { HttpContentType, HttpPostConfig } from "../../../../models/configs/output/HttpPostConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { KeyValueRow } from "../input/http-fetch-node.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { ConfigErrorBox } from "../config-error-box.js";

export class HttpPostRequestNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {HttpPostConfig}  */
		this.config = pipeNode.config;
		this.errors = react([]);
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
			this.config.headers = this.config.headers.filter((h) => h.key.trim() !== "");
			this.config.bodyFields = this.config.bodyFields.filter((b) => b.key.trim() !== "");
			this.errors.splice(0, this.errors.length, ...this.config.validate());
			if (this.errors.length !== 0) return;
			this.pipeNode.summary = this.config.getSummary();

			const config = Object.assign({}, this.config);
			//prettier-ignore
			config.headers = Object.assign([], this.config.headers.map((h) => Object.assign({}, h)));
			//prettier-ignore
			config.bodyFields = Object.assign([], this.config.bodyFields.map((field) => Object.assign({}, field)));
			await pipedb.updateNodeConfig(this.pipeNode.id, config, this.pipeNode.summary);

			fireEvent(this, "savenodeconfig", this.pipeNode);
			this.ensureEmptyRows();
			this.hidePopover();
		} catch (error) {
			console.error(error);
		}
	}

	onClosedPopover() {}

	onTabChange({ target }) {
		this.config.contentType = target.value;
	}

	render() {
		const radioName = "output_http_post";
		console.log(this.config.contentType);
		return html`<section>
			<ul class="config-field-list">
				<label>
					<div>Request URL</div>
					<div class="select-input">
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
						<tbody @change=${this.ensureEmptyRows.bind(this)}>
							${map(
								this.config.headers,
								(row, i) =>
									new KeyValueRow(row, this.handleRemoveRow.bind(this, this.config.headers, i), "Header", "Value")
							)}
						</tbody>
					</table>
				</div>

				<tabular-carousel>
					<tab-strip-row @change=${this.onTabChange.bind(this)}>
						<label>
							<input
								type="radio"
								name="${radioName}"
								value="${HttpContentType.JSON}"
								?checked=${this.config.contentType === "application/json"}
								hidden />JSON
						</label>
						<label>
							<input
								type="radio"
								name="${radioName}"
								value="${HttpContentType.FORM_URLENCODED}"
								?checked=${this.config.contentType === HttpContentType.FORM_URLENCODED}
								hidden />URL-encoded
						</label>
						<label>
							<input
								type="radio"
								name="${radioName}"
								value="${HttpContentType.TEXT}"
								?checked=${this.config.contentType === "raw"}
								hidden />RAW
						</label>
					</tab-strip-row>

					<carousel-body>
						<div class="json-editor-placeholder">
							<textarea .value=${() => this.config.rawBody} placeholder="{ 'key': 'value' }"></textarea>
						</div>
						<table class="urlencoded-body" hidden>
							<thead>
								<tr>
									<th>Key</th>
									<th>Value</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								${
									/* prettier-ignore */ map(this.config.bodyFields, (row, i) => new KeyValueRow( row, this.handleRemoveRow.bind(this, this.config.bodyFields, i), "Body Key", "Body Value" ) )
								}
							</tbody>
						</table>

						<div hidden>
							<textarea .value=${() => this.config.rawBody} placeholder="Raw text body"></textarea>
						</div>
					</carousel-body>
				</tabular-carousel>
			</ul>
		</section> `;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "http-post-large", title: "HTTP POST" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("http-post-request-node-card", HttpPostRequestNodePopup);
