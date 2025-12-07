import { UnionConfig, UnionStrategy } from "../../../../models/configs/processing/UnionConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { ConfigErrorBox } from "../config-error-box.js";

export class UnionDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {UnionConfig}  */
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
				<div class="config-row">
					<label>
						<div>Combine strategy:</div>
						<select .value=${() => this.config.strategy}>
							<option value=${UnionStrategy.APPEND}>Append (keep all)</option>
							<option value=${UnionStrategy.UNIQUE}>Unique only</option>
							<option value=${UnionStrategy.INTERSECT}>Intersect (common items)</option>
						</select>
					</label>
					<label>
						<div>Deduplicate by field:</div>
						<input type="text" placeholder="field" list="union-props" .value=${() => this.config.deduplicateField} />
					</label>
				</div>

				<div>
					<label>
						<input type="checkbox" ?checked=${() => this.config.preserveOrder} />
						Preserve order
					</label>
				</div>

				<datalist id="union-props">
					${map(this.pipeNode.properties, (prop) => html`<option value=${prop}></option>`)}
				</datalist>
			</ul>
		</section> `;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "union-large", title: "Union" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("union-data-node-card", UnionDataNodePopup);
