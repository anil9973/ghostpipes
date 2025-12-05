import { ConditionConfig, LogicOperator } from "../../../../models/configs/processing/ConditionConfig.js";
import { ComparisonOperator } from "../../../../models/configs/processing/FilterConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { pipedb } from "../../../../db/pipeline-db.js";

export class ConditionalDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = react(pipeNode);
		/** @type {ConditionConfig}  */
		this.config = pipeNode.config;
		this.ensureEmptyRow();
	}

	ensureEmptyRow() {
		const list = this.config.rules;
		const last = list[list.length - 1];

		if (!last || last.field !== "" || last.value !== "")
			list.push({ enabled: true, field: "", operator: ComparisonOperator.EQUALS, value: "" });
	}

	handleRowInput(index) {
		if (index === this.config.rules.length - 1) this.ensureEmptyRow();
	}

	handleRemoveRow(index) {
		this.config.rules.splice(index, 1);
		this.ensureEmptyRow();
	}

	async handleSave() {
		const config = Object.assign({}, this.config);
		await pipedb.updateNodeConfig(config, this.pipeNode.id);
		this.config.rules = this.config.rules.filter((r) => r.field.trim() !== "");
		fireEvent(this, "save-node-config", this.pipeNode);
		this.hidePopover();
		this.ensureEmptyRow();
	}

	onClosedPopover() {}

	render() {
		return html`<section>
			<ul class="config-field-list">
				<div>
					<select .value=${() => this.config.logic}>
						<option value=${LogicOperator.AND}>AND</option>
						<option value=${LogicOperator.OR}>OR</option>
					</select>
					<span>Condition satisfaction</span>
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
							() => this.config.rules,
							(rule, index) =>
								new ConditionalRuleRow(
									rule,
									this.pipeNode.properties,
									() => this.handleRemoveRow(index),
									index === this.config.rules.length - 1
								)
						)}
					</tbody>
				</table>

				<datalist id="cond-props">
					${map(
						() => this.pipeNode.properties,
						(prop) => html`<option value=${prop}></option>`
					)}
				</datalist>
			</ul>
		</section> `;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "condition-simple", title: "Condition" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render());
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("conditional-data-node-card", ConditionalDataNodePopup);

export class ConditionalRuleRow extends HTMLTableRowElement {
	/**
	 * @param {Object} rule - Reactive rule object
	 * @param {string[]} properties - List for autocomplete
	 * @param {Function} onDelete - Callback for delete
	 * @param {boolean} isLast - UI state
	 */
	constructor(rule, properties, onDelete, isLast) {
		super();
		this.rule = rule;
		this.properties = properties;
		this.onDelete = onDelete;
		this.isLast = isLast;
	}

	render() {
		// Cell 1: Checkbox
		const cell1 = html` <input type="checkbox" ?checked=${() => this.rule.enabled} /> `;
		this.insertCell().appendChild(cell1);

		// Cell 2: Property Input + Datalist
		const datalistId = `cond-props-${Math.random()}`;
		const cell2 = html`
			<input type="text" placeholder="field" list=${datalistId} .value=${() => this.rule.field} />
			<datalist id=${datalistId}>${map(this.properties, (p) => html`<option value=${p}></option>`)}</datalist>
		`;
		this.insertCell().appendChild(cell2);

		// Cell 3: Condition Operator
		const cell3 = html`
			<select .value=${() => this.rule.operator}>
				<optgroup label="Comparison">
					<option value=${ComparisonOperator.EQUALS}>=</option>
					<option value=${ComparisonOperator.NOT_EQUALS}>!=</option>
					<option value=${ComparisonOperator.GREATER_THAN}>&gt;</option>
					<option value=${ComparisonOperator.GREATER_EQUAL}>&gt;=</option>
					<option value=${ComparisonOperator.LESS_THAN}>&lt;</option>
					<option value=${ComparisonOperator.LESS_EQUAL}>&lt;=</option>
				</optgroup>
				<optgroup label="String">
					<option value=${ComparisonOperator.STARTS_WITH}>Starts With</option>
					<option value=${ComparisonOperator.ENDS_WITH}>Ends With</option>
					<option value=${ComparisonOperator.CONTAINS}>Contains</option>
					<option value=${ComparisonOperator.MATCHES}>Regex Match</option>
				</optgroup>
			</select>
		`;
		this.insertCell().appendChild(cell3);

		// Cell 4: Value Input
		const cell4 = html` <input type="text" placeholder="value" .value=${() => this.rule.value} /> `;
		this.insertCell().appendChild(cell4);

		// Cell 5: Delete Button
		const cell5 = html`
			<button
				class="icon-btn delete-btn"
				style="${() => (this.isLast && !this.rule.field ? "visibility:hidden" : "")}">
				<svg class="icon"><use href="/assets/icons.svg#delete"></use></svg>
			</button>
		`;
		this.insertCell().appendChild(cell5);
	}

	connectedCallback() {
		this.render();
	}
}

customElements.define("conditional-rule-row", ConditionalRuleRow, { extends: "tr" });
