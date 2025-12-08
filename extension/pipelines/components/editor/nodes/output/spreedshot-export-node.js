import { SpreedsheetConfig, SheetOperation } from "../../../../models/configs/output/SpreedsheetConfig.js";
import { html, react } from "../../../../../lib/om.compact.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { ConfigErrorBox } from "../config-error-box.js";

export class SpreedsheetExportNodePopup extends HTMLElement {
	/** @param {import('../../../../models/PipeNode.js').PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {SpreedsheetConfig} */
		this.config = pipeNode.config;
		this.errors = react([]);
	}

	async handleSave() {
		this.errors.splice(0, this.errors.length, ...this.config.validate());
		if (this.errors.length !== 0) return;

		try {
			this.pipeNode.summary = this.config.getSummary();
			const config = Object.assign({}, this.config);
			await pipedb.updateNodeConfig(this.pipeNode.id, config, this.pipeNode.summary);

			fireEvent(this, "savenodeconfig", this.pipeNode);
			this.hidePopover();
			notify("Spreadsheet export configuration saved");
		} catch (error) {
			console.error("Save failed:", error);
			notify("Failed to save configuration", "error");
		}
	}

	render() {
		return html`<section>
			<ul class="config-field-list">
				<label>
					<div>Spreadsheet Name</div>
					<input type="text" .value=${() => this.config.spreadsheetName} placeholder="My Spreadsheet" />
				</label>

				<label>
					<div>Sheet Name</div>
					<input type="text" .value=${() => this.config.sheetName} placeholder="Sheet1" required />
				</label>

				<label>
					<div>Operation</div>
					<select .value=${() => this.config.operation}>
						<option value="${SheetOperation.APPEND}">Append rows</option>
						<option value="${SheetOperation.REPLACE}">Replace all data</option>
					</select>
				</label>

				<label class="checkbox-label">
					<input type="checkbox" ?checked=${() => this.config.includeHeaders} />
					<span>Include column headers</span>
				</label>

				<div class="info-box">
					<p>
						📊 Data will be exported to:
						<strong
							>${() => this.config.spreadsheetName || "New Spreadsheet"} > ${() => this.config.sheetName}</strong
						>
					</p>
					<p>🔐 Authentication is handled securely by the backend</p>
				</div>
			</ul>
		</section>`;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "spreadsheet-write", title: "Export to Sheet" });
		$on(header, "update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}

	onClosedPopover() {
		// Cleanup if needed
	}
}

customElements.define("spreedsheet-export-node-card", SpreedsheetExportNodePopup);
