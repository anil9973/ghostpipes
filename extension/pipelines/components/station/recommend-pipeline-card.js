import { html } from "../../../lib/om.compact.js";
import { Pipeline } from "../../models/Pipeline.js";
import { ActionMenu } from "./action-menu.js";
import { PipelineDiagram } from "./pipeline-diagram.js";

/**PipelineCard - Visual card showing pipeline name and diagram */
export class RecommendPipelineCard extends HTMLElement {
	/** @param {Pipeline} pipeline */
	constructor(pipeline) {
		super();
		this.pipeline = pipeline;
	}

	render() {
		const cardHeader = html`<header>
			<input type="radio" value="${this.pipeline.id}" name="select-pipeline" />
			<span class="pipeline-name"> ${() => this.pipeline?.title || "Untitled Pipeline"} </span>
			${new ActionMenu(this.pipeline.id)}
		</header>`;
		return [cardHeader, new PipelineDiagram(this.pipeline)];
	}

	connectedCallback() {
		this.replaceChildren(...this.render());
	}
}

customElements.define("recommend-pipeline-card", RecommendPipelineCard);
