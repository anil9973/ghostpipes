/**
 * @fileoverview String builder node configuration
 * @module pipelines/models/configs/processing/StringBuilderConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/**
 * Helper class for string parts
 * Represents a part of the string (text literal or field reference)
 */
export class StringPart {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.type] - Part type (text or field)
	 * @param {string} [init.value] - Part value (literal text or field name)
	 */
	constructor(init = {}) {
		this.type = init.type || "text";
		this.value = init.value || "";
	}
}

/**
 * Configuration for string builder node
 * Builds strings from text literals and field values
 */
export class StringBuilderConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {Array<Object>} [init.parts] - Array of string parts
	 */
	constructor(init = {}) {
		super();
		this.parts = (init.parts || []).map((p) => new StringPart(p));
	}

	getSchema() {
		return {
			parts: { type: "array", required: true, minLength: 1 },
		};
	}

	getSummary() {
		return `Build string (${this.parts.length} parts)`;
	}
}
