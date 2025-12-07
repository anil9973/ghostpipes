/**
 * @fileoverview Parse node configuration for data format parsing
 * @module pipelines/models/configs/processing/ParseConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Parse format types */
export const ParseFormat = {
	JSON: "json",
	CSV: "csv",
	HTML: "html",
	XML: "xml",
	YAML: "yaml",
};

/** @enum {string} Validation failure actions */
export const ValidationFailureAction = {
	SKIP: "skip",
	FAIL: "fail",
	TAG: "tag",
};

/** Parse configuration for parsing various data formats */
export class ParseConfig extends BaseConfig {
	/** @param {Object} init - Initial configuration */
	constructor(init = {}) {
		super();
		/** @type {string} Input field containing data to parse */
		this.inputField = init.inputField || "raw_data";
		/** @type {string} Format to parse */
		this.format = init.format || ParseFormat.JSON;
		/** @type {string} Action on parse error */
		this.onError = init.onError || ValidationFailureAction.SKIP;
		/** @type {string} JSONPath expression for JSON parsing */
		this.jsonPath = init.jsonPath || "";
		/** @type {string} CSV delimiter character */
		this.csvDelimiter = init.csvDelimiter || ",";
		/** @type {boolean} CSV has header row */
		this.csvHasHeaders = init.csvHasHeaders ?? true;
		/** @type {Object} HTML selector mappings */
		this.htmlSelectors = init.htmlSelectors || {};
		/** @type {boolean} Flatten nested structures */
		this.flatten = init.flatten ?? true;
	}

	/** @returns {Object} Schema definition for validation */
	getSchema() {
		return {
			inputField: {
				type: "string",
				required: true,
			},
			format: {
				type: "string",
				required: true,
				enum: Object.values(ParseFormat),
			},
			onError: {
				type: "string",
				required: false,
				enum: Object.values(ValidationFailureAction),
			},
			jsonPath: {
				type: "string",
				required: false,
			},
			csvDelimiter: {
				type: "string",
				required: false,
			},
			csvHasHeaders: {
				type: "boolean",
				required: false,
			},
			htmlSelectors: {
				type: "object",
				required: false,
			},
			flatten: {
				type: "boolean",
				required: false,
			},
		};
	}

	validate() {
		const errors = super.validate();
		if (!this.inputField) {
			errors.push("Input field is required");
		}
		if (this.format === ParseFormat.CSV && this.csvDelimiter.length !== 1) {
			errors.push("CSV delimiter must be a single character");
		}
		if (this.format === ParseFormat.HTML && Object.keys(this.htmlSelectors).length === 0) {
			errors.push("At least one HTML selector is required");
		}
		return errors;
	}

	/** @returns {string} Human-readable summary */
	getSummary() {
		const format = this.format.toUpperCase();
		const field = this.inputField !== "raw_data" ? ` from ${this.inputField}` : "";
		const path = this.jsonPath ? ` → ${this.jsonPath}` : "";
		return `Parse ${format}${field}${path}`.slice(0, 120);
	}
}
