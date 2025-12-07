import { html } from "../../../lib/om.compact.js";
import { TriggerType } from "../../models/Pipeline.js";

export class DrawerSearchBar extends HTMLElement {
	constructor() {
		super();
	}

	handleClose() {
		this.hidePopover();
	}

	searchPipelines() {
		//TODO
	}

	onInput() {
		if (this.timer) clearTimeout(this.timer), (this.timer = null);
		this.timer = setTimeout(() => {}, 2000);
	}

	render() {
		return html`<search>
			<select>
				<option value="${TriggerType.MANUAL}">Manual</option>
				<option value="${TriggerType.WEBHOOK}">Webhook</option>
				<option value="${TriggerType.SCHEDULE}">Schedule</option>
				<option value="${TriggerType.FILE_WATCH}">File Watch</option>
				<option value="${TriggerType.EVENT}">Event</option>
			</select>
			<input
				type="search"
				@input=${this.onInput.bind(this)}
				placeholder="🔎 Search pipelines..."
				aria-label="Search pipelines" />
		</search>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("drawer-search-bar", DrawerSearchBar);
