import { DownloadConfig } from "../../../../models/configs/output/DownloadConfig.js";
import { html, react } from "../../../../../lib/om.compact.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { ConfigErrorBox } from "../config-error-box.js";

export class DownloadNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {DownloadConfig}  */
		this.config = pipeNode.config;
		this.errors = react([]);
	}

	async handleSave() {
		this.errors.splice(0, this.errors.length, ...this.config.validate());
		if (this.errors.length !== 0) return;
		// TODO validate
		this.pipeNode.summary = this.config.getSummary();
		const config = Object.assign({}, this.config);

		await pipedb.updateNodeConfig(this.pipeNode.id, config, this.pipeNode.summary);
		fireEvent(this, "savenodeconfig", this.pipeNode);
		this.hidePopover();
	}

	render() {
		return html`<section>
			<label>
				<div>Nest Folder path</div>
				<input type="url" .value=${() => this.config.folder} placeholder="" />
			</label>

			<div>
				<div>Filename</div>
				<table>
					<tr>
						<td>Prefix</td>
						<td><input type="text" .value=${() => this.config.prefix} placeholder="" /></td>
					</tr>
					<tr>
						<td>Replace Regrex</span></td>
						<td><input type="text" .value=${() => this.config.replacePattern} placeholder="" /></td>
					</tr>
					<tr>
						<td>Replace Regrex</span></td>
						<td><input type="text" .value=${() => this.config.replaceWith} placeholder="" /></td>
					</tr>
					<tr>
						<td>Suffix</td>
						<td><input type="text" .value=${() => this.config.suffix} placeholder="" /></td>
					</tr>
				</table>
			</div>
		</section>`;
	}

	onClosedPopover() {
		// TODO validate
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "download", title: "Download" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("download-node-card", DownloadNodePopup);
