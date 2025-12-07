import { CustomCodeConfig } from "../../../../models/configs/processing/CustomCodeConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { ConfigErrorBox } from "../config-error-box.js";

export class CustomCodeDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {CustomCodeConfig}  */
		this.config = pipeNode.config;
		this.errors = react([]);
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
					<label>JavaScript Code:</label>
					<textarea .value=${() => this.config.code} placeholder="// Your code here"></textarea>
				</div>

				<div>
					<label>Run mode:</label>
					<select .value=${() => this.config.mode}>
						<option value="map">Map (process each item)</option>
						<option value="filter">Filter (return true/false)</option>
						<option value="reduce">Reduce (aggregate all items)</option>
						<option value="batch">Batch (process all at once)</option>
					</select>
				</div>

				<div>
					<label>Available globals:</label>
					<div class="code-help-text">
						<code>input</code> - Full input array<br />
						<code>item</code> - Current item<br />
						<code>index</code> - Current index<br />
						<code>context</code> - Pipeline context<br />
						<code>Math</code>, <code>Date</code>, <code>JSON</code> - Built-in objects
					</div>
				</div>

				<div>
					<label>
						<input type="checkbox" ?checked=${() => this.config.sandbox} />
						Sandbox mode (safe execution)
					</label>
				</div>
			</ul>
		</section>`;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "custom-code", title: "Custom JS Code" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("custom-code-data-node-card", CustomCodeDataNodePopup);
