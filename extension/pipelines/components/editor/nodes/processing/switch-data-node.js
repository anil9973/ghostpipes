import { html, react, map } from "../../../../../lib/om.compact.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { SwitchConfig } from "../../../../models/configs/processing/SwitchConfig.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { ConfigErrorBox } from "../config-error-box.js";
import { NodeConfigHeader } from "../config-node-header.js";

export class SwitchDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {SwitchConfig}  */
		this.config = pipeNode.config;
		this.errors = react([]);
	}

	async handleSave() {
		try {
			this.errors.splice(0, this.errors.length, ...this.config.validate());
			if (this.errors.length !== 0) return;
			this.pipeNode.summary = this.config.getSummary();
			const config = Object.assign({}, this.config);
			config.cases = Object.assign({}, this.config.cases);
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
					<label>
						<span>Switch on field:</span>
						<input type="text" placeholder="field" list="switch-props" .value=${() => this.config.switchField} />
						<datalist id="switch-props">
							${map(this.pipeNode.properties, (prop) => html`<option value=${prop}></option>`)}
						</datalist>
					</label>
				</div>
			</ul>
		</section> `;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "switch", title: "Switch" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("switch-data-node-card", SwitchDataNodePopup);
