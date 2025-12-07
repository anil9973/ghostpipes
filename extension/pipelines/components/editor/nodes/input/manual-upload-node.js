import { ManualInputConfig } from "../../../../models/configs/input/ManualInputConfig.js";
import { MultiChipSelectField } from "../multi-chip-select-field.js";
import { html, react } from "../../../../../lib/om.compact.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { ConfigErrorBox } from "../config-error-box.js";

export class ManualUploadNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {ManualInputConfig}  */
		this.config = pipeNode.config;
		this.errors = react([]);
	}

	async handleSave() {
		this.errors.splice(0, this.errors.length, ...this.config.validate());
		if (this.errors.length !== 0) return;
		// TODO validate
		this.pipeNode.summary = this.config.getSummary();
		const config = Object.assign({}, this.config);
		config.allowedMimeTypes = Object.assign([], this.config.allowedMimeTypes);

		await pipedb.updateNodeConfig(this.pipeNode.id, config, this.pipeNode.summary);
		fireEvent(this, "savenodeconfig", this.pipeNode);
		this.hidePopover();
	}

	render() {
		const commonMimes = ["text/plain", "text/csv", "application/json", "text/html", "image/png", "image/jpeg"];

		return html`<section>
			<ul class="config-field-list">
				${new MultiChipSelectField(commonMimes, this.config.allowedMimeTypes, "Allowed Mime Types")}
			</ul>
		</section>`;
	}

	onClosedPopover() {
		// TODO validate
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "manual-input", title: "Manual Input" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("manual-upload-node-card", ManualUploadNodePopup);
