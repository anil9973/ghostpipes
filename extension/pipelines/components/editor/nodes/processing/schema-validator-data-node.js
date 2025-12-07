import { html, react, map } from "../../../../../lib/om.compact.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { ConfigErrorBox } from "../config-error-box.js";
import { NodeConfigHeader } from "../config-node-header.js";

export class SchemaValidatorDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		this.config = pipeNode.config;
		this.errors = react([]);
		this.ensureEmptyRow();
	}

	ensureEmptyRow() {
		const list = this.config.fields;
		const last = list[list.length - 1];
		if (!last || last.name !== "") {
			list.push({
				name: "",
				type: "string",
				required: false,
			});
		}
	}

	handleRowInput(index) {
		if (index === this.config.fields.length - 1) this.ensureEmptyRow();
	}

	handleRemoveRow(index) {
		this.config.fields.splice(index, 1);
		this.ensureEmptyRow();
	}

	async handleSave() {
		this.errors.splice(0, this.errors.length, ...this.config.validate());
		if (this.errors.length !== 0) return;
		//TODO
		/* this.config.fields = this.config.fields.filter((f) => f.name.trim() !== "");

		const config = Object.assign({}, this.config);
		config.fields = Object.assign([], this.config.fields);
		await pipedb.updateNodeConfig(this.pipeNode.id, config,  this.pipeNode.summary);;
		fireEvent(this, "savenodeconfig", this.pipeNode);
		this.hidePopover();
		this.ensureEmptyRow(); */
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
							<th><input type="checkbox" disabled /></th>
							<th>Text/Property</th>
							<th>Type</th>
							<th>Required</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						${map(
							this.config.fields,
							(field, index) => html`
								<tr @input=${this.handleRowInput.bind(this, index)}>
									<td><input type="checkbox" disabled /></td>
									<td>
										<input type="text" list="schema-props" placeholder="field" .value=${() => field.name} />
									</td>
									<td>
										<select .value=${() => field.type}>
											<option value="string">String</option>
											<option value="number">Number</option>
											<option value="boolean">Boolean</option>
											<option value="date">Date</option>
											<option value="array">Array</option>
											<option value="object">Object</option>
										</select>
									</td>
									<td>
										<input
											type="checkbox"
											?checked=${() => field.required}
											@change=${(e) => (field.required = e.target.checked)} />
									</td>
									<td>
										<button
											class="icon-btn delete-btn"
											@click=${this.handleRemoveRow.bind(this, index)}
											style="${() =>
												index === this.config.fields.length - 1 && !field.name ? "visibility:hidden" : ""}">
											<svg class="icon"><use href="/assets/icons.svg#delete"></use></svg>
										</button>
									</td>
								</tr>
							`
						)}
					</tbody>
				</table>

				<datalist id="schema-props">
					${map(this.pipeNode.properties, (prop) => html`<option value=${prop}></option>`)}
				</datalist>

				<div class="config-row">
					<div>
						<label>Behavior:</label>
						<select .value=${() => this.config.behavior}>
							<option value="validate">Validate only</option>
							<option value="coerce">Validate + coerce types</option>
							<option value="strip">Validate + strip extra fields</option>
							<option value="transform">Validate + transform to schema</option>
						</select>
					</div>

					<div>
						<label>On validation error:</label>
						<select .value=${() => this.config.onError}>
							<option value="skip">Skip invalid items</option>
							<option value="fail">Fail pipeline</option>
							<option value="mark">Mark with error flag</option>
						</select>
					</div>
				</div>

				<details>
					<summary>Advanced:</summary>
					<textarea
						.value=${() => this.config.rawSchema}
						@input=${(e) => (this.config.rawSchema = e.target.value)}
						placeholder="Paste JSON Schema here (optional)"
						rows="4"></textarea>
				</details>
			</ul>
		</section> `;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "schema-validator", title: "Schema Validator" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("schema-validator-data-node-card", SchemaValidatorDataNodePopup);
