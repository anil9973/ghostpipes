/**
 * @fileoverview Loop node configuration
 * @module pipelines/models/configs/processing/LoopConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Loop output mode types */
export const LoopOutputMode = {
	EMIT: "emit",
	COLLECT: "collect",
};

/**
 * Configuration for loop node
 * Iterates over array items and processes each one
 */
export class LoopConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.loopOver] - Field containing array to loop over
	 * @param {boolean} [init.flatten] - Flatten nested arrays in output
	 * @param {string} [init.outputMode] - Output mode (emit, collect)
	 * @param {string} [init.assignTo] - Variable name for loop item
	 * @param {number} [init.maxIterations] - Maximum iterations allowed
	 */
	constructor(init = {}) {
		super();
		/** @type {string} Field name that contains the iterable array */
		this.loopOver = init.loopOver || "";

		/** @type {boolean} Flatten nested arrays into a single list */
		this.flatten = init.flatten ?? false;

		/** @type {LoopOutputMode} Output style: emit each, or collect full results */
		this.outputMode = init.outputMode || LoopOutputMode.EMIT;

		/** @type {string} Variable to reference current item in expressions */
		this.assignTo = init.assignTo || "";

		/** @type {number} Max iterations to avoid infinite loops */
		this.maxIterations = init.maxIterations || 1000;
	}

	getSchema() {
		return {
			loopOver: {
				type: "string",
				required: true,
			},
			flatten: {
				type: "boolean",
				required: false,
			},
			outputMode: {
				type: "string",
				required: true,
				enum: Object.values(LoopOutputMode),
			},
			assignTo: {
				type: "string",
				required: false,
			},
			maxIterations: {
				type: "number",
				required: false,
				min: 1,
			},
		};
	}

	validate() {
		const errors = super.validate();
		if (!this.loopOver) {
			errors.push("Loop field is required");
		}
		if (this.maxIterations < 1) {
			errors.push("Max iterations must be at least 1");
		}
		return errors;
	}

	getSummary() {
		if (!this.loopOver) return "Loop not configured";
		const mode = this.outputMode === LoopOutputMode.EMIT ? "emit each" : "collect all";
		const max = this.maxIterations !== 1000 ? ` (max ${this.maxIterations})` : "";
		return `Loop ${this.loopOver} (${mode}${max})`.slice(0, 120);
	}
}
