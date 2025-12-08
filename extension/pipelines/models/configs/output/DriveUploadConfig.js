/**
 * @fileoverview Google Drive upload node configuration
 * @module pipelines/models/configs/output/DriveUploadConfig
 */

import { BaseConfig } from "../../BaseConfig.js";
import { FormatOutput } from "../processing/FormatConfig.js";

/** Configuration for Google Drive upload node */
export class DriveUploadConfig extends BaseConfig {
	/**
	 * @param {Object} init
	 * @param {string} [init.folderId] - Google Drive folder ID
	 * @param {string} [init.folderPath] - Folder path for display
	 * @param {string} [init.filename] - Base filename
	 * @param {FormatOutput} [init.format] - Output format
	 */
	constructor(init = {}) {
		super();
		/** @type {string} Google Drive folder ID (empty = root) */
		this.folderId = init.folderId || "";
		/** @type {string} Folder path for display */
		this.folderPath = init.folderPath || "My Drive";
		/** @type {string} Base filename */
		this.filename = init.filename || "data";
		/** @type {FormatOutput} Output format */
		this.format = init.format || FormatOutput.JSON;
	}

	getExtension() {
		const extMap = {
			[FormatOutput.JSON]: ".json",
			[FormatOutput.CSV]: ".csv",
			[FormatOutput.XML]: ".xml",
			[FormatOutput.TEXT]: ".txt",
		};
		return extMap[this.format] || ".json";
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
				required: true,
				enum: Object.values(FormatOutput),
			},
		};
	}

	validate() {
		const errors = super.validate();
		if (!this.filename) errors.push("Filename is required");
		return errors;
	}

	getSummary() {
		const ext = this.getExtension();
		const location = this.folderPath || "My Drive";
		return `Upload to Drive: ${location}/${this.filename}${ext}`.slice(0, 120);
	}
}
