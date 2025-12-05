import { NodePickerDrawer } from "../components/editor/drawer/node-picker-drawer.js";
import { PipelineCanvas } from "../components/editor/pipeline-canvas.js";

export class PipelineFactoryHouse extends HTMLElement {
	constructor(pipelineId) {
		super();
		globalThis.pipelineId = pipelineId;
	}

	render() {
		return [new NodePickerDrawer(), new PipelineCanvas()];
	}

	connectedCallback() {
		this.replaceChildren(...this.render());
	}
}

customElements.define("pipeline-factory-house", PipelineFactoryHouse);
