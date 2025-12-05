/**
 * @fileoverview Validate node configuration
 * @module pipelines/models/configs/processing/ValidateConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Validation failure action types */
export const ValidationFailureAction = {
	SKIP: "skip",
	FAIL: "fail",
	MARK: "mark",
	SEPARATE: "separate",
};

/**
 * Validation rule helper class
 * Defines a single validation rule for a field
 */
export class ValidationRule {
	/**
	 * @param {Object} init - Initial data
	 * @param {string} [init.field] - Field to validate
	 * @param {boolean} [init.required] - Whether field is required
	 * @param {string} [init.type] - Expected type (string, number, boolean, etc.)
	 * @param {string} [init.pattern] - Regex pattern for validation
	 * @param {number} [init.min] - Minimum value (for numbers) or length (for strings)
	 * @param {number} [init.max] - Maximum value (for numbers) or length (for strings)
	 * @param {boolean} [init.enabled] - Maximum value (for numbers) or length (for strings)
	 */
	constructor(init = {}) {
		/** @type {string} Field to validate */
		this.field = init.field || "";

		/** @type {boolean} Whether field is required */
		this.required = init.required ?? false;

		/** @type {string} Expected type: string, number, boolean, etc. */
		this.type = init.type || "";

		/** @type {string} Regex pattern for validation */
		this.pattern = init.pattern || "";

		/** @type {number|undefined} Minimum value or length */
		this.min = init.min;

		/** @type {number|undefined} Maximum value or length */
		this.max = init.max;

		/** @type {boolean} Whether this rule is active */
		this.enabled = init.enabled ?? true;
	}
}

/**
 * Configuration for validate node
 * Validates data against defined rules
 */
export class ValidateConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.onFailure] - Action on validation failure (skip, fail, tag)
	 * @param {Array<ValidationRule>} [init.rules] - Validation rules
	 */
	constructor(init = {}) {
		super();
		/** @type {ValidationFailureAction} Action on validation failure */
		this.onFailure = init.onFailure || ValidationFailureAction.SKIP;

		/** @type {ValidationRule[]} Array of configured validation rules */
		this.rules = (init.rules || []).map((r) => new ValidationRule(r));
	}

	getSchema() {
		return {
			onFailure: {
				type: "string",
				required: true,
				enum: Object.values(ValidationFailureAction),
			},
			rules: {
				type: "array",
				required: true,
				minLength: 1,
			},
		};
	}

	getSummary() {
		const count = this.rules.filter((r) => r.field).length;
		return `${count} validation${count !== 1 ? "s" : ""} (${this.onFailure} invalid)`;
	}
}
