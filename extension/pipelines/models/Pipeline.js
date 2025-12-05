import { Pipe } from "./Pipe.js";
import { PipeNode } from "./PipeNode.js";

export class Pipeline {
	/**
	 * @param {Object} data - Initial serialized pipeline state
	 * @param {string} [data.id] - Unique pipeline identifier
	 * @param {string} [data.title] - Pipeline title shown in the UI
	 * @param {string} [data.summary] - Optional description of the pipeline purpose
	 * @param {{type: string, config: Object}} [data.trigger] - Execution trigger configuration
	 * @param {PipeNode[]} [data.nodes] - List of node objects that perform actions
	 * @param {Pipe[]} [data.pipes] - Visual + logical connections between nodes
	 * @param {number} [data.createdAt] - Timestamp when pipeline was created
	 * @param {number} [data.updatedAt] - Timestamp when pipeline was last updated
	 */
	constructor(data = {}) {
		/** @type {string} Unique pipeline ID */
		this.id = data.id || crypto.randomUUID();

		/** @type {string} Human-readable pipeline title */
		this.title = data.title || "Untitled Pipeline";

		/** @type {string} Short description or notes */
		this.summary = data.summary || "";

		/** @type {{type: string, config: Object}} Trigger that starts pipeline execution */
		this.trigger = data.trigger || { type: "manual", config: {} };

		/** @type {PipeNode[]} Node components (steps) in the pipeline */
		this.nodes = Array.isArray(data.nodes) ? data.nodes : [];

		/** @type {Pipe[]} Pipes defining data flow between nodes */
		this.pipes = Array.isArray(data.pipes) ? data.pipes : [];

		/** @type {number} Unix timestamp of creation */
		this.createdAt = data.createdAt || Date.now();

		/** @type {number} Unix timestamp of last modification */
		this.updatedAt = data.updatedAt || Date.now();

		this.usageCount = 0;
		this.lastUsed = null;
	}

	/**
	 * Prepare object for IndexedDB storage (strips undefined/functions)
	 * @returns {Object}
	 */
	toJSON() {
		return {
			id: this.id,
			title: this.title,
			summary: this.summary,
			trigger: this.trigger,
			nodes: this.nodes,
			pipes: this.pipes,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
