/**
 * @fileoverview Filter node configuration with rule-based filtering
 * @module pipelines/models/configs/processing/FilterConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Filter mode - permit or block matching items */
export const FilterMode = {
	PERMIT: "permit",
	BLOCK: "block",
};

/** @enum {string} Match type - all rules or any rule */
export const MatchType = {
	ALL: "all",
	ANY: "any",
};

/** @enum {string} Comparison operators for filter rules */
export const ComparisonOperator = {
	EQUALS: "==",
	NOT_EQUALS: "!=",
	GREATER_THAN: ">",
	LESS_THAN: "<",
	GREATER_EQUAL: ">=",
	LESS_EQUAL: "<=",
	CONTAINS: "contains",
	MATCHES: "matches",
	STARTS_WITH: "startsWith",
	ENDS_WITH: "endsWith",
};

/** Filter rule helper class */
export class FilterRule {
	/** @param {Object} init - Initial values */
	constructor(init = {}) {
		/** @type {string} Field to evaluate */
		this.field = init.field || "";
		/** @type {string} Comparison operator */
		this.operator = init.operator || ComparisonOperator.EQUALS;
		/** @type {*} Value to compare against */
		this.value = init.value || "";
		this.enabled = init.enabled ?? true;
	}
}

/** Filter configuration for permit/block filtering with rules */
export class FilterConfig extends BaseConfig {
	/** @param {Object} init - Initial configuration */
	constructor(init = {}) {
		super();
		/** @type {string} Filter mode (permit or block) */
		this.mode = init.mode || FilterMode.PERMIT;
		/** @type {string} Match type (all or any) */
		this.matchType = init.matchType || MatchType.ALL;
		/** @type {FilterRule[]} Array of filter rules */
		this.rules = (init.rules || []).map((r) => new FilterRule(r));
	}

	/** @returns {Object} Schema definition for validation */
	getSchema() {
		return {
			mode: {
				type: "string",
				required: true,
				enum: Object.values(FilterMode),
			},
			matchType: {
				type: "string",
				required: true,
				enum: Object.values(MatchType),
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
		const count = this.rules.filter((r) => r.field && r.value).length;
		if (count === 0) return "No rules";
		const logic = this.matchType === MatchType.ALL ? "AND" : "OR";
		return `${this.mode.toUpperCase()} where (${count} rules via ${logic})`;
	}
}
