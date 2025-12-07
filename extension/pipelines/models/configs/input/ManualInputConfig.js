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

	validate() {
		const errors = super.validate();
		if (this.allowedMimeTypes.length === 0) {
			errors.push("At least one MIME type must be allowed");
		}
		return errors;
	}

	/** @returns {string} Human-readable summary */
	getSummary() {
		const types = this.allowedMimeTypes.length;
		const typeNames = this.allowedMimeTypes.slice(0, 2).map((t) => {
			const name = Object.keys(AllowedMimeTypes).find((k) => AllowedMimeTypes[k] === t);
			return name ? name.split("_")[1] : t.split("/")[1];
		});
		const more = types > 2 ? ` +${types - 2}` : "";
		return `Manual input: ${typeNames.join(", ")}${more}`.slice(0, 120);
	}
}
