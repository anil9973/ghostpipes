import { PipelinesDrawer } from "./pipelines-drawer.js";
import { html } from "../../../lib/om.compact.js";
import { UserAuthDialog } from "./auth-dialog.js";

/** AppTopHeader - Navigation bar with drawer toggle and create button */
export class AppTopHeader extends HTMLElement {
	constructor() {
		super();
	}

	handleUserProfileClick() {
		this.appendChild(new UserAuthDialog());
	}

	handleDrawerClick() {
		if (!this.pipelinesDrawer) {
			this.pipelinesDrawer = new PipelinesDrawer();
			this.appendChild(this.pipelinesDrawer);
		} else this.pipelinesDrawer.showPopover();
	}

	handleCreateClick() {
		window.location.search = "?p=new-pipeline";
	}

	render() {
		return html`<button @click=${this.handleDrawerClick.bind(this)}>
				<span>My Pipes</span>
				<svg class="icon">
					<use href="/assets/icons.svg#drawer-open"></use>
				</svg>
			</button>
			<div class="logo">GhostPipes 🎃</div>
			<button class="primary-btn" @click=${this.handleCreateClick.bind(this)}>
				<svg class="icon">
					<use href="/assets/icons.svg#plus-thick"></use>
				</svg>
				Create Pipeline
			</button>
			<button class="icon-btn" @click=${this.handleUserProfileClick.bind(this)}>
				<svg class="icon">
					<use href="/assets/icons.svg#account"></use>
				</svg>
			</button>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("app-top-header", AppTopHeader);
