import { AiPlumberNodeCard } from "../../components/editor/nodes/ai-plumber-node.js";
import { PipelineNodeBox } from "../../components/editor/nodes/pipeline-node.js";
import { NodeType, PipeNode } from "../../models/PipeNode.js";
import { Pipeline } from "../../models/Pipeline.js";
import { PipeRenderer } from "./PipeRenderer.js";
import { PathFinder } from "./PathFinder.js";
import { Pipe } from "../../models/Pipe.js";
import { nanoid } from "../../utils/common.js";
import { db, Store } from "../../db/db.js";
import { pipedb } from "../../db/pipeline-db.js";
import { CtmElemNames } from "../../js/constant.js";

export class PipelineEditor {
	pipeCanvas;
	svgLayer;
	nodes = new Map();
	pipes = [];
	dragPickNode;
	dragState = { active: false, node: null, side: null, tempPath: null };

	constructor(pipeCanvas) {
		this.pipeCanvas = pipeCanvas;
		this.svgLayer = pipeCanvas.firstElementChild;
		this.#setupEvents();
	}

	/** @param {PipeNode} pipeNode */
	addNode(pipeNode) {
		const node = new PipelineNodeBox(pipeNode);
		node.dataset.id = pipeNode.id;
		node.style.left = `${pipeNode.position.x}px`;
		node.style.top = `${pipeNode.position.y}px`;

		this.pipeCanvas.appendChild(node);
		this.nodes.set(node.dataset.id, node);
		return node;
	}

	checkAutoGrow(node) {
		const buffer = 100; // Trigger when within 100px of edge
		const growAmount = 300; // Add 300px

		// 1. Parse current position (integers)
		const x = parseInt(node.style.left || 0);
		const y = parseInt(node.style.top || 0);
		const w = node.offsetWidth;
		const h = node.offsetHeight;

		// 2. Get current canvas size (scroll dimensions)
		// We check scrollWidth/Height because that represents the true size including overflow
		const currentWidth = this.pipeCanvas.scrollWidth;
		const currentHeight = this.pipeCanvas.scrollHeight;

		let didGrow = false;

		// Check Height
		if (y + h + buffer > currentHeight) {
			this.pipeCanvas.style.height = `${currentHeight + growAmount}px`;
			didGrow = true;
		}

		// Check Width
		if (x + w + buffer > currentWidth) {
			this.pipeCanvas.style.width = `${currentWidth + growAmount}px`;
			didGrow = true;
		}

		// If we grew the container, we MUST update the SVG size to match
		// otherwise pipes at the bottom get clipped.
		if (didGrow) {
			this.svgLayer.style.height = this.pipeCanvas.style.height;
			this.svgLayer.style.width = this.pipeCanvas.style.width;
		}
	}

	#setupEvents() {
		// Listen for internal node events
		this.pipeCanvas.addEventListener("nodedrag", this.onNodeDrag.bind(this));
		this.pipeCanvas.addEventListener("noderesize", this.renderPipes.bind(this));
		this.pipeCanvas.addEventListener("nodedelete", (e) => this.deleteNode(e["detail"]));
		this.pipeCanvas.addEventListener("port-drag-start", (e) => this.startPipeDrag(e["detail"]));

