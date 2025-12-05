import { StringBuilderConfig } from "../../../../models/configs/processing/StringBuilderConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { pipedb } from "../../../../db/pipeline-db.js";

export class StringBuilderDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = react(pipeNode);
		/** @type {StringBuilderConfig}  */
		this.config = pipeNode.config;
		this.ensureEmptyRow();
	}

	ensureEmptyRow() {
		const list = this.config.parts;
		const last = list[list.length - 1];
		if (!last || last.value !== "") {
			list.push({ type: "string", value: "" });
		}
	}

	handleRowInput(index) {
		if (index === this.config.parts.length - 1) this.ensureEmptyRow();
	}

	handleRemoveRow(index) {
		this.config.parts.splice(index, 1);
		this.ensureEmptyRow();
	}

	async handleSave() {
		const config = Object.assign({}, this.config);
		await pipedb.updateNodeConfig(config, this.pipeNode.id);
		this.config.parts = this.config.parts.filter((p) => p.value.trim() !== "");
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
							<th>Type</th>
							<th>Text/Property</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						${map(
							this.config.parts,
							(part, index) =>
								new StringPartRow(
									part,
									this.pipeNode.properties,
									() => this.handleRemoveRow(index),
									index === this.config.parts.length - 1
								)
						)}
					</tbody>
				</table>

				<datalist id="string-props">
					${map(this.pipeNode.properties, (prop) => html`<option value=${prop}></option>`)}
				</datalist>
			</ul>
		</section> `;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "string-builder", title: "String Builder" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render());
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("string-builder-data-node-card", StringBuilderDataNodePopup);

export class StringPartRow extends HTMLTableRowElement {
	constructor(part, properties, onDelete, isLast) {
		super();
		this.part = part;
		this.properties = properties;
		this.onDelete = onDelete;
		this.isLast = isLast;
	}

	render() {
		// Disabled checkbox
		const cell1 = html` <input type="checkbox" disabled /> `;
		this.insertCell().appendChild(cell1);

		// Type selector
		const cell2 = html` <select .value=${() => this.part.type}>
			<option value="string">String</option>
			<option value="property">Property</option>
			<option value="variable">Variable</option>
		</select>`;
		this.insertCell().appendChild(cell2);

		// Value input + optional datalist
		const datalistId = this.part.type === "property" ? `string-props-${Math.random()}` : "";

		const cell3 =
			this.part.type === "property"
				? html`
						<input type="text" placeholder="value" list=${datalistId} .value=${() => this.part.value} />
						<datalist id=${datalistId}>${map(this.properties, (p) => html`<option value=${p}></option>`)}</datalist>
				  `
				: html` <input type="text" placeholder="value" .value=${() => this.part.value} /> `;
		this.insertCell().appendChild(cell3);

		// Delete button
		const cell4 = html` <button
			class="icon-btn delete-btn"
			style="${() => (this.isLast && !this.part.value ? "visibility:hidden" : "")}">
			<svg class="icon"><use href="/assets/icons.svg#delete"></use></svg>
		</button>`;
		this.insertCell().appendChild(cell4);
	}

	connectedCallback() {
		this.render();
	}
}

customElements.define("string-part-row", StringPartRow, { extends: "tr" });
