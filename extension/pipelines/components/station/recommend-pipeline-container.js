import { PipelineActionBar } from "./pipeline-action-bar.js";
import { react } from "../../../lib/om.compact.js";
import { PipelineList } from "./pipeline-list.js";

/**PipelineContainer - Wrapper for action bar and pipeline list */
export class RecommendPipelineContainer extends HTMLElement {
	constructor(pipelines) {
		super();
		/** @type {{matchCount: number, selectPipelineId:string}} */
		this.props = react({ matchCount: pipelines.length, selectPipelineId: null });
		this.pipelines = pipelines;
	}

	render() {
		return [new PipelineActionBar(this.props), new PipelineList(this.pipelines)];
	}

	connectedCallback() {
		this.replaceChildren(...this.render());
		$on(this.lastElementChild, "change", ({ target }) => (this.props.selectPipelineId = target.value));
	}
}

customElements.define("recommend-pipeline-container", RecommendPipelineContainer);
