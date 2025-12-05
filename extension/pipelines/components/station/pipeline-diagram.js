import { html, map } from "../../../lib/om.compact.js";
import { Pipeline } from "../../models/Pipeline.js";

/** PipelineDiagram - Mini visual representation of pipeline flow */
export class PipelineDiagram extends HTMLElement {
	/** @param {Pipeline} pipeline */
	constructor(pipeline) {
		super();
		this.pipeline = pipeline;
	}

	drawPipes() {
		const svgElem = this.firstElementChild;
		const containerRect = this.getBoundingClientRect();
		this.pipeline.pipes.forEach((pipe) => {
			const src = this.querySelector(`[data-id="${pipe.sourceId}"]`);
			const trg = this.querySelector(`[data-id="${pipe.targetId}"]`);
			if (!src || !trg) return;

			const srcRect = src.getBoundingClientRect();
			const trgRect = trg.getBoundingClientRect();

			// Calc coords relative to container
			// Start: Bottom Center of Source
			const x1 = srcRect.left + srcRect.width / 2 - containerRect.left;
			const y1 = srcRect.bottom - containerRect.top + 3;

			// End: Top Center of Target
			const x2 = trgRect.left + trgRect.width / 2 - containerRect.left;
			const y2 = trgRect.top - containerRect.top - 6;

			// Routing: Down -> Horizontal -> Down
			const midY = (y1 + y2) / 2;
			const d = `M ${x1} ${y1} V ${midY} H ${x2} V ${y2}`;

			const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path.setAttribute("d", d);
			path.setAttribute("class", "pp-line");
			path.setAttribute("marker-end", "url(#arrowHead)");

			svgElem.appendChild(path);
		});
	}

	render() {
		const item = (node, index) => html`<li class="diagram-node" data-id="${node.id}">
			<svg class="icon"><use href="/assets/icons.svg#${node.type}"></use></svg>
			<span>${node.title}</span>
		</li>`;
		return html`<svg class="connector-layer" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<marker
						id="arrowHead"
						viewBox="0 0 10 10"
						refX="4"
						refY="5"
						markerWidth="5"
						markerHeight="5"
						orient="auto-start-reverse">
						<path d="M 0 0 L 10 5 L 0 10 z" class="pp-arrow-fill" transform="scale(0.5) translate(5,5)" />
					</marker>
				</defs>
			</svg>

			<ul>
				${this.pipeline.nodes.map(item)}
			</ul>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
		requestAnimationFrame(() => this.drawPipes());
	}
}

customElements.define("pipeline-diagram", PipelineDiagram);
