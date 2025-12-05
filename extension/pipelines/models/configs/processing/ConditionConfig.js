/**
 * @fileoverview Condition node configuration for conditional routing
 * @module pipelines/models/configs/processing/ConditionConfig
 */

import { BaseConfig } from "../../BaseConfig.js";
import { FilterRule } from "./FilterConfig.js";

/** @enum {string} Logic operators for combining rules */
export const LogicOperator = {
	AND: "AND",
	OR: "OR",
};

/** Condition configuration for conditional data routing */
export class ConditionConfig extends BaseConfig {
	/** @param {Object} init - Initial configuration */
	constructor(init = {}) {
		super();
		/** @type {string} Logic operator for combining rules */
		this.logic = init.logic || LogicOperator.AND;
		/** @type {FilterRule[]} Array of condition rules */
		this.rules = (init.rules || []).map((r) => new FilterRule(r));
	}

	/** @returns {Object} Schema definition for validation */
	getSchema() {
		return {
			logic: {
				type: "string",
				required: true,
				enum: Object.values(LogicOperator),
			},
			rules: {
				type: "array",
				required: true,
				minLength: 1,
			},
		};
	}

	/** @returns {string} Human-readable summary */
	getSummary() {
		const count = this.rules.filter((r) => r.field).length;
		return `If ${count} rule${count !== 1 ? "s" : ""} match (${this.logic})`;
	}
}
