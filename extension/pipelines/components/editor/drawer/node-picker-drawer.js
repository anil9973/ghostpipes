import { AuthRequiredDialog } from "../../utils/auth-required-dialog.js";
import { OutputDestinations } from "./output-destinations.js";
import { InputResources } from "./input-resources.js";
import { DataOperations } from "./data-operations.js";
import { NodeType } from "../../../models/PipeNode.js";
import { DefNode } from "../../../models/DefNode.js";
import { DefNodeCard } from "./node-card.js";

/** NodePickerDrawer component - main container for categorized node selection */
export class NodePickerDrawer extends HTMLElement {
	constructor() {
		super();
	}

	onNodeDragStart(evt) {
		const node = evt.target.node;
		if (!node.authRequired) return;

		evt.preventDefault();
		document.body.appendChild(new AuthRequiredDialog(node.title));
	}

	onNodeClick(evt) {
		const node = evt.detail;
		if (!node.authRequired) return fireEvent(this, "addnode", node);

		evt.preventDefault();
		document.body.appendChild(new AuthRequiredDialog(node.title));
	}

	render() {
		const aiPlumberNode = new DefNode(NodeType.AI_PROCESSOR);
		return [new DefNodeCard(aiPlumberNode), new InputResources(), new DataOperations(), new OutputDestinations()];
	}

	connectedCallback() {
		this.replaceChildren(...this.render());
		this.addEventListener("defnodepick", this.onNodeClick.bind(this));
		this.addEventListener("dragstart", this.onNodeDragStart.bind(this));
	}
}

customElements.define("node-picker-drawer", NodePickerDrawer);
