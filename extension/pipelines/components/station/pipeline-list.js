import { html, map, react } from "../../../lib/om.compact.js";
import { db, Store } from "../../db/db.js";
import { Pipeline } from "../../models/Pipeline.js";
import { PipelineCard } from "./pipeline-card.js";

/** PipelineList - Grid layout of pipeline cards */
export class PipelineList extends HTMLElement {
	/** @param {Pipeline[]} [pipelines] */
	constructor(pipelines) {
		super();
		this.pipelines = pipelines;
	}

	render() {
		return html`${map(this.pipelines, (pipeline) => new PipelineCard(pipeline))}`;
	}

	async connectedCallback() {
		this.pipelines ??= await db.getAll(Store.Pipelines);
		this.pipelines = react(this.pipelines);
		this.replaceChildren(this.render());
	}
}

customElements.define("pipeline-list", PipelineList);
