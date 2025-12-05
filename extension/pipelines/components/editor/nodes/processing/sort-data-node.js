import { html, react, map } from "../../../../../lib/om.compact.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { SortConfig } from "../../../../models/configs/processing/SortConfig.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";

export class SortDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = react(pipeNode);
		/** @type {SortConfig}  */
		this.config = pipeNode.config;

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
		const config = Object.assign({}, this.config);
		await pipedb.updateNodeConfig(config, this.pipeNode.id);
		this.config.criteria = this.config.criteria.filter((c) => c.field.trim() !== "");
		fireEvent(this, "save-node-config", this.pipeNode);

		this.hidePopover();
		this.ensureEmptyRow();
	}

	onClosedPopover() {}

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
							(item, index) =>
								new SortRuleRow(
									item,
									this.pipeNode.properties,
									() => this.handleRemoveRow(index),
									index === this.config.criteria.length - 1,
									index === 0
								)
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
		this.replaceChildren(header, this.render());
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
		this.isLast = isLast;
		this.isFirst = isFirst;
	}

	render() {
		// Radio: show first priority (disabled)
		const cell1 = html` <input type="radio" disabled ?checked=${() => this.isFirst} /> `;
		this.insertCell().appendChild(cell1);

		// Field input + datalist
		const datalistId = `sort-props-${Math.random()}`;
		const cell2 = html`
			<input type="text" placeholder="field" list=${datalistId} .value=${() => this.criteria.field} />
			<datalist id=${datalistId}>${map(this.properties, (p) => html`<option value=${p}></option>`)}</datalist>
		`;
		this.insertCell().appendChild(cell2);

		// Order select
		const cell3 = html`
			<select .value=${() => this.criteria.order}>
				<option value="ascending">Ascending</option>
				<option value="descending">Descending</option>
			</select>
		`;
		this.insertCell().appendChild(cell3);

		// Delete button
		const cell4 = html`
			<button
				class="icon-btn delete-btn"
				style="${() => (this.isLast && !this.criteria.field ? "visibility:hidden" : "")}">
				<svg class="icon"><use href="/assets/icons.svg#delete"></use></svg>
			</button>
		`;
		this.insertCell().appendChild(cell4);
	}

	connectedCallback() {
		this.render();
	}
}

customElements.define("sort-rule-row", SortRuleRow, { extends: "tr" });
