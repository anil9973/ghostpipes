/**
 * @fileoverview Sort node configuration
 * @module pipelines/models/configs/processing/SortConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Sort order types */
export const SortOrder = {
	ASC: "asc",
	DESC: "desc",
};

/**
 * Sort criteria helper class
 * Defines a single sort criterion
 */
export class SortCriteria {
	/**
	 * @param {Object} init - Initial data
	 * @param {string} [init.field] - Field to sort by
	 * @param {string} [init.order] - Sort order (asc, desc)
	 * @param {boolean} [init.enabled]
	 */
	constructor(init = {}) {
		this.field = init.field || "";
		this.order = init.order || SortOrder.ASC;
		this.enabled = init.enabled ?? true;
	}
}

/**
 * Configuration for sort node
 * Sorts data based on specified criteria
 */
export class SortConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {Array<SortCriteria>} [init.criteria] - Sort criteria
	 */
	constructor(init = {}) {
		super();
		/** @type {SortCriteria[]} Array of sorting criteria in priority order */
		this.criteria = (init.criteria || []).map((c) => new SortCriteria(c));
	}

	getSchema() {
		return {
			criteria: { type: "array", required: true, minLength: 1 },
		};
	}

	getSummary() {
		if (this.criteria.length === 0) return "No sort criteria";
		const first = this.criteria[0];
		return `Sort by ${first.field} (${first.order})`;
	}
}
