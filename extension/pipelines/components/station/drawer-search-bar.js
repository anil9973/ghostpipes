// import { html } from "../../../lib/om.compact.js";

// export class DrawerSearchBar extends HTMLElement {
// 	constructor() {
// 		super();
// 	}

// 	handleClose() {
// 		this.hidePopover();
// 	}

// 	handleSearch() {}

// 	render() {
// 		return html`<div class="drawer-header">
// 				<h2>My Pipelines</h2>
// 				<button class="close-btn" @click=${this.handleClose.bind(this)} aria-label="Close drawer">✕</button>
// 			</div>

// 			<div class="drawer-search">
// 				<input
// 					type="search"
// 					@input=${this.handleSearch.bind(this)}
// 					placeholder="Search pipelines..."
// 					aria-label="Search pipelines" />
// 			</div>`;
// 	}

// 	connectedCallback() {
// 		this.replaceChildren(this.render());
// 	}
// }

// customElements.define("drawer-search-bar", DrawerSearchBar);
