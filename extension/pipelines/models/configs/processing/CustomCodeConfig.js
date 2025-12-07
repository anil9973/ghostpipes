/**
 * @fileoverview Custom code node configuration
 * @module pipelines/models/configs/processing/CustomCodeConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Custom code execution modes */
export const CustomCodeMode = {
	MAP: "map",
	FILTER: "filter",
	REDUCE: "reduce",
	TRANSFORM: "transform",
};

/**
 * Configuration for custom code node
 * Executes user-provided JavaScript code on data
 */
export class CustomCodeConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.code] - JavaScript code to execute
	 * @param {string} [init.mode] - Execution mode (map, filter, reduce, transform)
	 * @param {boolean} [init.sandbox] - Whether to run code in sandbox
	 * @param {number} [init.timeout] - Execution timeout in milliseconds
	 */
	constructor(init = {}) {
		super();
		/** @type {string} JavaScript source code */
		this.code = init.code || "";

		/** @type {CustomCodeMode} Execution strategy */
		this.mode = init.mode || CustomCodeMode.MAP;

		/** @type {boolean} Restrict access to globals for safety */
		this.sandbox = init.sandbox ?? true;

		/** @type {number} Max runtime allowed for execution */
		this.timeout = init.timeout || 5000;
	}

	getSchema() {
		return {
			code: {
				type: "string",
				required: true,
				minLength: 1,
			},
			mode: {
				type: "string",
				required: true,
				enum: Object.values(CustomCodeMode),
			},
			sandbox: {
				type: "boolean",
				required: false,
			},
			timeout: {
				type: "number",
				required: false,
				min: 0,
			},
		};
	}

	validate() {
		const errors = super.validate();
		if (!this.code || this.code.trim().length === 0) {
			errors.push("Code cannot be empty");
		}
		if (this.timeout < 100) {
			errors.push("Timeout must be at least 100ms");
		}
		if (this.timeout > 60000) {
			errors.push("Timeout cannot exceed 60 seconds");
		}
		return errors;
	}

	getSummary() {
		const preview = this.code ? this.code.slice(0, 40).replace(/\n/g, " ") : "empty";
		return `${this.mode.toUpperCase()}: ${preview}${this.code.length > 40 ? "..." : ""}`.slice(0, 120);
	}
}
