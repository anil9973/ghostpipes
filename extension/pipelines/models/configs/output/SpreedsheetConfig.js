/**
 * @fileoverview Google Sheets export node configuration
 * @module pipelines/models/configs/output/SpreedsheetConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Sheet write operations */
export const SheetOperation = Object.freeze({
	APPEND: "append",
	REPLACE: "replace",
});

/** Configuration for Google Sheets export node */
export class SpreedsheetConfig extends BaseConfig {
	/**
	 * @param {Object} init
	 * @param {string} [init.spreadsheetId] - Google Sheets spreadsheet ID
	 * @param {string} [init.spreadsheetName] - Spreadsheet name for display
	 * @param {string} [init.sheetName] - Sheet/tab name
	 * @param {SheetOperation} [init.operation] - Write operation (append/replace)
	 * @param {boolean} [init.includeHeaders] - Include column headers
	 */
	constructor(init = {}) {
		super();
		/** @type {string} Google Sheets spreadsheet ID */
		this.spreadsheetId = init.spreadsheetId || "";
		/** @type {string} Spreadsheet name for display */
		this.spreadsheetName = init.spreadsheetName || "";
		/** @type {string} Sheet/tab name */
		this.sheetName = init.sheetName || "Sheet1";
		/** @type {SheetOperation} Write operation */
		this.operation = init.operation || SheetOperation.APPEND;
		/** @type {boolean} Include column headers */
		this.includeHeaders = init.includeHeaders ?? true;
	}

	getSchema() {
		return {
			spreadsheetId: {
				type: "string",
				required: false,
			},
			sheetName: {
				type: "string",
				required: true,
				minLength: 1,
			},
			operation: {
				type: "string",
				required: true,
				enum: Object.values(SheetOperation),
			},
		};
	}

	validate() {
		const errors = super.validate();
		if (!this.sheetName) errors.push("Sheet name is required");
		return errors;
	}

	getSummary() {
		const location = this.spreadsheetName || "New Spreadsheet";
		const op = this.operation === SheetOperation.APPEND ? "Append to" : "Replace";
		return `${op} ${location} > ${this.sheetName}`.slice(0, 120);
	}
}
