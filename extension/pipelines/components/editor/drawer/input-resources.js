import { DefNode, HttpNodes, ManualInputNodes, StandaloneNodes } from "../../../models/DefNode.js";
import { html } from "../../../../lib/om.compact.js";
import { DefNodeCard } from "./node-card.js";

/**
 * InputResources component - category section for input source nodes
 * Extends HTMLDetailsElement for native expand/collapse behavior
 */
export class InputResources extends HTMLDetailsElement {
	constructor() {
		super();
		this.id = "input-resources";
		this.name = "def-node-block";
	}

	handleToggle(event) {
		// Event fires when details element is toggled
		// Can be used for analytics or state management
	}

	render() {
		return html` <summary>
				<svg class="icon">
					<use href="/assets/icons.svg#input-sources"></use>
				</svg>
				<span>Input sources</span>
			</summary>
			<ul>
				<details>
					<summary>Manual Input</summary>
					<ul>
						${ManualInputNodes.map((nodeType) => new DefNodeCard(new DefNode(nodeType)))}
					</ul>
				</details>

				<details>
					<summary>HTTP Request</summary>
					<ul>
						${HttpNodes.map((nodeType) => new DefNodeCard(new DefNode(nodeType)))}
					</ul>
				</details>

				${StandaloneNodes.map((nodeType) => new DefNodeCard(new DefNode(nodeType)))}
			</ul>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
		this.addEventListener("toggle", this.handleToggle.bind(this));
	}
}

customElements.define("input-resources", InputResources, { extends: "details" });
