import { html, react } from "../../../lib/om.compact.js";

export class TriggerOptionBar extends HTMLElement {
	constructor() {
		super();
	}

	trigger = react({
		manual: true,
		webhook: false,
		webhookUrl: "",
		schedule: false,
		scheduleType: "every_1_day",
		scheduleTime: "09:00",
		scheduleDateTime: "",
	});

	render() {
		return html`<span class="trigger-label">Trigger by</span>

			<label class="trigger-option">
				<input type="checkbox" value="manual" ?checked=${() => this.trigger.manual} />
				<span>Manual</span>
			</label>

			<div class="trigger-option">
				<label>
					<input type="checkbox" value="webhook" ?checked=${() => this.trigger.webhook} />
					<span>Webhook</span>
				</label>

				${() =>
					this.trigger.webhook
						? html`
								<input
									type="url"
									class="webhook-url"
									.value=${() => this.trigger.webhookUrl}
									placeholder="https://example.com/webhook" />
						  `
						: ""}
			</div>

			<div class="trigger-option">
				<label>
					<input type="checkbox" value="schedule" ?checked=${() => this.trigger.schedule} />
					<span>Schedule</span>
				</label>

				${() =>
					this.trigger.schedule
						? html`
								<div class="schedule-config row">
									<select .value=${() => this.trigger.scheduleType}>
										<option value="every_1_day">Every 1 day</option>
										<option value="every_7_day">Every 7 days</option>
										<option value="every_30_day">Every 30 days</option>
										<option value="once">Once</option>
									</select>
									${() =>
										this.trigger.scheduleType === "once"
											? html` <input type="datetime-local" .value=${() => this.trigger.scheduleDateTime} /> `
											: html` <input type="time" .value=${() => this.trigger.scheduleTime} /> `}
								</div>
						  `
						: ""}
			</div>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("trigger-option-bar", TriggerOptionBar);
