import { html, react, map } from "../../../../../lib/om.compact.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { SortConfig } from "../../../../models/configs/processing/SortConfig.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { ConfigErrorBox } from "../config-error-box.js";
import { NodeConfigHeader } from "../config-node-header.js";

export class SortDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {SortConfig}  */
		this.config = pipeNode.config;
		this.errors = react([]);

		this.ensureEmptyRow();
	}

	ensureEmptyRow() {
		const list = this.config.criteria;
		const last = list[list.length - 1];
		if (!last || last.field !== "") {
			list.push({ enabled: true, field: "", order: "ascending" });
		}
	}

	handleRowInput(index) {
		if (index === this.config.criteria.length - 1) this.ensureEmptyRow();
	}

	handleRemoveRow(index) {
		this.config.criteria.splice(index, 1);
		this.ensureEmptyRow();
	}

	async handleSave() {
		try {
			this.config.criteria = this.config.criteria.filter((c) => c.field.trim() !== "");
			this.errors.splice(0, this.errors.length, ...this.config.validate());
			if (this.errors.length !== 0) return;
			this.pipeNode.summary = this.config.getSummary();

			const config = Object.assign({}, this.config);
			//prettier-ignore
			config.criteria = Object.assign([], this.config.criteria.map((c) => Object.assign({}, c)));

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
			<div>
				<table class="rule-list">
					<thead>
						<tr>
							<th><input type="checkbox" disabled /></th>
							<th>Property</th>
							<th>Order (ascending or descending)</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						${map(
							this.config.criteria,
							(item, index) => new SortRuleRow(item, this.pipeNode.properties, this.handleRemoveRow.bind(this, index))
						)}
					</tbody>
				</table>
				<datalist id="sort-props">
					${map(this.pipeNode.properties, (prop) => html`<option value=${prop}></option>`)}
				</datalist>
			</div>
		</section> `;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "sort", title: "Sort" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("sort-data-node-card", SortDataNodePopup);

export class SortRuleRow extends HTMLTableRowElement {
	constructor(criteria, properties, onDelete, isLast, isFirst) {
		super();
		this.criteria = criteria;
		this.properties = properties;
		this.onDelete = onDelete;
	}

	render() {
		// Radio: show first priority (disabled)
		const cell1 = html` <input type="radio" disabled ?checked=${() => this.criteria.enabled} /> `;
		this.insertCell().appendChild(cell1);

		// Field input + datalist
		const datalistId = `sort-props-${Math.random()}`;
		const cell2 = html`<input
				type="text"
				placeholder="field"
				list=${datalistId}
				.value=${() => this.criteria.field} />
			<datalist id=${datalistId}>${map(this.properties, (p) => html`<option value=${p}></option>`)}</datalist>`;
		this.insertCell().appendChild(cell2);

		// Order select
		const cell3 = html`<select .value=${() => this.criteria.order}>
			<option value="ascending">Ascending</option>
			<option value="descending">Descending</option>
		</select>`;
		this.insertCell().appendChild(cell3);

		// Delete button
		const cell4 = html`<button
			class="icon-btn delete-btn"
			style="visibility:${() => (this.criteria.field ? "visible" : "hidden")}">
			<svg class="icon"><use href="/assets/icons.svg#delete"></use></svg>
		</button>`;
		this.insertCell().appendChild(cell4);
	}

	connectedCallback() {
		this.render();
	}
}

customElements.define("sort-rule-row", SortRuleRow, { extends: "tr" });
