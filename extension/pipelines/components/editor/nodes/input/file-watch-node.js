import { FileWatchConfig } from "../../../../models/configs/input/FileWatchConfig.js";
import { MultiChipSelectField } from "../multi-chip-select-field.js";
import { html, react } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { ConfigErrorBox } from "../config-error-box.js";

export class FileWatchNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {FileWatchConfig}  */
		this.config = pipeNode.config;
		this.errors = react([]);
	}

	async handleBrowse() {
		try {
			// @ts-ignore
			const dirHandle = await window.showDirectoryPicker();
			this.config.directoryHandle = dirHandle;
			this.config.directoryName = dirHandle.name;
		} catch (err) {
			console.warn("Directory picker cancelled", err);
		}
	}

	async handleSave() {
		this.errors.splice(0, this.errors.length, ...this.config.validate());
		if (this.errors.length !== 0) return;
		this.pipeNode.summary = this.config.getSummary();
		const config = Object.assign({}, this.config);
		console.log(this.pipeNode);
		config.watchMimeTypes = Object.assign([], this.config.watchMimeTypes);

		await pipedb.updateNodeConfig(this.pipeNode.id, config, this.pipeNode.summary);
		fireEvent(this, "savenodeconfig", this.pipeNode);
		this.hidePopover();
	}

	onClosedPopover() {
		// TODO validate
	}

	render() {
		const commonMimes = ["text/csv", "text/plain", "application/json", "application/xml"];

		return html`<section>
			<ul class="config-field-list">
				<div class="folder-picker">
					<label>
						<div>Pick directory for watch</div>
					</label>
					<div class="picker-wrapper">
						<input type="text" readonly .value=${() => this.config.directoryName} placeholder="No folder selected" />
						<button @click=${this.handleBrowse.bind(this)}>Browse</button>
					</div>
				</div>

				${new MultiChipSelectField(commonMimes, this.config.watchMimeTypes, "Watch file mimeTypes")}
			</ul>
		</section>`;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "file-watch", title: "File Watch" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("file-watch-node-card", FileWatchNodePopup);
