import { html, map } from "../../../../lib/om.compact.js";

export class ConfigErrorBox extends HTMLElement {
	constructor(errors) {
		super();
		this.errors = errors;
	}

	render() {
		const item = (err) => html`<li>${err}</li>`;
		return html` ${map(this.errors, item)} `;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("config-error-box", ConfigErrorBox);
