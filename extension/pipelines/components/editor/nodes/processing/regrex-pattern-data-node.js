import { RegexPattern, RegexPatternConfig } from "../../../../models/configs/processing/RegexPatternConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { ConfigErrorBox } from "../config-error-box.js";

export class RegrexPatternDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {RegexPatternConfig}  */
		this.config = pipeNode.config;
		this.errors = react([]);
	}

	ensureEmptyRow() {
		const list = this.config.patterns;
		const last = list[list.length - 1];
		if (!last || last.field !== "" || last.pattern !== "") {
			list.push(new RegexPattern({ field: "title", pattern: "\\d+", flags: { g: true, m: false, s: false } }));
		}
	}

	handleRowInput(index) {
		if (index === this.config.patterns.length - 1) this.ensureEmptyRow();
	}

	handleRemoveRow(index) {
		this.config.patterns.splice(index, 1);
		this.ensureEmptyRow();
	}

	async handleSave() {
		try {
			this.config.patterns = this.config.patterns.filter((p) => p.field.trim() !== "");
			this.errors.splice(0, this.errors.length, ...this.config.validate());
			if (this.errors.length !== 0) return;
			this.pipeNode.summary = this.config.getSummary();

			const config = Object.assign({}, this.config);
			//prettier-ignore
			config.patterns = Object.assign([], this.config.patterns.filter((pattern) => Object.assign({}, pattern)));
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
				<div>Use Regular expressions patterns</div>
				<table class="rule-list">
					<thead>
						<tr>
							<th><input type="checkbox" disabled /></th>
							<th>Property</th>
							<th>Pattern</th>
							<th>Replacement</th>
							<th>Flags</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						${map(
							this.config.patterns,
							(item, index) =>
								new RegexRuleRow(item, this.pipeNode.properties, this.handleRemoveRow.bind(this, index))
						)}
					</tbody>
				</table>
				<datalist id="regex-props">
					${map(this.pipeNode.properties, (prop) => html`<option value=${prop}></option>`)}
				</datalist>
			</ul>
		</section>`;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "regex", title: "Regex" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("regrex-pattern-data-node-card", RegrexPatternDataNodePopup);

export class RegexRuleRow extends HTMLTableRowElement {
	constructor(rule, properties, onDelete, isLast) {
		super();
		this.rule = rule;
		this.properties = properties;
		this.onDelete = onDelete;
	}

	render() {
		// Enabled checkbox
		const cell1 = html` <input type="checkbox" ?checked=${() => this.rule.enabled} /> `;
		this.insertCell().appendChild(cell1);

		// Field input + datalist
		const datalistId = `regex-props-${Math.random()}`;
		const cell2 = html` <input type="text" placeholder="field" list=${datalistId} .value=${() => this.rule.field} />
			<datalist id=${datalistId}>${map(this.properties, (p) => html`<option value=${p}></option>`)}</datalist>`;
		this.insertCell().appendChild(cell2);

		// Pattern input
		const cell3 = html` <input type="text" placeholder="/pattern/" .value=${() => this.rule.pattern} /> `;
		this.insertCell().appendChild(cell3);

		// Replacement input
		const cell4 = html` <input type="text" placeholder="replace" .value=${() => this.rule.replacement} /> `;
		this.insertCell().appendChild(cell4);

		// Flags: g, i
		const cell5 = html` <label title="Global"> <input type="checkbox" ?checked=${() => this.rule.global} /> g </label>
			<label title="Case Insensitive"> <input type="checkbox" ?checked=${() => this.rule.ignoreCase} /> i </label>`;
		const cell5TD = this.insertCell();
		cell5TD.className = "regex-flags";
		cell5TD.appendChild(cell5);

		// Delete button
		const cell6 = html` <button
			class="icon-btn delete-btn"
			style="visibility:${() => (this.rule.field ? "visible" : "hidden")}">
			<svg class="icon"><use href="/assets/icons.svg#delete"></use></svg>
		</button>`;
		this.insertCell().appendChild(cell6);
	}

	connectedCallback() {
		this.render();
	}
}

customElements.define("regex-rule-row", RegexRuleRow, { extends: "tr" });
