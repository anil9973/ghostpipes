import { FilterConfig } from "../../../../models/configs/processing/FilterConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { pipedb } from "../../../../db/pipeline-db.js";

export class Rule {
	constructor() {
		this.id = Date.now();
		this.enabled = true;
		this.field = "";
		this.operator = "equals";
		this.value = "";
	}
}

export class FilterDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = react(pipeNode);
		/** @type {FilterConfig}  */
		this.config = pipeNode.config;
		this.ensureEmptyRow();
	}

	ensureEmptyRow() {
		const rules = this.config.rules;
		const lastRule = rules[rules.length - 1];

		if (!lastRule || lastRule.field !== "" || lastRule.value !== "") rules.push(new Rule());
	}

	handleRemoveRule(index) {
		this.config.rules.splice(index, 1);
		this.ensureEmptyRow();
	}

	handleRowInput(index) {
		if (index === this.config.rules.length - 1) this.ensureEmptyRow();
	}

	async handleSave() {
		const config = Object.assign({}, this.config);
		await pipedb.updateNodeConfig(config, this.pipeNode.id);
		const validRules = this.config.rules.filter((r) => r.field.trim() !== "");
		this.config.rules = validRules;

		fireEvent(this, "save-node-config", this.pipeNode);
		this.hidePopover();

		this.ensureEmptyRow();
	}

	onClosedPopover() {}

	render() {
		return html`
			<section>
				<ul class="config-field-list">
					<div>
						<label>
							<select style="display: inline; width: auto;" .value=${() => this.config.mode}>
								<option value="permit">Permit</option>
								<option value="block">Block</option>
							</select>
							items that match
							<select style="display: inline; width: auto;" .value=${() => this.config.matchType}>
								<option value="all">all</option>
								<option value="any">any</option>
							</select>
							of the following:
						</label>
					</div>

					<table class="rule-list">
						<thead>
							<tr>
								<th><input type="checkbox" disabled /></th>
								<th>Property</th>
								<th>Condition</th>
								<th>Text</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							${map(
								this.config.rules,
								(rule, index) =>
									new FilterRuleRow(
										rule,
										this.pipeNode.properties,
										() => this.handleRemoveRule(index),
										index === this.config.rules.length - 1 // isLast
									)
							)}
						</tbody>
					</table>

					<datalist id="filter-properties">
						${map(this.pipeNode.properties, (prop) => html`<option value=${prop}></option>`)}
					</datalist>
				</ul>
			</section>
		`;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "filter", title: "Filter Data" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render());
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("filter-data-node-card", FilterDataNodePopup);

export class FilterRuleRow extends HTMLTableRowElement {
	constructor(rule, properties, onDelete, isLast) {
		super();
		this.rule = rule;
		this.properties = properties;
		this.onDelete = onDelete;
		this.isLast = isLast;
	}

	render() {
		// Enabled checkbox
		const cell1 = html` <input type="checkbox" ?checked=${() => this.rule.enabled} /> `;
		this.insertCell().appendChild(cell1);

		// Field + datalist
		const cell2 = html` <input
				type="text"
				placeholder="field"
				list="filter-props-${this.rule.id}"
				.value=${() => this.rule.field} />
			<datalist id="filter-props-${this.rule.id}">
				${map(this.properties, (p) => html`<option value=${p}></option>`)}
			</datalist>`;
		this.insertCell().appendChild(cell2);

		// Operator dropdown
		const cell3 = html` <select .value=${() => this.rule.operator}>
			<optgroup label="Number">
				<option value="equals">=</option>
				<option value="gt">&gt;</option>
				<option value="lt">&lt;</option>
			</optgroup>
			<optgroup label="String">
				<option value="startsWith">Starts With</option>
				<option value="endsWith">Ends With</option>
				<option value="contains">Contains</option>
				<option value="notContains">Not Contains</option>
			</optgroup>
		</select>`;
		this.insertCell().appendChild(cell3);

		// Value input
		const cell4 = html` <input type="text" placeholder="value" .value=${() => this.rule.value} /> `;
		this.insertCell().appendChild(cell4);

		// Delete button
		const cell5 = html` <button
			class="icon-btn delete-btn"
			style="${() => (this.isLast && !this.rule.field ? "visibility:hidden" : "")}">
			<svg class="icon"><use href="/assets/icons.svg#delete"></use></svg>
		</button>`;
		this.insertCell().appendChild(cell5);
	}

	connectedCallback() {
		this.render();
	}
}

customElements.define("filter-rule-row", FilterRuleRow, { extends: "tr" });
