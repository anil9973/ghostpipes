import { TransformConfig, TransformOperation } from "../../../../models/configs/processing/TransformConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { pipedb } from "../../../../db/pipeline-db.js";

export class TransformDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = react(pipeNode);
		/** @type {TransformConfig}  */
		this.config = pipeNode.config;
		this.ensureEmptyRow();
	}

	ensureEmptyRow() {
		const list = this.config.transformations;
		const last = list[list.length - 1];

		if (!last || last.sourceField !== "" || last.targetField !== "") {
			list.push({ sourceField: "", targetField: "", operation: TransformOperation.COPY, options: {} });
		}
	}

	handleRowInput(index) {
		if (index === this.config.transformations.length - 1) this.ensureEmptyRow();
	}

	handleRemoveRow(index) {
		this.config.transformations.splice(index, 1);
		this.ensureEmptyRow();
	}

	async handleSave() {
		const config = Object.assign({}, this.config);
		await pipedb.updateNodeConfig(config, this.pipeNode.id);
		const validTransformations = this.config.transformations.filter((t) => t.sourceField.trim() !== "");
		this.config.transformations = validTransformations;

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
							<th>Operation</th>
							<th>Source Field</th>
							<th>Target Field</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						${map(
							() => this.config.transformations,
							(item, index) =>
								new TransformRuleRow(
									item,
									this.pipeNode.properties,
									() => this.handleRemoveRow(index),
									index === this.config.transformations.length - 1
								)
						)}
					</tbody>
				</table>

				<datalist id="transform-props">
					${map(this.pipeNode.properties, (prop) => html`<option value=${prop}></option>`)}
				</datalist>
			</ul>
		</section> `;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "transform", title: "Transform" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render());
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("transform-data-node-card", TransformDataNodePopup);

export class TransformRuleRow extends HTMLTableRowElement {
	constructor(transform, properties, onDelete, isLast) {
		super();
		this.transform = transform;
		this.properties = properties;
		this.onDelete = onDelete;
		this.isLast = isLast;
	}

	render() {
		// Operation select
		const selectEl = html` <select .value=${() => this.transform.operation}>
			<option value=${TransformOperation.COPY}>Copy</option>
			<option value=${TransformOperation.TEMPLATE}>Template</option>
			<option value=${TransformOperation.CALCULATE}>Calculate</option>
			<option value=${TransformOperation.CONCAT}>Concat</option>
			<option value=${TransformOperation.SPLIT}>Split</option>
			<option value=${TransformOperation.UPPERCASE}>Uppercase</option>
			<option value=${TransformOperation.LOWERCASE}>Lowercase</option>
			<option value=${TransformOperation.TRIM}>Trim</option>
		</select>`;
		this.insertCell().appendChild(selectEl);

		// Source field input
		const fieldId = `transform-props-${Math.random()}`;
		const inputField = html` <input
				type="text"
				placeholder="source field"
				list=${fieldId}
				.value=${() => this.transform.sourceField} />
			<datalist id=${fieldId}>${map(this.properties, (p) => html`<option value=${p}></option>`)}</datalist>`;
		this.insertCell().appendChild(inputField);

		// Target field input
		const targetInput = html` <input
			type="text"
			placeholder="target field"
			.value=${() => this.transform.targetField} />`;
		this.insertCell().append(targetInput);

		// Delete button
		const deleteBtn = html`<button
			class="icon-btn delete-btn"
			@click=${this.onDelete}
			style="${() => (this.isLast && !this.transform.sourceField ? "visibility:hidden" : "")}">
			<svg class="icon"><use href="/assets/icons.svg#delete"></use></svg>
		</button>`;
		this.insertCell().appendChild(deleteBtn);
	}

	connectedCallback() {
		this.render();
	}
}

customElements.define("transform-rule-row", TransformRuleRow, { extends: "tr" });
