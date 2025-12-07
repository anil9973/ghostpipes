import { AggregateConfig, AggregateOperation } from "../../../../models/configs/processing/AggregateConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { ConfigErrorBox } from "../config-error-box.js";

export class AggregateDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {AggregateConfig}  */
		this.config = pipeNode.config;
		this.errors = react([]);
		this.ensureEmptyRow();
	}

	ensureEmptyRow() {
		const list = this.config.aggregations;
		const last = list[list.length - 1];
		if (last && last.field === "" && last.alias === "") return;
		list.push({ field: "", operation: AggregateOperation.AVG, alias: "" });
	}

	handleRowInput(index) {
		if (index !== this.config.aggregations.length - 1) return this.ensureEmptyRow();
	}

	handleRemoveRow(index) {
		this.config.aggregations.splice(index, 1);
		this.ensureEmptyRow();
	}

	async handleSave() {
		try {
			this.config.aggregations = this.config.aggregations.filter((a) => a.field.trim() !== "");
			this.errors.splice(0, this.errors.length, ...this.config.validate());
			if (this.errors.length !== 0) return;
			this.pipeNode.summary = this.config.getSummary();

			const config = Object.assign({}, this.config);
			config.groupByFields = Object.assign([], config.groupByFields);
			//prettier-ignore
			config.aggregations = Object.assign([], config.aggregations.map((a) => Object.assign({}, a)));

			await pipedb.updateNodeConfig(this.pipeNode.id, config, this.pipeNode.summary);
			fireEvent(this, "savenodeconfig", this.pipeNode);
			this.ensureEmptyRow();
			this.hidePopover();
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
			<ul class="config-field-list">
				<table class="rule-list">
					<thead>
						<tr>
							<th>Aggregations</th>
							<th>Property</th>
							<th>Output Key</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						${map(
							this.config.aggregations,
							(item, index) =>
								new AggregateRuleRow(item, this.pipeNode.properties, this.handleRemoveRow.bind(this, index))
						)}
					</tbody>
				</table>

				<datalist id="agg-props">${map(this.pipeNode.properties, (prop) => new Option(prop))}</datalist>

				<div>
					<label>
						<input type="checkbox" ?checked=${() => this.config.groupByKey} />
						Include group key in output
					</label>
				</div>
			</ul>
		</section>`;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "aggregate", title: "Aggregate" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("aggregate-data-node-card", AggregateDataNodePopup);

export class AggregateRuleRow extends HTMLTableRowElement {
	constructor(agg, properties, onDelete, isLast) {
		super();
		this.agg = agg;
		this.properties = properties;
		this.onDelete = onDelete;
	}

	render() {
		// Aggregation type select
		const cell1 = html`<select .value=${() => this.agg.operation}>
			<option value=${AggregateOperation.SUM}>SUM</option>
			<option value=${AggregateOperation.AVG}>AVG</option>
			<option value=${AggregateOperation.COUNT}>COUNT</option>
			<option value=${AggregateOperation.MIN}>MIN</option>
			<option value=${AggregateOperation.MAX}>MAX</option>
			<option value=${AggregateOperation.FIRST}>FIRST</option>
			<option value=${AggregateOperation.LAST}>LAST</option>
		</select>`;
		this.insertCell().appendChild(cell1);

		// Field input + datalist
		const datalistId = "agg-properties";
		const cell2 = html`<div class="input-wrapper">
			<input type="text" placeholder="field" list=${datalistId} .value=${() => this.agg.field} />
			<datalist id=${datalistId}>${map(this.properties, (p) => html`<option value=${p}></option>`)}</datalist>
		</div>`;
		this.insertCell().appendChild(cell2);

		// Output key input
		const cell3 = html` <input type="text" placeholder="alias" .value=${() => this.agg.alias} /> `;
		this.insertCell().appendChild(cell3);

		// Delete button
		const cell4 = html` <button
			class="icon-btn delete-btn"
			@click=${this.onDelete}
			style="visibility:${() => (this.agg.field ? "visible" : "hidden")}">
			<svg class="icon"><use href="/assets/icons.svg#delete"></use></svg>
		</button>`;
		this.insertCell().appendChild(cell4);
	}

	connectedCallback() {
		this.render();
	}
}

customElements.define("aggregate-rule-row", AggregateRuleRow, { extends: "tr" });
