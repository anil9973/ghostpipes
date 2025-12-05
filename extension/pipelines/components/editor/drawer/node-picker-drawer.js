import "./node-card.js";
import "./input-resources.js";
import "./data-operations.js";
import "./output-destinations.js";
import { DefNodeCard } from "./node-card.js";
import { InputResources } from "./input-resources.js";
import { DataOperations } from "./data-operations.js";
import { OutputDestinations } from "./output-destinations.js";
import { AiPlumberNodeCard } from "../nodes/ai-plumber-node.js";
import { DefNode } from "../../../models/DefNode.js";
import { NodeType } from "../../../models/PipeNode.js";

/** NodePickerDrawer component - main container for categorized node selection */
export class NodePickerDrawer extends HTMLElement {
	constructor() {
		super();
	}

	handleNodeSelected({ detail }) {
		fireEvent(this, "addnode", detail);
	}

	render() {
		const aiPlumberNode = new DefNode(NodeType.AI_PROCESSOR);
		return [new DefNodeCard(aiPlumberNode), new InputResources(), new DataOperations(), new OutputDestinations()];
	}

	connectedCallback() {
		this.replaceChildren(...this.render());
		this.addEventListener("defnodepick", this.handleNodeSelected.bind(this));
	}
}

customElements.define("node-picker-drawer", NodePickerDrawer);
