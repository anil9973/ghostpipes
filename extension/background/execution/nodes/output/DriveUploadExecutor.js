/**
 * @fileoverview Google Drive upload executor
 * Sends data to backend which handles OAuth and uploads to Google Drive
 */

import { DriveUploadConfig } from "../../../../pipelines/models/configs/output/DriveUploadConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";
import { SERVER_URL } from "../../../../pipelines/js/constant.js";

export class DriveUploadExecutor extends BaseExecutor {
	/** @param {*} input - @param {DriveUploadConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { folderId, folderPath, filename, format } = config;

		// Format data according to specified format
		const formattedData = this.formatData(input, format);

		// Get auth token
		const token = await this.getAuthToken();
		if (!token) throw new Error("Authentication required. Please log in.");

		// Send to backend
		const response = await fetch(`${SERVER_URL}/drive/upload`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				folderId,
				folderPath,
				filename,
				format,
				data: formattedData,
			}),
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: "Upload failed" }));
			throw new Error(error.message || `Upload failed with status ${response.status}`);
		}

		const result = await response.json();
		return {
			success: true,
			fileId: result.fileId,
			fileUrl: result.fileUrl,
			filename: result.filename,
		};
	}

	formatData(data, format) {
		switch (format) {
			case "application/json":
				return JSON.stringify(data, null, 2);
			case "text/csv":
				return this.convertToCSV(data);
			case "application/xml":
				return this.convertToXML(data);
			case "text/plain":
				return typeof data === "string" ? data : JSON.stringify(data);
			default:
				return JSON.stringify(data, null, 2);
		}
	}

	convertToCSV(data) {
		if (!Array.isArray(data)) data = [data];
		if (data.length === 0) return "";

		const headers = Object.keys(data[0]);
		const rows = data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(","));

		return [headers.join(","), ...rows].join("\n");
	}

	convertToXML(data) {
		const toXML = (obj, indent = 0) => {
			const spaces = "  ".repeat(indent);
			let xml = "";

			for (const [key, value] of Object.entries(obj)) {
				if (typeof value === "object" && value !== null) {
					xml += `${spaces}<${key}>\n${toXML(value, indent + 1)}${spaces}</${key}>\n`;
				} else {
					xml += `${spaces}<${key}>${value}</${key}>\n`;
				}
			}

			return xml;
		};

		return `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${toXML(data, 1)}</root>`;
	}

	async getAuthToken() {
		const { authToken } = await chrome.storage.local.get("authToken");
		return authToken;
	}
}
