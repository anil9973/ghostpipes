import { nanoid } from "../utils/common.js";

/**
 * Represents a visual connection (pipe) between two nodes in the pipeline editor.
 */
export class Pipe {
	/**
	 * @param {Object} init - Initial pipe configuration
	 * @param {string} [init.id] - Unique identifier for the pipe
	 * @param {string} init.sourceId - ID of the source node
	 * @param {string} init.sourceSide - Anchor side on the source node (top, bottom, left, right)
	 * @param {string} init.targetId - ID of the target node
	 * @param {string} init.targetSide - Anchor side on the target node (top, bottom, left, right)
	 */
	constructor(init) {
		/** @type {string} Pipe identifier */
		this.id = init.id || nanoid();

		/** @type {string} Source node ID */
		this.sourceId = init.sourceId;

		/** @type {string} Source anchor position */
		this.sourceSide = init.sourceSide;

		/** @type {string} Target node ID */
		this.targetId = init.targetId;

		/** @type {string} Target anchor position */
		this.targetSide = init.targetSide;
	}
}
