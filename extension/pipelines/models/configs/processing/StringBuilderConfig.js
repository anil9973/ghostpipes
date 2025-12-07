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

	validate() {
		const errors = super.validate();
		if (this.parts.length === 0) {
			errors.push("At least one string part is required");
		}
		this.parts.forEach((part, i) => {
			if (!part.type) errors.push(`Part ${i + 1}: type is required`);
			if (!part.value) errors.push(`Part ${i + 1}: value is required`);
		});
		return errors;
	}

	getSummary() {
		if (this.parts.length === 0) return "Empty string";
		const preview = this.parts
			.slice(0, 3)
			.map((p) => (p.type === "text" ? `"${p.value.slice(0, 15)}"` : `{${p.value}}`))
			.join(" + ");
		const more = this.parts.length > 3 ? "..." : "";
		return `${preview}${more}`.slice(0, 120);
	}
}
