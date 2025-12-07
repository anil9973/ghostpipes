import { FileAppendConfig } from "../../../../models/configs/output/FileAppendConfig.js";
import { FormatOutput } from "../../../../models/configs/processing/FormatConfig.js";
import { saveFileHandle } from "../../../../db/filehandle-db.js";
import { html, react } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { ConfigErrorBox } from "../config-error-box.js";
import { nanoid } from "../../../../utils/common.js";

export class FileAppendNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {FileAppendConfig}  */
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

	async handleBrowse() {
		try {
			// @ts-ignore
			const fileHandle = (await window.showOpenFilePicker({ multiple: false }))[0];
			const fileHandleId = nanoid(10);
			fileHandle && (await saveFileHandle(fileHandle, fileHandleId));
			this.config.path = fileHandle.name;
			this.config.fileHandleId = fileHandleId;
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
					<label>File path:</label>
					<div class="config-row">
						<input type="text" placeholder="Choose file..." .value=${() => this.config.path} readonly />
						<button @click=${this.handleBrowse.bind(this)}>Browse</button>
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
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("file-append-node-card", FileAppendNodePopup);
