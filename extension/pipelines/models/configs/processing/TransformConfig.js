/**
 * @fileoverview Transform node configuration for data transformations
 * @module pipelines/models/configs/processing/TransformConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Transform operations */
export const TransformOperation = {
	COPY: "copy",
	TEMPLATE: "template",
	CALCULATE: "calculate",
	CONCAT: "concat",
	SPLIT: "split",
	UPPERCASE: "uppercase",
	LOWERCASE: "lowercase",
	TRIM: "trim",
};

/** Transformation helper class */
export class Transformation {
	/** @param {Object} init - Initial values */
	constructor(init = {}) {
		/** @type {string} Target field name */
		this.targetField = init.targetField || "";
		/** @type {string} Source field name */
		this.sourceField = init.sourceField || "";
		/** @type {string} Operation to perform */
		this.operation = init.operation || TransformOperation.COPY;
		/** @type {Object} Operation-specific options */
		this.options = init.options || {};
	}
}

/** Transform configuration for data field transformations */
export class TransformConfig extends BaseConfig {
	/** @param {Object} init - Initial configuration */
	constructor(init = {}) {
		super();
		/** @type {Transformation[]} Array of transformations to apply */
		this.transformations = (init.transformations || []).map((t) => new Transformation(t));
		/** @type {boolean} Keep original fields */
		this.preserveOriginal = init.preserveOriginal ?? false;
		/** @type {boolean} Skip items on transformation error */
		this.skipOnError = init.skipOnError ?? false;
		/** @type {string} Field name for error messages */
		this.errorField = init.errorField || "_transformError";
	}

	/** @returns {Object} Schema definition for validation */
	getSchema() {
		return {
			transformations: {
				type: "array",
				required: true,
				minLength: 1,
			},
			preserveOriginal: {
				type: "boolean",
				required: false,
			},
			skipOnError: {
				type: "boolean",
				required: false,
			},
			errorField: {
				type: "string",
				required: false,
			},
		};
	}

	/** @returns {string[]} Validation errors */
	validate() {
		const errors = super.validate();
		if (this.transformations.length === 0) {
			errors.push("At least one transformation is required");
		}
		this.transformations.forEach((t, i) => {
			if (!t.targetField) errors.push(`Transformation ${i}: targetField is required`);
			if (!t.sourceField) errors.push(`Transformation ${i}: sourceField is required`);
		});
		return errors;
	}

	/** @returns {string} Human-readable summary */
	getSummary() {
		const count = this.transformations.filter((t) => t.targetField && t.sourceField).length;
		if (count === 0) return "No transformations";
		const first = this.transformations.find((t) => t.targetField && t.sourceField);
		const op = first ? `${first.sourceField} → ${first.targetField}` : "";
		const more = count > 1 ? ` +${count - 1}` : "";
		return `${op}${more}`.slice(0, 120);
	}
}
