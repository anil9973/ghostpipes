import { LookupConfig } from "../../../../models/configs/processing/LookupConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { ConfigErrorBox } from "../config-error-box.js";

export class LookupDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {LookupConfig}  */
		this.config = pipeNode.config;
		this.errors = react([]);
	}

	ensureEmptyRows() {
		this.ensureEmptyRow(this.config.headers);
		this.ensureEmptyRow(this.config.queryParams);
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
		this.errors.splice(0, this.errors.length, ...this.config.validate());
		if (this.errors.length !== 0) return;
		/* this.pipeNode.summary = this.config.getSummary();
		const config = Object.assign({}, this.config);
		await pipedb.updateNodeConfig(this.pipeNode.id, config,  this.pipeNode.summary);;
		this.config.headers = this.config.headers.filter((h) => h.key.trim() !== "");
		this.config.queryParams = this.config.queryParams.filter((q) => q.key.trim() !== "");

		fireEvent(this, "savenodeconfig", this.pipeNode);
		this.hidePopover();
		this.ensureEmptyRows(); */
	}

	onClosedPopover() {
		// TODO validate
	}

	render() {
		return html` <header>
				<svg class="icon"><use href="/assets/icons.svg#lookup-large"></use></svg>
				<span>Lookup</span>
				<div class="action-btns">
					<button class="icon-btn" @click=${this.handleSave} title="Save & Close">
						<svg class="icon"><use href="/assets/icons.svg#check-all"></use></svg>
					</button>
					<button class="icon-btn" @click=${this.handleClose} title="Close">
						<svg class="icon"><use href="/assets/icons.svg#close"></use></svg>
					</button>
				</div>
			</header>

			<section>
				<ul class="config-field-list">
					<div>
						<label>Lookup source:</label>
						<select .value=${() => this.config.source}>
							<option value="api">External API</option>
							<option value="table">Lookup table (uploaded)</option>
							<option value="previous">Previous pipeline result</option>
						</select>
					</div>

					<!-- External API Inputs -->
					${() =>
						this.config.source === "api"
							? html`
									<label>
										<div>Request URL</div>
										<div class="select-input">
											<select .value=${() => this.config.requestMethod}>
												<option value="GET">GET</option>
											</select>
											<input type="url" .value=${() => this.config.requestUrl} />
										</div>
									</label>

									<tabular-carousel>
										<tab-strip-row>
											<div>Header</div>
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
														(row, i) => html`
															<tr @input=${this.handleRowInput.bind(this, this.config.headers, i)}>
																<td><input type="text" .value=${() => row.key} /></td>
																<td><input type="text" .value=${() => row.value} /></td>
																<td>
																	<button
																		class="icon-btn delete-btn"
																		@click=${this.handleRemoveRow.bind(this, this.config.headers, i)}
																		style="${() =>
																			i === this.config.headers.length - 1 && !row.key ? "visibility:hidden" : ""}">
																		<svg class="icon"><use href="/assets/icons.svg#delete"></use></svg>
																	</button>
																</td>
															</tr>
														`
													)}
												</tbody>
											</table>
										</carousel-body>
									</tabular-carousel>
							  `
							: ""}

					<div>
						<label><div>Extract from response:</div></label>
						<input type="text" style="width: 100%;" placeholder="JSON path" .value=${() => this.config.extractPath} />
					</div>

					<div class="config-row">
						<div>
							<label><div>Merge strategy:</div></label>
							<select .value=${() => this.config.mergeStrategy}>
								<option value="merge">Merge fields into item</option>
								<option value="nest">Nest under new field</option>
								<option value="replace">Replace item</option>
							</select>
						</div>

						<div>
							<label><div>If lookup fails:</div></label>
							<select .value=${() => this.config.failureAction}>
								<option value="continue">Continue (null values)</option>
								<option value="skip">Skip item</option>
								<option value="fail">Fail pipeline</option>
							</select>
						</div>
					</div>

					<div>
						<input
							type="checkbox"
							?checked=${() => this.config.rateLimit}
							@change=${(e) => (this.config.rateLimit = e.target.checked)} />
						<label>Rate limiting:</label>
						<span> Delay <input type="number" .value=${() => this.config.delay} style="width: 4em;" /> ms </span>
					</div>
				</ul>
			</section>`;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "lookup-large", title: "Lookup" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("lookup-data-node-card", LookupDataNodePopup);
