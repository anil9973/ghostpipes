/**
 * @fileoverview Switch node configuration
 * @module pipelines/models/configs/processing/SwitchConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/**
 * Configuration for switch node
 * Routes data to different outputs based on field value
 */
export class SwitchConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.switchField] - Field to switch on
	 * @param {Object} [init.cases] - Map of case values to output names
	 * @param {string} [init.defaultCase] - Default output name if no case matches
	 */
	constructor(init = {}) {
		super();
		/** @type {string} Field to inspect for routing */
		this.switchField = init.switchField || "";

		/** @type {Record<string, string>} Case value → output name map */
		this.cases = init.cases || {};

		/** @type {string|null} Output used when no case matches */
		this.defaultCase = init.defaultCase || null;
	}

	getSchema() {
		return {
			switchField: {
				type: "string",
				required: true,
				minLength: 1,
			},
			cases: {
				type: "object",
				required: false,
			},
			defaultCase: {
				type: "string",
				required: false,
			},
		};
	}

	getSummary() {
		return this.switchField ? `Switch on ${this.switchField}` : "No switch field";
	}
}
