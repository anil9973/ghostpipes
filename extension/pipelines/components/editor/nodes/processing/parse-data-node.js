import { html, react } from "../../../../../lib/om.compact.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { ParseConfig, ParseFormat } from "../../../../models/configs/processing/ParseConfig.js";
import { ValidationFailureAction } from "../../../../models/configs/processing/ValidateConfig.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { ConfigErrorBox } from "../config-error-box.js";
import { NodeConfigHeader } from "../config-node-header.js";

export class ParseDataNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {ParseConfig}  */
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
			config.htmlSelectors = Object.assign({}, this.config.htmlSelectors);
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
					<label>Input field:</label>
					<textarea .value=${() => this.config.inputField} placeholder="field containing data"></textarea>
				</div>

				<div class="config-row">
					<label>
						<div>Parse as:</div>
						<select .value=${() => this.config.format}>
							<option value=${ParseFormat.JSON}>JSON</option>
							<option value=${ParseFormat.CSV}>CSV</option>
							<option value=${ParseFormat.XML}>XML</option>
							<option value=${ParseFormat.HTML}>HTML (extract)</option>
							<option value=${ParseFormat.YAML}>YAML</option>
						</select>
					</label>

					<label>
						<div>On parse error:</div>
						<select .value=${() => this.config.onError}>
							<option value=${ValidationFailureAction.SKIP}>Skip item</option>
							<option value=${ValidationFailureAction.FAIL}>Fail pipeline</option>
							<option value=${ValidationFailureAction.MARK}>Tag error</option>
						</select>
					</label>
				</div>

				<div>
					<label>JSON path (optional):</label>
					<input
						type="text"
						.value=${() => this.config.jsonPath}
						placeholder="$.data.items or leave empty for root" />
				</div>

				<div>
					<label>
						<input type="checkbox" ?checked=${() => this.config.flatten} />
						Flatten nested objects
					</label>
				</div>
			</ul>
		</section>`;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "parse", title: "Parse" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("parse-data-node-card", ParseDataNodePopup);
