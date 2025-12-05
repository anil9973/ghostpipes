import { html, react } from "../../../../../lib/om.compact.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { JoinConfig } from "../../../../models/configs/processing/JoinConfig.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";

export class JoinDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = react(pipeNode);
		/** @type {JoinConfig}  */
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
					<label>Join type:</label>
					<select .value=${() => this.config.type}>
						<option value="inner">INNER JOIN (matching only)</option>
						<option value="left">LEFT JOIN (all from left)</option>
						<option value="right">RIGHT JOIN (all from right)</option>
						<option value="outer">FULL OUTER JOIN (all records)</option>
					</select>
				</div>

				<div>
					<label>Join on:</label>
					<div class="config-row">
						<input type="text" .value=${() => this.config.leftKey} placeholder="left field" />
						<span>=</span>
						<input type="text" .value=${() => this.config.rightKey} placeholder="right field" />
					</div>
				</div>

				<div>
					<label>Handle duplicates:</label>
					<select .value=${() => this.config.duplicateHandling}>
						<option value="all">Keep all matches</option>
						<option value="first">Keep first match only</option>
						<option value="last">Keep last match only</option>
					</select>
				</div>
			</ul>
		</section> `;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "join", title: "Join" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render());
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("join-data-node-card", JoinDataNodePopup);
