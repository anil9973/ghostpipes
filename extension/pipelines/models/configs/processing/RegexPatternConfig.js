/**
 * @fileoverview Regex pattern node configuration
 * @module pipelines/models/configs/processing/RegexPatternConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/**
 * Regex pattern helper class
 * Defines a single regex pattern operation
 */
export class RegexPattern {
	/**
	 * @param {Object} init - Initial data
	 * @param {string} [init.field] - Field to apply pattern to
	 * @param {string} [init.pattern] - Regex pattern
	 * @param {Object} [init.flags]
	 * @param {string} [init.replacement] - Replacement string
	 * @param {boolean} [init.extract] - Extract matches instead of replace
	 * @param {boolean} [init.enabled]
	 */
	constructor(init = {}) {
		this.field = init.field || "";
		this.pattern = init.pattern || "";
		this.replacement = init.replacement || "";
		this.extract = init.extract ?? false;
		this.enabled = init.enabled ?? true;
		this.flags = {
			g: init.flags?.g ?? true,
			m: init.flags?.m ?? false,
			s: init.flags?.s ?? false,
			i: init.flags?.i ?? false,
			u: init.flags?.u ?? false,
			y: init.flags?.y ?? false,
		};
	}

	getFlagString() {
		return Object.entries(this.flags)
			.filter(([, v]) => v)
			.map(([k]) => k)
			.join("");
	}

	toRegex() {
		return new RegExp(this.pattern, this.getFlagString());
	}
}

/**
 * Configuration for regex pattern node
 * Applies regex patterns to extract or replace text
 */
export class RegexPatternConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {Array<RegexPattern>} [init.patterns] - Regex patterns to apply
	 */
	constructor(init = {}) {
		super();
		/** @type {RegexPattern[]} */
		this.patterns = (init.patterns || []).map((p) => new RegexPattern(p));
	}

	getSchema() {
		return {
			patterns: {
				type: "array",
				required: true,
				minLength: 1,
			},
		};
	}

	getSummary() {
		const count = this.patterns.filter((p) => p.field).length;
		return `${count} regex pattern${count !== 1 ? "s" : ""}`;
	}
}
