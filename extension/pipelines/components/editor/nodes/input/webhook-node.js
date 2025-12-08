import { WebhookConfig } from "../../../../models/configs/input/WebhookConfig.js";
import { html, react } from "../../../../../lib/om.compact.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { ConfigErrorBox } from "../config-error-box.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { SERVER_URL } from "../../../../js/constant.js";

/** Webhook node configuration popup */
export class WebhookNodePopup extends HTMLElement {
	/** @param {import('../../../../models/PipeNode.js').PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {WebhookConfig} */
		this.config = pipeNode.config;
		this.errors = react([]);
	}

	async loadWebhookData() {
		if (!this.config.webhookId) return;

		try {
			// TODO: Implement when WebhookService is available
			// const webhookData = await webhookService.getWebhook(this.config.webhookId);
			// this.state.webhookData = webhookData;
		} catch (error) {
			console.error("Failed to load webhook data:", error);
		}
	}

	handleMethodChange(evt) {
		this.config.method = evt.target.value;
	}

	handleCopyUrl() {
		const webhookUrl = this.getWebhookUrl();
		navigator.clipboard
			.writeText(webhookUrl)
			.then(() => notify("Webhook URL copied to clipboard"))
			.catch(() => notify("Failed to copy URL", "error"));
	}

	toggleSecretVisibility() {
		// this.state.showSecret = !this.state.showSecret;
	}

	getWebhookUrl() {
		// TODO: Get actual server URL from config
		return `${SERVER_URL}/wh/${this.config.webhookId}`;
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
			notify("Webhook configuration saved");
		} catch (error) {
			console.error("Save failed:", error);
			notify("Failed to save configuration", "error");
		}
	}

	render() {
		const webhookUrl = this.getWebhookUrl();
		const secretDisplay = this.state.showSecret ? this.config.secret : "••••••••••••••";

		return html` <section>
			<ul class="config-field-list">
				<label>
					<div>Webhook URL</div>
					<div class="url-display">
						<input type="text" readonly .value=${() => webhookUrl} class="webhook-url-input" />
						<button class="icon-btn copy-btn" @click=${this.handleCopyUrl.bind(this)} title="Copy URL">
							<svg class="icon"><use href="/assets/icons.svg#copy"></use></svg>
						</button>
					</div>
				</label>

				<label>
					<div>HTTP Method</div>
					<select .value=${() => this.config.method}>
						<option value="GET">GET</option>
						<option value="POST" selected>POST</option>
						<option value="PUT">PUT</option>
						<option value="DELETE">DELETE</option>
						<option value="PATCH">PATCH</option>
					</select>
				</label>

				${() =>
					this.config.secret
						? html`
								<label>
									<div>Secret</div>
									<div class="secret-display">
										<input type="text" readonly .value=${() => secretDisplay} class="secret-input" />
										<button
											class="icon-btn"
											@click=${this.toggleSecretVisibility.bind(this)}
											title="${() => (this.state.showSecret ? "Hide" : "Show")} secret">
											<svg class="icon">
												<use
													href="/assets/icons.svg#${() =>
														this.state.showSecret ? "visibility-off" : "visibility"}"></use>
											</svg>
										</button>
									</div>
								</label>
						  `
						: ""}
			</ul>
		</section>`;
	}

	async connectedCallback() {
		const header = new NodeConfigHeader({ icon: "webhook", title: "Webhook Configuration" });
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(header, "update", this.handleSave.bind(this));
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}

	onClosedPopover() {
		// Cleanup if needed
	}
}

customElements.define("webhook-node-card", WebhookNodePopup);
