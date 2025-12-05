import {
	ValidateConfig,
	ValidationFailureAction,
	ValidationRule,
} from "../../../../models/configs/processing/ValidateConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { pipedb } from "../../../../db/pipeline-db.js";

export class ValidateDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = react(pipeNode);
		/** @type {ValidateConfig}  */
		this.config = pipeNode.config;
		this.ensureEmptyRow();
	}

	ensureEmptyRow() {
		const list = this.config.rules;
		const last = list[list.length - 1];

		if (!last || last.field !== "" || last.value !== "") {
			list.push(new ValidationRule());
		}
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
				<table class="rule-list">
					<thead>
						<tr>
							<th><input type="checkbox" disabled /></th>
							<th>Property</th>
							<th>Rule</th>
							<th>Value</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						${map(
							this.config.rules,
							(item, index) =>
								new ValidateRuleRow(
									item,
									this.pipeNode.properties,
									() => this.handleRemoveRow(index),
									index === this.config.rules.length - 1
								)
						)}
					</tbody>
				</table>

				<datalist id="validate-props">
					${map(this.pipeNode.properties, (prop) => html`<option value=${prop}></option>`)}
				</datalist>

				<div>
					<label>On validation failure:</label>
					<select .value=${() => this.config.onFailure}>
						<option value=${ValidationFailureAction.SKIP}>Skip invalid items</option>
						<option value=${ValidationFailureAction.FAIL}>Fail pipeline</option>
						<option value=${ValidationFailureAction.MARK}>Mark as invalid (add flag)</option>
						<option value=${ValidationFailureAction.SEPARATE}>Output to separate stream</option>
					</select>
				</div>
			</ul>
		</section> `;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "validate", title: "Validate" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render());
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("validate-data-node-card", ValidateDataNodePopup);

export class ValidateRuleRow extends HTMLTableRowElement {
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

		// Field input + datalist
		const datalistId = `validate-props-${Math.random()}`;
		const cell2 = html` <input type="text" placeholder="field" list=${datalistId} .value=${() => this.rule.field} />
			<datalist id=${datalistId}>${map(this.properties, (p) => html`<option value=${p}></option>`)}</datalist>`;
		this.insertCell().appendChild(cell2);

		// Validation rule dropdown
		const cell3 = html` <select .value=${() => this.rule.rule}>
			<option value="required">is not empty</option>
			<option value="email">is valid email</option>
			<option value="url">is valid URL</option>
			<option value="phone">is valid phone</option>
			<option value="regex">matches regex</option>
			<option value="range">in range</option>
		</select>`;
		this.insertCell().appendChild(cell3);

		// Range OR normal value input (conditional)
		const cell4 =
			this.rule.rule === "range"
				? html`
						<div class="range-inputs">
							<input type="number" placeholder="min" .value=${() => this.rule.min} />
							<span>-</span>
							<input type="number" placeholder="max" .value=${() => this.rule.max} />
						</div>
				  `
				: html` <input type="text" placeholder="value" .value=${() => this.rule.value} /> `;
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

customElements.define("validate-rule-row", ValidateRuleRow, { extends: "tr" });
