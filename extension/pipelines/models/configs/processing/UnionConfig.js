/**
 * @fileoverview Union node configuration
 * @module pipelines/models/configs/processing/UnionConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Union merge strategies */
export const UnionStrategy = {
	APPEND: "append",
	UNIQUE: "unique",
	INTERSECT: "intersect",
};
/**
 * Configuration for union node
 * Combines multiple data streams into a single output
 */
export class UnionConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.strategy] - Union strategy (append, deduplicate)
	 * @param {string} [init.deduplicateField] - Field to use for deduplication
	 * @param {boolean} [init.preserveOrder] - Whether to preserve input order
	 */
	constructor(init = {}) {
		super();
		/** @type {UnionStrategy} Merge strategy */
		this.strategy = init.strategy || UnionStrategy.APPEND;

		/** @type {string} Field to deduplicate by (applies only in UNIQUE mode) */
		this.deduplicateField = init.deduplicateField || "";

		/** @type {boolean} Whether to preserve the source input ordering */
		this.preserveOrder = init.preserveOrder ?? true;
	}

	getSchema() {
		return {
			strategy: {
				type: "string",
				required: true,
				enum: Object.values(UnionStrategy),
			},
			deduplicateField: {
				type: "string",
				required: false,
			},
			preserveOrder: {
				type: "boolean",
				required: false,
			},
		};
	}

	validate() {
		const errors = super.validate();
		if (this.strategy === UnionStrategy.UNIQUE && !this.deduplicateField) {
			errors.push("Deduplicate field is required for unique strategy");
		}
		return errors;
	}

	getSummary() {
		const strat = this.strategy.toUpperCase();
		const field =
			this.strategy === UnionStrategy.UNIQUE && this.deduplicateField ? ` by ${this.deduplicateField}` : "";
		return `Union (${strat}${field})`.slice(0, 120);
	}
}
