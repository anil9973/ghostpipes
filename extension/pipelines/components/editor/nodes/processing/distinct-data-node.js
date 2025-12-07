import { DistinctConfig } from "../../../../models/configs/processing/DistinctConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { MultiChipSelectField } from "../multi-chip-select-field.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { ConfigErrorBox } from "../config-error-box.js";

export class DistinctDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {DistinctConfig}  */
		this.config = pipeNode.config;
		this.errors = react([]);
	}

	handleClose() {
		this.hidePopover();
	}

	async handleSave() {
		try {
			this.errors.splice(0, this.errors.length, ...this.config.validate());
			if (this.errors.length !== 0) return;
			this.pipeNode.summary = this.config.getSummary();
			const config = Object.assign({}, this.config);
			config.fields = Object.assign({}, this.config.fields);

			await pipedb.updateNodeConfig(this.pipeNode.id, config, this.pipeNode.summary);
			fireEvent(this, "savenodeconfig", this.pipeNode);
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
		return html` <section>
			<ul class="config-field-list">
				<div>
					<label>Extract distinct values from:</label>
					<select .value=${() => this.config.scope}>
						<option value="field">Single field</option>
						<option value="multiple">Multiple fields</option>
						<option value="entire">Entire records</option>
					</select>
				</div>

				<div style="${() => (this.config.scope !== "entire" ? "" : "display:none")}">
					${new MultiChipSelectField(this.pipeNode.properties, this.config.fields, "Fields")}
				</div>

				<div class="config-row">
					<div>
						<label><div>Output format:</div></label>
						<select .value=${() => this.config.outputFormat}>
							<option value="array">Array of values</option>
							<option value="count">Value with count</option>
							<option value="original">Original records</option>
						</select>
					</div>

					<div>
						<label><div>Sort results:</div></label>
						<select .value=${() => this.config.sort}>
							<option value="none">No sorting</option>
							<option value="asc">Ascending</option>
							<option value="desc">Descending</option>
							<option value="count">By frequency</option>
						</select>
					</div>
				</div>
			</ul>
		</section>`;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "intersect-large", title: "Distinct" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("distinct-data-node-card", DistinctDataNodePopup);
