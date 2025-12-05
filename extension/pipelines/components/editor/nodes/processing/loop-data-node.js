import { LookupConfig } from "../../../../models/configs/processing/LookupConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { LoopConfig } from "../../../../models/configs/processing/LoopConfig.js";

export class LoopDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = react(pipeNode);
		/** @type {LoopConfig}  */
		this.config = pipeNode.config;
	}

	handleClose() {
		this.hidePopover();
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
					<label
						>For each
						<input type="text" class="inline-input" placeholder="field" .value=${() => this.config.loopOver} />
						in input data:
					</label>
				</div>

				<div>
					<label>
						<input type="checkbox" ?checked=${() => this.config.flatten} />
						Flatten results
					</label>
				</div>

				<div class="output-destination">
					<label>
						<input type="radio" name="loop-output" ?checked=${() => this.config.outputMode === "emit"} />
						<span>Emit results</span>
					</label>

					<label>
						<input type="radio" name="loop-output" ?checked=${() => this.config.outputMode === "assign"} />
						<span
							>Assign result to
							<input type="text" placeholder="field" list="loop-props" .value=${() => this.config.assignTo} />
						</span>
					</label>
				</div>

				<datalist id="loop-props">
					${map(this.pipeNode.properties, (prop) => html`<option value=${prop}></option>`)}
				</datalist>
			</ul>
		</section> `;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "loop", title: "Loop" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render());
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("loop-data-node-card", LoopDataNodePopup);
