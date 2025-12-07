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

	validate() {
		const errors = super.validate();
		if (this.rules.length === 0) {
			errors.push("At least one condition rule is required");
		}
		this.rules.forEach((rule, i) => {
			if (!rule.field) errors.push(`Rule ${i + 1}: field is required`);
			if (!rule.operator) errors.push(`Rule ${i + 1}: operator is required`);
		});
		return errors;
	}

	/** @returns {string} Human-readable summary */
	getSummary() {
		const count = this.rules.filter((r) => r.field).length;
		if (count === 0) return "No conditions set";
		const first = this.rules.find((r) => r.field);
		const preview = first ? `${first.field} ${first.operator} ${first.value}` : "";
		const more = count > 1 ? ` +${count - 1}` : "";
		return `If ${preview}${more} (${this.logic})`.slice(0, 120);
	}
}
