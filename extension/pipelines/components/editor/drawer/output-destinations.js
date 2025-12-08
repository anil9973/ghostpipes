import { html } from "../../../../lib/om.compact.js";
import { DefNode, OutputAuthNodes, OutputNodes } from "../../../models/DefNode.js";
import { DefNodeCard } from "./node-card.js";

/**
 * OutputDestinations component - category section for output destination nodes
 * Extends HTMLDetailsElement for native expand/collapse behavior
 */
export class OutputDestinations extends HTMLDetailsElement {
	constructor() {
		super();
		this.id = "output-destinations";
		this.name = "def-node-block";
	}

	handleToggle(event) {
		// Event fires when details element is toggled
	}

	render() {
		return html`<summary>
				<svg class="icon"><use href="/assets/icons.svg#output-dest"></use></svg>
				<span>Output destinations</span>
			</summary>
			<ul>
				${OutputNodes.map((nodeType) => new DefNodeCard(new DefNode(nodeType)))}
				${OutputAuthNodes.map((nodeType) => new DefNodeCard(new DefNode(nodeType, true)))}
			</ul>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
		this.addEventListener("toggle", this.handleToggle.bind(this));
	}
}

customElements.define("output-destinations", OutputDestinations, { extends: "details" });
