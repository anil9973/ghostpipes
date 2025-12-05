/**
 * @fileoverview Download node configuration
 * @module pipelines/models/configs/output/DownloadConfig
 */

import { BaseConfig } from "../../BaseConfig.js";
import { FormatOutput } from "../processing/FormatConfig.js";

/**
 * Configuration for download node
 * Downloads data as a file to the user's device
 */
export class DownloadConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.filename] - Name of the file to download
	 * @param {string} [init.format] - Output format (json, csv, xml, text, custom)
	 */
	constructor(init = {}) {
		super();
		/** @type {string} Output filename */
		this.filename = init.filename || "data.json";

		/** @type {FormatOutput} File format for serialization */
		this.format = init.format || FormatOutput.JSON;
	}

	getSchema() {
		return {
			filename: {
				type: "string",
				required: true,
				minLength: 1,
			},
			format: {
				type: "string",
				required: false,
				enum: Object.values(FormatOutput),
			},
		};
	}

	getSummary() {
		return `Download ${this.filename}`;
	}
}
