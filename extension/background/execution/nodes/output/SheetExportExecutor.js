/**
 * @fileoverview Google Sheets export executor
 * Sends data to backend which handles OAuth and writes to Google Sheets
 */

import { SpreedsheetConfig } from "../../../../pipelines/models/configs/output/SpreedsheetConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";
import { SERVER_URL } from "../../../../pipelines/js/constant.js";

export class SheetExportExecutor extends BaseExecutor {
	/** @param {*} input - @param {SpreedsheetConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { spreadsheetId, spreadsheetName, sheetName, operation, includeHeaders } = config;

		// Ensure input is an array
		const data = Array.isArray(input) ? input : [input];

		if (data.length === 0) {
			return { success: true, rowsWritten: 0, message: "No data to export" };
		}

		// Convert data to rows
		const rows = this.convertToRows(data, includeHeaders);

		// Get auth token
		const token = await this.getAuthToken();
		if (!token) throw new Error("Authentication required. Please log in.");

		// Send to backend
		const response = await fetch(`${SERVER_URL}/sheets/export`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				spreadsheetId,
				spreadsheetName,
				sheetName,
				operation,
				rows,
			}),
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: "Export failed" }));
			throw new Error(error.message || `Export failed with status ${response.status}`);
		}

		const result = await response.json();
		return {
			success: true,
			rowsWritten: result.rowsWritten,
			spreadsheetId: result.spreadsheetId,
			spreadsheetUrl: result.spreadsheetUrl,
		};
	}

	convertToRows(data, includeHeaders) {
		if (data.length === 0) return [];

		// Get all unique keys from all objects
		const allKeys = new Set();
		data.forEach((item) => {
			if (typeof item === "object" && item !== null) {
				Object.keys(item).forEach((key) => allKeys.add(key));
			}
		});

		const headers = Array.from(allKeys);
		const rows = [];

		// Add headers if requested
		if (includeHeaders) {
			rows.push(headers);
		}

		// Convert each object to a row
		data.forEach((item) => {
			if (typeof item === "object" && item !== null) {
				const row = headers.map((header) => {
					const value = item[header];
					// Convert to string, handling null/undefined
					if (value === null || value === undefined) return "";
					if (typeof value === "object") return JSON.stringify(value);
					return String(value);
				});
				rows.push(row);
			} else {
				// If item is not an object, add it as a single-column row
				rows.push([String(item)]);
			}
		});

		return rows;
	}

	async getAuthToken() {
		const { authToken } = await chrome.storage.local.get("authToken");
		return authToken;
	}
}
