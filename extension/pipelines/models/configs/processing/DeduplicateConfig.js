/**
 * @fileoverview Deduplicate node configuration
 * @module pipelines/models/configs/processing/DeduplicateConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Deduplicate scope types */
export const DeduplicateScope = {
	FIELD: "field",
	FULL: "full",
};

/** @enum {string} Which duplicate instance to keep */
export const DeduplicateKeep = {
	FIRST: "first",
	LAST: "last",
};

/**
 * Configuration for deduplicate node
 * Removes duplicate items based on field values or full object comparison
 */
export class DeduplicateConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.scope] - Deduplicate scope (field, full)
	 * @param {string[]} [init.fields] - Fields to compare for uniqueness
	 * @param {string} [init.keep] - Which duplicate to keep (first, last)
	 * @param {boolean} [init.ignoreCase] - Ignore case when comparing strings
	 */
	constructor(init = {}) {
		super();
		/** @type {DeduplicateScope} Comparison scope */
		this.scope = init.scope || DeduplicateScope.FIELD;

		/** @type {string[]} Fields to compare if scope = FIELD */
		this.fields = init.fields || [];

		/** @type {DeduplicateKeep} Which duplicate to preserve */
		this.keep = init.keep || DeduplicateKeep.FIRST;

		/** @type {boolean} Ignore case when comparing string values */
		this.ignoreCase = init.ignoreCase ?? true;
	}

	getSchema() {
		return {
			scope: {
				type: "string",
				required: true,
				enum: Object.values(DeduplicateScope),
			},
			fields: {
				type: "array",
				required: false,
			},
			keep: {
				type: "string",
				required: true,
				enum: ["first", "last"],
			},
			ignoreCase: {
				type: "boolean",
				required: false,
			},
		};
	}

	validate() {
		const errors = super.validate();
		if (this.scope === DeduplicateScope.FIELD && this.fields.length === 0)
			errors.push("At least one field is required for field scope");
		return errors;
	}

	getSummary() {
		return this.scope === DeduplicateScope.FIELD && this.fields.length > 0
			? `Unique by [${this.fields.join(", ")}]`
			: `Unique by ${this.scope}`;
	}
}
