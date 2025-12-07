import { LookupConfig } from "../../../../models/configs/processing/LookupConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { LoopConfig } from "../../../../models/configs/processing/LoopConfig.js";
import { ConfigErrorBox } from "../config-error-box.js";

export class LoopDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {LoopConfig}  */
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
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("loop-data-node-card", LoopDataNodePopup);
