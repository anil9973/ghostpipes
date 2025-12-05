import { DeduplicateConfig } from "../../../../models/configs/processing/DeduplicateConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { MultiChipSelectField } from "../multi-chip-select-field.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { pipedb } from "../../../../db/pipeline-db.js";

export class DeduplicateDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = react(pipeNode);
		/** @type {DeduplicateConfig}  */
		this.config = pipeNode.config;
	}

	async handleSave() {
		const config = Object.assign({}, this.config);
		await pipedb.updateNodeConfig(config, this.pipeNode.id);
		fireEvent(this, "save-node-config", this.pipeNode);
		this.hidePopover();
	}

	onClosedPopover() {}

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
		this.replaceChildren(header, this.render());
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("deduplicate-data-node-card", DeduplicateDataNodePopup);
