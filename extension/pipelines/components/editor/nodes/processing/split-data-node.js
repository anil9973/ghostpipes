import { SplitConfig, SplitMethod, SplitStrategy } from "../../../../models/configs/processing/SplitConfig.js";
import { html, react } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";

export class SplitDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = react(pipeNode);
		/** @type {SplitConfig}  */
		this.config = pipeNode.config;
	}

	handleSave() {
		fireEvent(this, "save-node-config", this.pipeNode);
		this.hidePopover();
	}

	onClosedPopover() {}

	render() {
		return html`<section>
			<ul class="config-field-list">
				<div class="config-row">
					<div>
						<label>Split method:</label>
						<select .value=${() => this.config.method}>
							<option value=${SplitMethod.FIELD}>By field value</option>
							<option value=${SplitMethod.CONDITION}>By condition</option>
							<option value=${SplitMethod.BATCH}>By batch size</option>
							<option value=${SplitMethod.PERCENTAGE}>By percentage</option>
						</select>
					</div>

					<div>
						<label>Field to split on:</label>
						<input type="text" .value=${() => this.config.splitField} placeholder="field name" />
					</div>
				</div>

				<div>
					<label>Output strategy:</label>
					<select .value=${() => this.config.strategy}>
						<option value=${SplitStrategy.SEPARATE}>Separate outputs (one per value)</option>
						<option value=${SplitStrategy.ARRAY}>Array of groups</option>
						<option value=${SplitStrategy.OBJECT}>Object with keys</option>
					</select>
				</div>

				<div>
					<label>
						<input type="checkbox" ?checked=${() => this.config.includeGroupName} />
						Include group name in output
					</label>
				</div>
			</ul>
		</section> `;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "split", title: "Split" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render());
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("split-data-node-card", SplitDataNodePopup);
