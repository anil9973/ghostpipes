import { PipelineEditor } from "../../services/Plumbing/PipelineEditor.js";
import { Pipeline } from "../../models/Pipeline.js";
import { html } from "../../../lib/om.compact.js";
import { pipedb } from "../../db/pipeline-db.js";
import { db, Store } from "../../db/db.js";
// @ts-ignore
import pipelineCss from "../../style/pipeline.css" with { type: "css" };
document.adoptedStyleSheets.push(pipelineCss);

export class PipelineCanvas extends HTMLElement {
	constructor() {
		super();
	}

	render() {
		return html`<svg id="pipe-layer" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<linearGradient id="pipeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stop-color="#9ca3af" />
					<stop offset="20%" stop-color="#e5e7eb" />
					<stop offset="50%" stop-color="#6b7280" />
					<stop offset="100%" stop-color="#374151" />
				</linearGradient>
				<radialGradient id="jointGradient">
					<stop offset="40%" stop-color="#9ca3af" />
					<stop offset="100%" stop-color="#4b5563" />
				</radialGradient>
			</defs>
			<defs>
				<filter id="dropShadow">
					<feGaussianBlur in="SourceAlpha" stdDeviation="2" />
					<feOffset dx="1" dy="1" />
					<feMerge>
						<feMergeNode />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>
		</svg>`;
	}

	async connectedCallback() {
		this.replaceChildren(this.render());
		this.pipelineEditor = new PipelineEditor(this);
		if (globalThis.pipelineId !== "new-pipeline") {
			const pipeline = await db.get(Store.Pipelines, globalThis.pipelineId);
			pipeline
				? this.pipelineEditor.insertPipeNodes(pipeline)
				: ((globalThis.pipelineId = "new-pipeline"), (location.search = "?p=new-pipeline"));
		}

		$on(this, "insertpipeline", async ({ detail }) => {
			//TODO: Improvement required
			if (globalThis.pipelineId === "new-pipeline") {
				const pipelineId = await db.put(Store.Pipelines, new Pipeline());
				if (!pipelineId) return;
				globalThis.pipelineId = pipelineId;
				location.search = "?p=" + pipelineId;
			}
			await pipedb.insertPipeNodes(detail.nodes, detail.pipes);
			this.pipelineEditor.insertPipeNodes(detail);
		});
		$on(this.previousElementSibling, "addnode", this.pipelineEditor.handleNodeDrop.bind(this.pipelineEditor));
		$on(this.previousElementSibling, "dragstart", (evt) => (this.pipelineEditor.dragPickNode = evt.target));
		$on(this, "dragover", (evt) => evt.preventDefault());
		$on(this, "drop", this.pipelineEditor.handleNodeDrop.bind(this.pipelineEditor));
	}
}

customElements.define("pipeline-canvas", PipelineCanvas);
