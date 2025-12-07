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
		/** @type {string} */
		this.field = init.field || "";

		/** @type {string} */
		this.pattern = init.pattern || "";

		/** @type {string} */
		this.replacement = init.replacement || "";

		/** @type {boolean} */
		this.extract = init.extract ?? false;

		/** @type {boolean} */
		this.enabled = init.enabled ?? true;

		/** @type {{ g: boolean, m: boolean, s: boolean, i: boolean, u: boolean, y: boolean }} */
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

	validate() {
		const errors = super.validate();
		if (this.patterns.length === 0) {
			errors.push("At least one regex pattern is required");
		}
		this.patterns.forEach((pattern, i) => {
			if (!pattern.field) errors.push(`Pattern ${i + 1}: field is required`);
			if (!pattern.pattern) errors.push(`Pattern ${i + 1}: pattern is required`);
			// Test if pattern is valid regex
			try {
				new RegExp(pattern.pattern);
			} catch (e) {
				errors.push(`Pattern ${i + 1}: invalid regex - ${e.message}`);
			}
		});
		return errors;
	}

	getSummary() {
		const count = this.patterns.filter((p) => p.field && p.pattern).length;
		if (count === 0) return "No patterns configured";
		const first = this.patterns.find((p) => p.field && p.pattern);
		const action = first?.extract ? "Extract" : "Replace";
		const more = count > 1 ? ` +${count - 1}` : "";
		return `${action} in ${first?.field}${more}`.slice(0, 120);
	}
}
