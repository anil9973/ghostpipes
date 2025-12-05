/**
 * @fileoverview Join node configuration for joining data streams
 * @module pipelines/models/configs/processing/JoinConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Join types */
export const JoinType = {
	INNER: "inner",
	LEFT: "left",
	RIGHT: "right",
	OUTER: "outer",
};

/** Join configuration for combining data from multiple sources */
export class JoinConfig extends BaseConfig {
	/** @param {Object} init - Initial configuration */
	constructor(init = {}) {
		super();
		/** @type {string} Type of join operation */
		this.type = init.type || JoinType.INNER;
		/** @type {string} Key field from left input */
		this.leftKey = init.leftKey || "";
		/** @type {string} Key field from right input */
		this.rightKey = init.rightKey || "";
		/** @type {string} How to handle duplicate matches */
		this.duplicateHandling = init.duplicateHandling || "all";
	}

	/** @returns {Object} Schema definition for validation */
	getSchema() {
		return {
			type: {
				type: "string",
				required: true,
				enum: Object.values(JoinType),
			},
			leftKey: {
				type: "string",
				required: true,
				minLength: 1,
			},
			rightKey: {
				type: "string",
				required: true,
				minLength: 1,
			},
			duplicateHandling: {
				type: "string",
				required: false,
				enum: ["all", "first", "last"],
			},
		};
	}

	/** @returns {string} Human-readable summary */
	getSummary() {
		return this.leftKey && this.rightKey
			? `${this.type.toUpperCase()} on ${this.leftKey} = ${this.rightKey}`
			: "Join keys not set";
	}
}
