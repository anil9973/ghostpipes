/**
 * @fileoverview File append node configuration
 * @module pipelines/models/configs/output/FileAppendConfig
 */

import { BaseConfig } from "../../BaseConfig.js";
import { FormatOutput } from "../processing/FormatConfig.js";

/**
 * Configuration for file append node
 * Appends data to a file on the filesystem
 */
export class FileAppendConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.path] - File path to append to
	 * @param {string} [init.fileHandleId] - File path to append to
	 * @param {string} [init.format] - Output format (json, csv, xml, text, custom)
	 * @param {boolean} [init.createIfMissing] - Create file if it doesn't exist
	 * @param {boolean} [init.addHeader] - Add header row for CSV files
	 * @param {string} [init.encoding] - File encoding (utf8, ascii, etc.)
	 */
	constructor(init = {}) {
		super();
		/** @type {string} Target file path or storage key */
		this.path = init.path || "";

		/** @type {string} Target file path or storage key */
		this.fileHandleId = init.fileHandleId;

		/** @type {FormatOutput} Output serialization format */
		this.format = init.format || FormatOutput.CSV;

		/** @type {boolean} Auto-create file if missing */
		this.createIfMissing = init.createIfMissing ?? true;

		/** @type {boolean} Add header row when writing CSV files */
		this.addHeader = init.addHeader ?? true;

		/** @type {string} File encoding type */
		this.encoding = init.encoding || "utf8";
	}

	getSchema() {
		return {
			path: {
				type: "string",
				required: true,
				minLength: 1,
			},
			format: {
				type: "string",
				required: false,
				enum: Object.values(FormatOutput),
			},
			createIfMissing: {
				type: "boolean",
				required: false,
			},
			addHeader: {
				type: "boolean",
				required: false,
			},
			encoding: {
				type: "string",
				required: false,
			},
		};
	}

	validate() {
		const errors = super.validate();
		if (!this.path || this.path.trim().length === 0) {
			errors.push("File path is required");
		}
		return errors;
	}

	getSummary() {
		if (!this.path) return "No file path configured";
		const formatName = Object.keys(FormatOutput).find((k) => FormatOutput[k] === this.format) || "UNKNOWN";
		const create = this.createIfMissing ? " (create)" : "";
		return `Append ${formatName} to ${this.path}${create}`.slice(0, 120);
	}
}
