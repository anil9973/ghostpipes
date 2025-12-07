/**
 * @fileoverview Distinct node configuration
 * @module pipelines/models/configs/processing/DistinctConfig
 */

import { BaseConfig } from "../../BaseConfig.js";
import { DeduplicateScope } from "./DeduplicateConfig.js";

/** @enum {string} Distinct output formats */
export const DistinctOutputFormat = {
	ARRAY: "array",
	OBJECT: "object",
};

/** @enum {string} Sort order */
export const SortOrder = {
	NONE: "none",
	ASC: "asc",
	DESC: "desc",
};

/**
 * Configuration for distinct node
 * Extracts unique values from data
 */
export class DistinctConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.scope] - Comparison scope (field, full)
	 * @param {Array<string>} [init.fields] - Fields to extract distinct values from
	 * @param {string} [init.outputFormat] - Output format (array, object)
	 * @param {string} [init.sort] - Sort order (none, asc, desc)
	 */
	constructor(init = {}) {
		super();
		/** @type {DeduplicateScope} Scope used for comparison */
		this.scope = init.scope || DeduplicateScope.FIELD;

		/** @type {string[]} List of fields when scope=FIELD */
		this.fields = init.fields || [];

		/** @type {DistinctOutputFormat} Output format */
		this.outputFormat = init.outputFormat || DistinctOutputFormat.ARRAY;

		/** @type {SortOrder} Sort order for distinct results */
		this.sort = init.sort || SortOrder.NONE;
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
				validator: (value) => {
					if (this.scope === DeduplicateScope.FIELD && value.length === 0) return false;
					return true;
				},
			},
			outputFormat: {
				type: "string",
				required: false,
				enum: Object.values(DistinctOutputFormat),
			},
			sort: {
				type: "string",
				required: false,
				enum: ["none", "asc", "desc"],
			},
		};
	}

	validate() {
		const errors = super.validate();
		if (this.scope === DeduplicateScope.FIELD && this.fields.length === 0) {
			errors.push("At least one field is required for field scope");
		}
		return errors;
	}

	getSummary() {
		if (this.scope === DeduplicateScope.FIELD && this.fields.length > 0) {
			const fields = this.fields.slice(0, 2).join(", ");
			const more = this.fields.length > 2 ? `...` : "";
			const sorted = this.sort !== SortOrder.NONE ? ` sorted ${this.sort}` : "";
			return `Distinct ${fields}${more}${sorted}`.slice(0, 120);
		}
		return `Distinct values (full match)`;
	}
}
