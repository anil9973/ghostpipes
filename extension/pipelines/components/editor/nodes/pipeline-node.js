import { react } from "../../../../lib/om.compact.js";
import { CtmElemNames } from "../../../js/constant.js";
import { PipeNode } from "../../../models/PipeNode.js";
import { PipeNodeHeader } from "./pipe-node-header.js";

export class PipelineNodeBox extends HTMLElement {
	isDragging = false;
	dragOffset = { x: 0, y: 0 };
	activeSide = null; // Side currently hovered
	// Registry of connected pipe IDs per side
	sockets = { top: [], bottom: [] }; // Only Top and Bottom allowed

	static CAPACITY = 5;

	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.pipeNode = react(pipeNode);
	}

	/* initResizeObserver() {
		// Detects when the node changes size
		this.resizeObserver = new ResizeObserver(() => fireEvent(this.parentElement, "nodenoderesizedrag"));
		this.resizeObserver.observe(this);
	} */

	onPointerDown(evt) {
		if (evt.target.closest("svg")) return;
		if (evt.target.closest(".port-trigger")) return; // Don't drag node if clicking port

		this.isDragging = true;
		this.setPointerCapture(evt.pointerId);

		const rect = this.getBoundingClientRect();
		this.dragOffset = { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
		this.style.zIndex = String(100);
	}

	onPointerMove(evt) {
		if (this.isDragging) {
			const parentRect = this.parentElement.getBoundingClientRect();
			this.style.left = `${evt.clientX - parentRect.left - this.dragOffset.x}px`;
			this.style.top = `${evt.clientY - parentRect.top - this.dragOffset.y}px`;
			// Notify parent to redraw pipes
			fireEvent(this.parentElement, "nodedrag");
		} else this.#handleHover(evt);
	}

	onPointerUp(evt) {
		this.isDragging = false;
		this.style.zIndex = "";
		this.releasePointerCapture(evt.pointerId);
	}

	onPlusBtnPointerDown(evt) {
		evt.stopPropagation();
		// Fire event so App knows to start drawing a pipe
		const detail = { node: this, side: this.activeSide };
		this.dispatchEvent(new CustomEvent("port-drag-start", { bubbles: true, detail: detail }));
	}

	attachListeners() {
		$on(this, "pointerdown", this.onPointerDown);
		$on(this, "pointermove", this.onPointerMove);
		$on(this, "pointerup", this.onPointerUp);
		// --- Port Dragging Logic ---
		this.plusBtn.addEventListener("pointerdown", this.onPlusBtnPointerDown.bind(this));
	}

	#handleHover(e) {
		if (this.isDragging) return;

		const rect = this.getBoundingClientRect();
		const y = e.clientY - rect.top;

		// Show trigger on BOTH Top and Bottom
		if (y < 30) {
			this.activeSide = "top";
			this.#updateButtonPosition("top");
		} else if (y > rect.height - 30) {
			this.activeSide = "bottom";
			this.#updateButtonPosition("bottom");
		} else {
			this.plusBtn.classList.remove("visible");
			this.activeSide = null;
		}
	}

	#updateButtonPosition(side) {
		const btn = this.plusBtn;
		btn.classList.add("visible");
		btn.style.inset = "auto";
		btn.style.margin = "0";

		const offset = "-12px";
		if (side === "top") {
			btn.style.top = offset;
			btn.style.left = "50%";
			btn.style.marginLeft = offset;
		} else {
			btn.style.bottom = offset;
			btn.style.left = "50%";
			btn.style.marginLeft = offset;
		}
	}

	// == Connection Management ==

	addConnection(side, pipeId) {
		this.sockets[side].includes(pipeId) || this.sockets[side].push(pipeId);
	}

	getNearestSide(x, y) {
		const rect = this.getBoundingClientRect();
		const ly = y - rect.top;
		return ly < rect.height / 2 ? "top" : "bottom";
	}

	getRect() {
		const r = this.getBoundingClientRect();
		const p = this.parentElement.getBoundingClientRect();
		return { x: r.left - p.left, y: r.top - p.top, w: r.width, h: r.height };
	}

	getPortPosition(side, pipeId = null) {
		const rect = this.getBoundingClientRect();
		const parent = this.parentElement.getBoundingClientRect();
		const relX = rect.left - parent.left;
		const relY = rect.top - parent.top;

		// Distribute pipes evenly
		const existingIndex = this.sockets[side].indexOf(pipeId);
		let index = existingIndex;
		let count = this.sockets[side].length;
		index === -1 && ((index = count), count++);

		// Even distribution formula
		const step = rect.width / (count + 1);
		return {
			x: relX + step * (index + 1),
			y: side === "top" ? relY : relY + rect.height,
		};
	}

	removeConnection(pipeId) {
		for (const side in this.sockets) this.sockets[side] = this.sockets[side].filter((id) => id !== pipeId);
	}

	render() {
		this.plusBtn = document.createElement("div");
		this.plusBtn.className = "port-trigger";
		this.plusBtn.textContent = "✚";

		const nodeHeader = new PipeNodeHeader(this.pipeNode);
		// $on(nodeHeader, "update", callback);
		$on(nodeHeader, "delete", () => fireEvent(this.parentElement, "nodedelete", this.pipeNode.id));

		const blockquote = document.createElement("blockquote");
		blockquote.textContent = this.pipeNode.summary;
		this.pipeNode["$on"]("summary", () => (blockquote.textContent = this.pipeNode.summary));
		return [this.plusBtn, nodeHeader, blockquote];
	}

	connectedCallback() {
		this.replaceChildren(...this.render());
		this.attachListeners();
		// this.initResizeObserver();
	}
}

customElements.define(CtmElemNames.PIPELINE_NODE_BOX, PipelineNodeBox);
