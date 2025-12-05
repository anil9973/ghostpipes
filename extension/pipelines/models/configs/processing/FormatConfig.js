/**
 * @fileoverview Format node configuration
 * @module pipelines/models/configs/processing/FormatConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Output format types with proper MIME */
export const FormatOutput = {
	JSON: "application/json",
	CSV: "text/csv",
	XML: "application/xml",
	TEXT: "text/plain",
	HTML: "text/html",
	MARKDOWN: "text/markdown",
	XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	PDF: "application/pdf",
	CUSTOM: "custom",
};

/**
 * Configuration for format node
 * Formats data into various output formats
 */
export class FormatConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.format] - Output format (json, csv, xml, text, custom)
	 * @param {boolean} [init.csvIncludeHeaders] - Include headers in CSV output
	 * @param {string} [init.csvDelimiter] - CSV delimiter character
	 * @param {string} [init.csvQuote] - CSV quote character
	 * @param {boolean} [init.jsonPretty] - Pretty print JSON
	 * @param {string} [init.template] - Custom template string
	 * @param {string} [init.fieldOrder] - Order of fields in output
	 */
	constructor(init = {}) {
		super();
		/** @type {FormatOutput} Selected export format */
		this.format = init.format || FormatOutput.CSV;

		/** @type {boolean} Whether to include header row in CSV */
		this.csvIncludeHeaders = init.csvIncludeHeaders ?? true;

		/** @type {string} CSV delimiter character */
		this.csvDelimiter = init.csvDelimiter || ",";

		/** @type {string} CSV quote wrapper character */
		this.csvQuote = init.csvQuote || '"';

		/** @type {boolean} Pretty print JSON output */
		this.jsonPretty = init.jsonPretty ?? true;

		/** @type {string} Template string for custom formatting */
		this.template = init.template || "";

		/** @type {string} Explicit field ordering control */
		this.fieldOrder = init.fieldOrder || "";
	}

	getSchema() {
		return {
			format: {
				type: "string",
				required: true,
				enum: Object.values(FormatOutput),
			},
			csvIncludeHeaders: {
				type: "boolean",
				required: false,
			},
			csvDelimiter: {
				type: "string",
				required: false,
			},
			csvQuote: {
				type: "string",
				required: false,
			},
			jsonPretty: {
				type: "boolean",
				required: false,
			},
			template: {
				type: "string",
				required: false,
			},
			fieldOrder: {
				type: "string",
				required: false,
			},
		};
	}

	getSummary() {
		return `Format as ${this.format.toUpperCase()}`;
	}
}
