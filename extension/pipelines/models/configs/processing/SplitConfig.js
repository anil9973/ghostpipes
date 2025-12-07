/**
 * @fileoverview Split node configuration
 * @module pipelines/models/configs/processing/SplitConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Split method types */
export const SplitMethod = {
	FIELD: "field",
	CONDITION: "condition",
	BATCH: "batch",
	PERCENTAGE: "percentage",
};

/** @enum {string} Split strategy types */
export const SplitStrategy = {
	SEPARATE: "separate",
	ARRAY: "array",
	OBJECT: "object",
};

/**
 * Configuration for split node
 * Splits data into groups based on field values or chunk size
 */
export class SplitConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.method] - Split method (field, count, size)
	 * @param {string} [init.splitField] - Field to split by (for field method)
	 * @param {string} [init.strategy] - Split strategy (separate, nest)
	 * @param {boolean} [init.includeGroupName] - Include group name in output
	 * @param {number} [init.chunkSize] - Size of chunks (for count/size methods)
	 */
	constructor(init = {}) {
		super();
		/** @type {SplitMethod} Method used to split data */
		this.method = init.method || SplitMethod.FIELD;

		/** @type {string} Field to split by when using FIELD method */
		this.splitField = init.splitField || "";

		/** @type {SplitStrategy} Output grouping style */
		this.strategy = init.strategy || SplitStrategy.SEPARATE;

		/** @type {boolean} Include group key in emitted data */
		this.includeGroupName = init.includeGroupName ?? false;

		/** @type {number} Chunk size for BATCH splitting */
		this.chunkSize = init.chunkSize || 10;
	}

	getSchema() {
		return {
			method: {
				type: "string",
				required: true,
				enum: Object.values(SplitMethod),
			},
			splitField: {
				type: "string",
				required: false,
			},
			strategy: {
				type: "string",
				required: true,
				enum: Object.values(SplitStrategy),
			},
			includeGroupName: {
				type: "boolean",
				required: false,
			},
			chunkSize: {
				type: "number",
				required: false,
				min: 1,
			},
		};
	}

	validate() {
		const errors = super.validate();
		if (this.method === SplitMethod.FIELD && !this.splitField) {
			errors.push("Split field is required for field method");
		}
		if (this.method === SplitMethod.BATCH && this.chunkSize < 1) {
			errors.push("Chunk size must be at least 1");
		}
		return errors;
	}

	getSummary() {
		if (this.method === SplitMethod.FIELD && this.splitField) {
			return `Split by ${this.splitField} (${this.strategy})`.slice(0, 120);
		}
		if (this.method === SplitMethod.BATCH) {
			return `Split into batches of ${this.chunkSize}`;
		}
		return `Split (${this.method}, ${this.strategy})`;
	}
}
