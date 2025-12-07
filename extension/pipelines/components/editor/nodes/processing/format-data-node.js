import { FormatConfig, FormatOutput } from "../../../../models/configs/processing/FormatConfig.js";
import { html, react } from "../../../../../lib/om.compact.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { ConfigErrorBox } from "../config-error-box.js";

export class FormatDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {FormatConfig}  */
		this.config = pipeNode.config;
		this.errors = react([]);
	}

	handleClose() {
		this.hidePopover();
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
				<div>
					<label>Output format:</label>
					<select .value=${() => this.config.format}>
						<option value="${FormatOutput.CSV}">CSV</option>
						<option value="${FormatOutput.JSON}">JSON</option>
						<option value="${FormatOutput.XML}">XML</option>
						<option value="${FormatOutput.HTML}">HTML Table</option>
						<option value="${FormatOutput.MARKDOWN}">Markdown Table</option>
						<option value="${FormatOutput.TEXT}">Plain Text (template)</option>
					</select>
				</div>

				${() =>
					this.config.format === "csv"
						? html`<div>
								<label><div>CSV Options:</div></label>
								<label>
									<input type="checkbox" ?checked=${() => this.config.csvIncludeHeaders} />
									Include headers
								</label>
								<label>
									Delimiter:
									<input type="text" .value=${() => this.config.csvDelimiter} class="short-input" /> Quote:
									<input type="text" .value=${() => this.config.csvQuote} class="short-input" />
								</label>
						  </div> `
						: ""}
				${() =>
					this.config.format === "json"
						? html`<div>
								<label>JSON Options:</label>
								<label>
									<input type="checkbox" ?checked=${() => this.config.jsonPretty} />
									Pretty print (indent)
								</label>
						  </div> `
						: ""}
				${() =>
					this.config.format === "text"
						? html`<div>
								<label>Template:</label>
								<textarea .value=${() => this.config.template} placeholder="{{name}} - {{price}}" rows="4"></textarea>
						  </div>`
						: ""}

				<div>
					<label>Field order (optional):</label>
					<input
						type="text"
						.value=${() => this.config.fieldOrder}
						placeholder="name, price, category (leave empty for all)" />
				</div>
			</ul>
		</section>`;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "format", title: "Format" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("format-data-node-card", FormatDataNodePopup);
