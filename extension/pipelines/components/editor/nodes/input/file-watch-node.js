import { html, react, map } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { MultiChipSelectField } from "../multi-chip-select-field.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { FileWatchConfig } from "../../../../models/configs/input/FileWatchConfig.js";
import { pipedb } from "../../../../db/pipeline-db.js";

export class FileWatchNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = react(pipeNode);
		/** @type {FileWatchConfig}  */
		this.config = pipeNode.config;
	}

	async handleBrowse() {
		try {
			const dirHandle = await window.showDirectoryPicker();
			this.config.directoryHandle = dirHandle;
			this.config.directoryName = dirHandle.name;
		} catch (err) {
			console.warn("Directory picker cancelled", err);
		}
	}

	async handleSave() {
		const config = Object.assign({}, this.config);
		await pipedb.updateNodeConfig(config, this.pipeNode.id);
		fireEvent(this, "save-node-config", this.pipeNode);
		this.hidePopover();
	}

	onClosedPopover() {}

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
		this.replaceChildren(header, this.render());
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("file-watch-node-card", FileWatchNodePopup);
