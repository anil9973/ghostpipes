import { AdvancedDataOps, CommonDataOps, DefNode } from "../../../models/DefNode.js";
import { html } from "../../../../lib/om.compact.js";
import { NodeType } from "../../../models/PipeNode.js";
import { DefNodeCard } from "./node-card.js";

/**
 * DataOperations component - category section for data processing nodes
 * Extends HTMLDetailsElement for native expand/collapse behavior
 */
export class DataOperations extends HTMLDetailsElement {
	constructor() {
		super();
		this.id = "data-operations";
		this.name = "def-node-block";
	}

	handleToggle(event) {
		// Event fires when details element is toggled
	}

	render() {
		return html`<summary>
				<svg class="icon">
					<use href="/assets/icons.svg#data-ops"></use>
				</svg>
				<span>Data operations</span>
			</summary>
			<ul>
				${CommonDataOps.map((nodeType) => new DefNodeCard(new DefNode(nodeType)))}
				<details>
					<summary>
						<svg class="icon">
							<use href="/assets/icons.svg#show-all"></use>
						</svg>
						Show All
					</summary>
					<ul>
						${AdvancedDataOps.map((nodeType) => new DefNodeCard(new DefNode(nodeType)))}
					</ul>
				</details>
			</ul>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
		this.addEventListener("toggle", this.handleToggle.bind(this));
	}
}

customElements.define("data-operations", DataOperations, { extends: "details" });
