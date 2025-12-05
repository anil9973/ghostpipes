import { PipelineList } from "./pipeline-list.js";

/**PipelinesDrawer - Side panel showing all user pipelines*/
export class PipelinesDrawer extends HTMLElement {
	constructor() {
		super();
		this.popover = "";
	}

	render() {
		return [new PipelineList()];
	}

	connectedCallback() {
		this.replaceChildren(...this.render());
		this.showPopover();
	}
}

customElements.define("pipelines-drawer-panel", PipelinesDrawer);