		addEventListener("pointermove", this.onPointerMove.bind(this));
		addEventListener("pointerup", this.onPointerUp.bind(this));
	}

	onNodeDrag(evt) {
		this.renderPipes();
		evt.target.nodeName === CtmElemNames.PIPELINE_NODE_BOX && this.checkAutoGrow(evt.target);
	}

	async handleNodeDrop(evt) {
		evt.preventDefault();
		const stageRect = this.pipeCanvas.getBoundingClientRect();
		const x = evt.clientX - stageRect.left - 60;
		const y = evt.clientY - stageRect.top - 30;
		const defNode = evt.type === "drop" ? this.dragPickNode.node : evt.detail;
		if (defNode.type === NodeType.AI_PROCESSOR) return this.pipeCanvas.appendChild(new AiPlumberNodeCard()); // temp, change later

		const pipeNode = new PipeNode({ type: defNode.type, title: defNode.title, position: { x, y } });
		if (globalThis.pipelineId === "new-pipeline") {
			const pipelineId = await db.put(Store.Pipelines, new Pipeline({ nodes: [pipeNode] }));
			if (!pipelineId) return;
			globalThis.pipelineId = pipelineId;
			location.search = "?p=" + pipelineId;
		} else await pipedb.savePipeNode(pipeNode);

		const node = this.addNode(pipeNode);
		fireEvent(node.children[1], "openconfigpopup");
	}

	insertPipeNodes(data) {
		if (data.nodes && Array.isArray(data.nodes)) data.nodes.forEach((nodeData) => this.addNode(nodeData));
		// Build Pipes
		// However, we MUST register connections with the nodes themselves for the spacing logic.
		if (data.pipes && Array.isArray(data.pipes)) {
			data.pipes.forEach((p) => {
				const source = this.nodes.get(p.sourceId);
				const target = this.nodes.get(p.targetId);

				if (source && target) {
					// Register socket usage
					source.addConnection(p.sourceSide, p.id);
					target.addConnection(p.targetSide, p.id);

					this.pipes.push(
						new Pipe({
							id: p.id,
							sourceId: p.sourceId,
							sourceSide: p.sourceSide,
							targetId: p.targetId,
							targetSide: p.targetSide,
						})
					);
				}
			});
		}

		setTimeout(() => this.renderPipes(), 0);
	}

	startPipeDrag(detail) {
		this.dragState = {
			active: true,
			node: detail.node,
			side: detail.side,
			tempPath: document.createElementNS("http://www.w3.org/2000/svg", "path"),
		};

		// Style the temporary drag line
		const path = this.dragState.tempPath;
		path.setAttribute("stroke", "#6b7280");
		path.setAttribute("stroke-width", "4");
		path.setAttribute("stroke-dasharray", "5,5");
		path.setAttribute("fill", "none");
		this.svgLayer.appendChild(path);
	}

	onPointerMove(e) {
		if (!this.dragState.active) return;

		const stageRect = this.pipeCanvas.getBoundingClientRect();

		// Get start position. Pass 'null' ID to simulate the next available slot.
		const start = this.dragState.node.getPortPosition(this.dragState.side, null);

		// Current Mouse coordinates relative to stage
		const mouseX = e.clientX - stageRect.left;
		const mouseY = e.clientY - stageRect.top;

		// Draw simple preview
		const d = PathFinder.generateSimplePath(start.x, start.y, mouseX, mouseY, this.dragState.side);
		this.dragState.tempPath.setAttribute("d", d);
	}

	onPointerUp(evt) {
		if (!this.dragState.active) return;
		const targetNode = evt.target?.closest(CtmElemNames.PIPELINE_NODE_BOX);
		const sourceNode = this.dragState.node;

		if (targetNode && targetNode !== this.dragState.node) {
			const srcRect = sourceNode.getBoundingClientRect();
			const tgtRect = targetNode.getBoundingClientRect();

			// Calculate center points Y
			const srcY = srcRect.top + srcRect.height / 2;
			const tgtY = tgtRect.top + tgtRect.height / 2;

			let finalSourceSide, finalTargetSide;

			// 2. Decide Sides based on relative position
			if (srcY < tgtY) {
				// Source is ABOVE Target -> Flow DOWN
				// Connect Bottom of Source to Top of Target
				finalSourceSide = "bottom";
				finalTargetSide = "top";
			} else {
				// Source is BELOW Target -> Flow UP (Vice Versa)
				// Connect Top of Source to Bottom of Target
				finalSourceSide = "top";
				finalTargetSide = "bottom";
			}

			// 3. Create Connection (No Warnings, Just Do It)
			// Optional: Basic Duplicate check just to prevent visual glitches
			if (!this.checkDuplicate(sourceNode.dataset.id, targetNode["dataset"].id)) {
				this.createPipe(sourceNode, finalSourceSide, targetNode, finalTargetSide);
			}
		}

		this.dragState.tempPath.remove();
		// @ts-ignore
		this.dragState = { active: false, null: null };
	}

	checkDuplicate(sId, tId) {
		return this.pipes.some((p) => p.sourceId === sId && p.targetId === tId);
	}

	createPipe(source, sourceSide, target, targetSide) {
		const pipeId = nanoid();
		// Register connection on nodes (This locks the specific slot)
		source.addConnection(sourceSide, pipeId);
		target.addConnection(targetSide, pipeId);
		const pipe = new Pipe({
			id: pipeId,
			sourceId: source.dataset.id,
			sourceSide: sourceSide,
			targetId: target.dataset.id,
			targetSide: targetSide,
		});

		this.pipes.push(pipe);
		pipedb.savePipe(pipe);
		this.renderPipes();
	}

	/** Deletes a node and all connected pipes */
	deleteNode(nodeId) {
		// 1. Find all pipes connected to this node
		const pipesToRemove = this.pipes.filter((p) => p.sourceId === nodeId || p.targetId === nodeId);

		// 2. Clean up connections on the OTHER nodes
		// (If we delete Node A, we must tell Node B to free up its socket)
		pipesToRemove.forEach((pipe) => {
			const otherNodeId = pipe.sourceId === nodeId ? pipe.targetId : pipe.sourceId;
			const otherNode = this.nodes.get(otherNodeId);

			otherNode && otherNode.removeConnection(pipe.id);
		});

		// 3. Remove pipes from data model
		this.pipes = this.pipes.filter((p) => p.sourceId !== nodeId && p.targetId !== nodeId);

		// 4. Remove Node from DOM and Map
		const node = this.nodes.get(nodeId);
		if (node) {
			node.remove(); // DOM removal
			this.nodes.delete(nodeId); // Map removal
			pipedb.removePipeNode(nodeId);
		}

		// 5. Redraw SVG to remove the ghost pipes
		this.renderPipes();
	}

	renderPipes() {
		const groups = this.svgLayer.querySelectorAll("g");
		groups.forEach((g) => g.remove());

		const obstacles = Array.from(this.nodes.values()).map((n) => n.getRect());
		this.pipes.forEach((pipe) => {
			const source = this.nodes.get(pipe.sourceId);
			const target = this.nodes.get(pipe.targetId);

			if (source && target) {
				const start = source.getPortPosition(pipe.sourceSide, pipe.id);
				const end = target.getPortPosition(pipe.targetSide, pipe.id);
				const pipeEl = PipeRenderer.drawPipe(start, pipe.sourceSide, end, pipe.targetSide, obstacles);
				this.svgLayer.appendChild(pipeEl);
			}
		});
	}
}
