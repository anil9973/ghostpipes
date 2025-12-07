import { html, react, map } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { MultiChipSelectField } from "../multi-chip-select-field.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { SendEmailConfig } from "../../../../models/configs/output/SendEmailConfig.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { ConfigErrorBox } from "../config-error-box.js";

export class SendEmailNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {SendEmailConfig}  */
		this.config = pipeNode.config;
		this.errors = react([]);
	}

	async handleSave() {
		try {
			this.errors.splice(0, this.errors.length, ...this.config.validate());
			if (this.errors.length !== 0) return;
			const config = Object.assign({}, this.config);
			config.recipients = Object.assign([], this.config.recipients);
			this.pipeNode.summary = this.config.getSummary();

			await pipedb.updateNodeConfig(this.pipeNode.id, config, this.pipeNode.summary);
			fireEvent(this, "savenodeconfig", this.pipeNode);
			this.hidePopover();
		} catch (error) {
			console.error(error);
		}
	}

	render() {
		console.log(this.config);
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
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("send-email-node-card", SendEmailNodePopup);
