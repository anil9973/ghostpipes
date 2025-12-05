import { html, react, map } from "../../../../../lib/om.compact.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { IntersectConfig } from "../../../../models/configs/processing/IntersectConfig.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";

export class IntersectDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = react(pipeNode);
		/** @type {IntersectConfig}  */
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
		return html` <section>
			<ul class="config-field-list">
				<div class="config-row">
					<div>
						<label><div>Compare by:</div></label>
						<select .value=${() => this.config.compareBy}>
							<option value="field">Specific field</option>
							<option value="entire">Entire record</option>
							<option value="hash">Hash value</option>
						</select>
					</div>

					<div>
						<label><div>Output from:</div></label>
						<select .value=${() => this.config.outputFrom}>
							<option value="first">First input</option>
							<option value="merge">Merge all matching</option>
						</select>
					</div>
				</div>

				<div>
					<label>Field to compare:</label>
					<input type="text" .value=${() => this.config.field} placeholder="field" list="intersect-props" />
					<datalist id="intersect-props">
						${map(this.pipeNode.properties, (prop) => html`<option value=${prop}></option>`)}
					</datalist>
				</div>

				<div>
					<label>
						<input type="checkbox" ?checked=${() => this.config.ignoreCase} />
						Case insensitive
					</label>
				</div>
			</ul>
		</section>`;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "intersect-large", title: "Intersect" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render());
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("intersect-data-node-card", IntersectDataNodePopup);
