import { html, react, map } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { MultiChipSelectField } from "../multi-chip-select-field.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { SendEmailConfig } from "../../../../models/configs/output/SendEmailConfig.js";
import { pipedb } from "../../../../db/pipeline-db.js";

export class SendEmailNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = react(pipeNode);
		/** @type {SendEmailConfig}  */
		this.config = pipeNode.config;
	}

	async handleSave() {
		const config = Object.assign({}, this.config);
		await pipedb.updateNodeConfig(config, this.pipeNode.id);
		fireEvent(this, "save-node-config", this.pipeNode);
		this.hidePopover();
	}

	render() {
		return html`<section>
			<ul class="config-field-list">
				${new MultiChipSelectField([], this.config.recipients, "Emails")}
			</ul>
		</section>`;
	}

	onClosedPopover() {}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "send-email-large", title: "Send Email" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render());
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("send-email-node-card", SendEmailNodePopup);
