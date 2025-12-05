import { html } from "../../../lib/om.compact.js";
import { db, Store } from "../../db/db.js";

/** ActionMenu - Dropdown menu for pipeline actions (Edit, Delete) */
export class ActionMenu extends HTMLElement {
	/** @param {string} pipelineId */
	constructor(pipelineId) {
		super();
		this.tabIndex = 0;
		this.pipelineId = pipelineId;
	}

	handleEdit(e) {
		window.location.search = `?p=${this.pipelineId}`;
	}

	async handleDelete(e) {
		await db.delete(Store.Pipelines, this.pipelineId);
	}

	render() {
		return html`<button class="icon-btn">
				<svg class="icon">
					<use href="/assets/icons.svg#menu"></use>
				</svg>
			</button>

			<menu>
				<li @click=${this.handleEdit.bind(this)}>
					<svg class="icon">
						<use href="/assets/icons.svg#edit"></use>
					</svg>
					<span>Edit</span>
				</li>

				<li @click=${this.handleDelete.bind(this)}>
					<svg class="icon">
						<use href="/assets/icons.svg#delete"></use>
					</svg>
					<span>Delete</span>
				</li>
			</menu>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("action-menu", ActionMenu);
