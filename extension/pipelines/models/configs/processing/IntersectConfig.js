/**
 * @fileoverview Intersect node configuration
 * @module pipelines/models/configs/processing/IntersectConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Intersect comparison methods */
export const IntersectCompareBy = {
	FIELD: "field",
	FULL: "full",
};

/** @enum {string} Intersect output source */
export const IntersectOutputFrom = {
	FIRST: "first", // Output elements from first input
	SECOND: "second", // Output elements from second input
	BOTH: "both", // Merge objects from both sides
};

/**
 * Configuration for intersect node
 * Finds common elements between two data streams
 */
export class IntersectConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.compareBy] - Comparison method (field, full)
	 * @param {string} [init.outputFrom] - Which input to output from (first, second)
	 * @param {string} [init.field] - Field to compare when using field comparison
	 * @param {boolean} [init.ignoreCase] - Whether to ignore case in comparisons
	 */
	constructor(init = {}) {
		super();
		/** @type {IntersectCompareBy} How equality is determined */
		this.compareBy = init.compareBy || IntersectCompareBy.FIELD;

		/** @type {IntersectOutputFrom} Which side determines output structure */
		this.outputFrom = init.outputFrom || IntersectOutputFrom.FIRST;

		/** @type {string} Field name for FIELD-based comparisons */
		this.field = init.field || "";

		/** @type {boolean} Case-insensitive string comparison */
		this.ignoreCase = init.ignoreCase ?? true;
	}

	getSchema() {
		return {
			compareBy: {
				type: "string",
				required: true,
				enum: Object.values(IntersectCompareBy),
			},
			outputFrom: {
				type: "string",
				required: false,
				enum: ["first", "second"],
			},
			field: {
				type: "string",
				required: false,
				validator: (value) => {
					if (this.compareBy === IntersectCompareBy.FIELD && !value) return false;
					return true;
				},
			},
			ignoreCase: {
				type: "boolean",
				required: false,
			},
		};
	}

	getSummary() {
		return "Intersect Data";
	}
}
