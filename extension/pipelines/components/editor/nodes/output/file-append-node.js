import { FileAppendConfig } from "../../../../models/configs/output/FileAppendConfig.js";
import { FormatOutput } from "../../../../models/configs/processing/FormatConfig.js";
import { html, react } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { pipedb } from "../../../../db/pipeline-db.js";

export class FileAppendNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = react(pipeNode);
		/** @type {FileAppendConfig}  */
		this.config = pipeNode.config;
	}

	async handleSave() {
		const config = Object.assign({}, this.config);
		await pipedb.updateNodeConfig(config, this.pipeNode.id);
		fireEvent(this, "save-node-config", this.pipeNode);
		this.hidePopover();
	}

	async handleBrowse() {
		try {
			// @ts-ignore
			const handle = await window.showSaveFilePicker();
			this.config.path = handle.name;
		} catch (e) {
			console.log("Browse cancelled");
		}
	}

	onClosedPopover() {}

	render() {
		return html`<section>
			<ul class="config-field-list">
				<div>
					<label>File path:</label>
					<div class="config-row">
						<input type="text" placeholder="Choose file..." .value=${() => this.config.path} />
						<button @click=${this.handleBrowse}>Browse</button>
					</div>
				</div>

				<div>
					<label>Format:</label>
					<select .value=${() => this.config.format}>
						<option value=${FormatOutput.CSV}>CSV (Spreadsheet)</option>
						<option value=${FormatOutput.JSON}>JSON (newline-delimited)</option>
						<option value=${FormatOutput.TEXT}>Plain text (.txt)</option>
						<option value=${FormatOutput.HTML}>HTML Document</option>
						<option value=${FormatOutput.MARKDOWN}>Markdown (.md)</option>
						<option value=${FormatOutput.XLSX}>Excel File (.xlsx)</option>
						<option value=${FormatOutput.PDF}>PDF Document (.pdf)</option>
						<option value=${FormatOutput.CUSTOM}>Custom Template</option>
					</select>
				</div>

				<div>
					<label>
						<input type="checkbox" ?checked=${() => this.config.createIfMissing} />
						Create file if doesn't exist
					</label>
					<br />
					<label>
						<input type="checkbox" ?checked=${() => this.config.addHeader} />
						Add header row (CSV only)
					</label>
				</div>

				<div>
					<label>Encoding:</label>
					<select .value=${() => this.config.encoding}>
						<option value="utf8">UTF-8</option>
						<option value="utf16">UTF-16</option>
						<option value="ascii">ASCII</option>
					</select>
				</div>
			</ul>
		</section>`;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "file-append-large", title: "File Append" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render());
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("file-append-node-card", FileAppendNodePopup);
