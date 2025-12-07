/**
 * @fileoverview Until loop node configuration
 * @module pipelines/models/configs/processing/UntilLoopConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Timeout action types */
export const TimeoutAction = {
	FAIL: "fail",
	CONTINUE: "continue",
	SKIP: "skip",
};

/**
 * Configuration for until loop node
 * Loops until a condition is met or timeout/max iterations reached
 */
export class UntilLoopConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.condition] - Condition expression to evaluate
	 * @param {number} [init.maxIterations] - Maximum iterations allowed
	 * @param {number} [init.timeout] - Timeout in seconds
	 * @param {string} [init.onTimeout] - Action on timeout (skip, fail, tag)
	 */
	constructor(init = {}) {
		super();
		/** @type {string} Condition expression to evaluate each iteration */
		this.condition = init.condition || "";

		/** @type {number} Maximum allowed iterations */
		this.maxIterations = init.maxIterations || 100;

		/** @type {number} Timeout in seconds before triggering onTimeout */
		this.timeout = init.timeout || 300;

		/** @type {TimeoutAction} Action to take upon timeout */
		this.onTimeout = init.onTimeout || TimeoutAction.FAIL;
	}

	getSchema() {
		return {
			condition: {
				type: "string",
				required: true,
			},
			maxIterations: {
				type: "number",
				required: false,
				min: 1,
			},
			timeout: {
				type: "number",
				required: false,
				min: 1,
			},
			onTimeout: {
				type: "string",
				required: false,
				enum: Object.values(TimeoutAction),
			},
		};
	}

	validate() {
		const errors = super.validate();
		if (!this.condition) {
			errors.push("Condition is required");
		}
		if (this.maxIterations < 1) {
			errors.push("Max iterations must be at least 1");
		}
		if (this.timeout < 1) {
			errors.push("Timeout must be at least 1 second");
		}
		return errors;
	}

	getSummary() {
		const cond = this.condition ? this.condition.slice(0, 40) : "no condition";
		const timeout = this.timeout !== 300 ? ` ${this.timeout}s` : "";
		return `Until ${cond} (max ${this.maxIterations}${timeout})`.slice(0, 120);
	}
}
