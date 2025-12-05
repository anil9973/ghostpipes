import { html } from "../../../../lib/om.compact.js";

export class NodeConfigHeader extends HTMLElement {
	/**@param {{icon:string, title:string}} props */
	constructor(props) {
		super();
		this.props = props;
	}

	handleSave() {
		fireEvent(this, "update");
	}

	handleClose() {
		this.parentElement.hidePopover();
	}

	render() {
		return html`<svg class="icon"><use href="/assets/icons.svg#${this.props.icon}"></use></svg>
			<span>${this.props.title}</span>
			<div class="action-btns">
				<button class="icon-btn" @click=${this.handleSave.bind(this)} title="Save & Close">
					<svg class="icon"><use href="/assets/icons.svg#done"></use></svg>
				</button>
				<button class="icon-btn" @click=${this.handleClose.bind(this)} title="Close">
					<svg class="icon"><use href="/assets/icons.svg#close"></use></svg>
				</button>
			</div>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}
customElements.define("node-config-header", NodeConfigHeader);
