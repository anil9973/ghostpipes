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
	 * @param {Object} init
	 * @param {string} [init.folder] - nest folder name
	 * @param {string} [init.filename] - Base filename or template
	 * @param {string} [init.prefix] - Filename prefix (e.g., "report_")
	 * @param {string} [init.suffix] - Filename suffix (e.g., "_final")
	 * @param {boolean} [init.includeTimestamp] - Append timestamp
	 * @param {string} [init.timestampFormat] - Timestamp format (iso, unix, custom)
	 * @param {string} [init.replacePattern] - Regex pattern to replace
	 * @param {string} [init.replaceWith] - Replacement string
	 * @param {FormatOutput} [init.format] - Output format
	 */
	constructor(init = {}) {
		super();
		/** @type {string} Output folder */
		this.folder = init.folder || "";
		this.filename = init.filename || "data";
		this.prefix = init.prefix || "";
		this.suffix = init.suffix || "";
		this.includeTimestamp = init.includeTimestamp ?? false;
		this.timestampFormat = init.timestampFormat || "iso"; // iso, unix, yyyymmdd
		this.replacePattern = init.replacePattern || "";
		this.replaceWith = init.replaceWith || "_";
		this.format = init.format || FormatOutput.JSON;
	}

	/** Build final filename with all transformations */
	buildFilename() {
		let name = this.filename;

		// Apply regex replacement
		if (this.replacePattern) {
			const regex = new RegExp(this.replacePattern, "g");
			name = name.replace(regex, this.replaceWith);
		}

		// Add prefix/suffix
		name = `${this.prefix}${name}${this.suffix}`;

		// Add timestamp
		if (this.includeTimestamp) {
			const ts =
				this.timestampFormat === "unix"
					? Date.now()
					: this.timestampFormat === "yyyymmdd"
					? new Date().toISOString().slice(0, 10).replace(/-/g, "")
					: new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
			name = `${name}_${ts}`;
		}

		// Add extension
		const ext = this.getExtension();
		return `${name}${ext}`;
	}

	getExtension() {
		const extMap = {
			[FormatOutput.JSON]: ".json",
			[FormatOutput.CSV]: ".csv",
			[FormatOutput.XML]: ".xml",
			[FormatOutput.TEXT]: ".txt",
			[FormatOutput.HTML]: ".html",
			[FormatOutput.MARKDOWN]: ".md",
			[FormatOutput.XLSX]: ".xlsx",
			[FormatOutput.PDF]: ".pdf",
		};
		return extMap[this.format] || "";
	}

	getSummary() {
		const example = this.buildFilename();
		return `Download as ${example}`.slice(0, 120);
	}
}
