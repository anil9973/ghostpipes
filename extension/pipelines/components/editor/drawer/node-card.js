import { html } from "../../../../lib/om.compact.js";
import { DefNode } from "../../../models/DefNode.js";

/** NodeCard component - displays a clickable node option with icon, title, and subtitle */
export class DefNodeCard extends HTMLElement {
	/** @param {DefNode} node*/
	constructor(node) {
		super();
		this.node = node;
		this.draggable = true;
	}

	handleClick(event) {
		event.stopPropagation();
		fireEvent(this.closest("node-picker-drawer"), "defnodepick", this.node);
	}

	render() {
		return html`<svg class="icon">
				<use href="/assets/icons.svg#${this.node.iconId}"></use>
			</svg>
			<div class="column">
				<div class="title">${this.node.title}</div>
				<div class="subtitle">${this.node.subtitle}</div>
			</div>
			${this.node.authRequired ? html`<span class="auth-lock" title="User Account Required">🔒</span>` : ""}`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
		$on(this, "click", this.handleClick.bind(this));
	}
}

customElements.define("def-node-card", DefNodeCard);
