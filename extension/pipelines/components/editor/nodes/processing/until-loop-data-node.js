import { TimeoutAction, UntilLoopConfig } from "../../../../models/configs/processing/UntilLoopConfig.js";
import { html, react } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { pipedb } from "../../../../db/pipeline-db.js";

export class UntilLoopDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = react(pipeNode);
		/** @type {UntilLoopConfig}  */
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
				<label>Safety limits:</label>
				<div class="config-row">
					<div>
						<div>Max iterations:</div>
						<input type="number" class="short-input" .value=${() => this.config.maxIterations} />
					</div>
					<div>
						<div>Timeout:</div>
						<input type="number" class="short-input" .value=${() => this.config.timeout} />
						secs
					</div>
				</div>

				<div class="form-group">
					<label>On timeout:</label>
					<select .value=${() => this.config.onTimeout}>
						<option value=${TimeoutAction.FAIL}>Fail pipeline</option>
						<option value=${TimeoutAction.CONTINUE}>Continue with current data</option>
						<option value=${TimeoutAction.SKIP}>Skip item</option>
					</select>
				</div>
			</ul>
		</section> `;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "until", title: "Until Loop" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render());
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("until-loop-data-node-card", UntilLoopDataNodePopup);
