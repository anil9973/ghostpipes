import { DeduplicateConfig } from "../../../../models/configs/processing/DeduplicateConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { MultiChipSelectField } from "../multi-chip-select-field.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { ConfigErrorBox } from "../config-error-box.js";

export class DeduplicateDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {DeduplicateConfig}  */
		this.config = pipeNode.config;
		this.errors = react([]);
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
		return html`<section>
			<ul class="config-field-list">
				<div>
					<label>Deduplicate by:</label>
					<select .value=${() => this.config.scope}>
						<option value="field">Specific field(s)</option>
						<option value="all">Entire record</option>
						<option value="hash">Hash comparison</option>
					</select>
				</div>

				<div style="${() => (this.config.scope === "field" ? "" : "display:none")}">
					${new MultiChipSelectField(this.pipeNode.properties, this.config.fields, "Field(s) to compare")}
				</div>

				<div>
					<label>Keep which record:</label>
					<select .value=${() => this.config.keep}>
						<option value="first">First occurrence</option>
						<option value="last">Last occurrence</option>
						<option value="merge">Merge (combine non-empty values)</option>
					</select>
				</div>

				<div>
					<label>Case sensitivity:</label>
					<label>
						<input type="checkbox" ?checked=${() => this.config.ignoreCase} />
						Ignore case when comparing
					</label>
				</div>
			</ul>
		</section>`;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "deduplicate", title: "Deduplicate" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("deduplicate-data-node-card", DeduplicateDataNodePopup);
