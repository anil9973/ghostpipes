import { HttpRequestConfig } from "../../../../models/configs/input/HttpRequestConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { PipeNode } from "../../../../models/PipeNode.js";

export class HttpFetchNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {HttpRequestConfig}  */
		this.config = react(pipeNode.config);
		this.ensureEmptyRows();
	}

	ensureEmptyRows() {
		this.ensureEmptyRow(this.config.headers);
		this.ensureEmptyRow(this.config.queryParams);
	}

	ensureEmptyRow(list) {
		const last = list[list.length - 1];
		if (!last || last.key !== "" || last.value !== "") {
			list.push({ key: "", value: "" });
		}
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
			config.headers = Object.assign([], this.config.headers).filter((h) => h.key.trim() !== "");
			config.queryParams = Object.assign([], this.config.queryParams).filter((q) => q.key.trim() !== "");
			await pipedb.updateNodeConfig(config, this.pipeNode.id);

			fireEvent(this, "save-node-config", this.pipeNode);
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
							<option value="GET">GET</option>
							<option value="POST">POST</option>
							<option value="PUT">PUT</option>
							<option value="DELETE">DELETE</option>
						</select>
						<input type="url" .value=${() => this.config.url} placeholder="https://api.example.com/data" />
					</div>
				</label>

				<tabular-carousel>
					<tab-strip-row>
						<div class="active">Headers</div>
						<div>Query</div>
					</tab-strip-row>

					<carousel-body>
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
						<table class="query-params">
							<thead>
								<tr>
									<th>Param</th>
									<th>Value</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								${map(
									this.config.queryParams,
									(row, i) =>
										new KeyValueRow(
											row,
											() => this.handleRemoveRow(this.config.queryParams, i),
											i === this.config.queryParams.length - 1,
											"q", // keyPlaceholder
											"search" // valuePlaceholder
										)
								)}
							</tbody>
						</table>
					</carousel-body>
				</tabular-carousel>
			</ul>
		</section> `;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "http-fetch", title: "HTTP Fetch" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render());
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("http-fetch-node-card", HttpFetchNodePopup);

export class KeyValueRow extends HTMLTableRowElement {
	/**
	 * @param {Object} pair - Reactive object {key, value}
	 * @param {Function} onDelete - Callback to remove row
	 * @param {boolean} isLast - If true, delete button is hidden (phantom row)
	 * @param {string} [keyPlaceholder="Key"]
	 * @param {string} [valuePlaceholder="Value"]
	 */
	constructor(pair, onDelete, isLast, keyPlaceholder = "Key", valuePlaceholder = "Value") {
		super();
		this.pair = pair;
		this.onDelete = onDelete;
		this.isLast = isLast;
		this.keyPlaceholder = keyPlaceholder;
		this.valuePlaceholder = valuePlaceholder;
	}

	render() {
		// Cell 1: Key Input
		const cell1 = html` <input type="text" .value=${() => this.pair.key} placeholder="${this.keyPlaceholder}" /> `;
		this.insertCell().appendChild(cell1);

		// Cell 2: Value Input
		const cell2 = html`
			<input type="text" .value=${() => this.pair.value} placeholder="${this.valuePlaceholder}" />
		`;
		this.insertCell().appendChild(cell2);

		// Cell 3: Delete Button
		const cell3 = html`
			<button class="icon-btn delete-btn" style="${() => (this.isLast && !this.pair.key ? "visibility:hidden" : "")}">
				<svg class="icon"><use href="/assets/icons.svg#delete"></use></svg>
			</button>
		`;
		this.insertCell().appendChild(cell3);
	}

	connectedCallback() {
		this.render();
	}
}

customElements.define("key-value-row", KeyValueRow, { extends: "tr" });
