/**
 * @fileoverview Manual input node configuration
 * @module pipelines/models/configs/input/ManualInputConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Allowed MIME types for manual input */
export const AllowedMimeTypes = {
	TEXT_PLAIN: "text/plain",
	TEXT_CSV: "text/csv",
	APPLICATION_JSON: "application/json",
	TEXT_HTML: "text/html",
	APPLICATION_XML: "application/xml",
};

/** Configuration for manual input node */
export class ManualInputConfig extends BaseConfig {
	/**
	 * @param {Object} [init]
	 * @param {string[]} [init.allowedMimeTypes]
	 * @param {string} [init.data]
	 */
	constructor(init = {}) {
		super();

		/** @type {string[]} Allowed MIME types for file uploads */
		this.allowedMimeTypes = init.allowedMimeTypes || [
			AllowedMimeTypes.TEXT_PLAIN,
			AllowedMimeTypes.TEXT_CSV,
			AllowedMimeTypes.APPLICATION_JSON,
		];

		/** @type {string} Input text or file content */
		this.data = init.data || "";
	}

	/** @returns {Object} Schema definition for validation */
	getSchema() {
		return {
			allowedMimeTypes: {
				type: "array",
				required: true,
				minLength: 1,
			},
			data: {
				type: "string",
				required: false,
			},
		};
	}

	/** @returns {string} Human-readable summary */
	getSummary() {
		return `Manual input (${this.allowedMimeTypes.length} types)`;
	}
}
