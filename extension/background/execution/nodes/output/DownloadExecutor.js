import { DownloadConfig } from "../../../../pipelines/models/configs/output/DownloadConfig.js";
import { FormatOutput } from "../../../../pipelines/models/configs/processing/FormatConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class DownloadExecutor extends BaseExecutor {
	/** @param {*} input - @param {DownloadConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { filename, format } = config;

		const { mimeType, convert } = this.formatters[format] || this.formatters.default;
		const content = convert(input);
		this.download(filename, content, mimeType);

		return {
			downloaded: true,
			filename,
			size: content.length,
		};
	}

	formatters = {
		[FormatOutput.JSON]: {
			mime: "application/json",
			convert: (d) => JSON.stringify(d, null, 2),
		},
		[FormatOutput.CSV]: {
			mime: "text/csv",
			convert: (d) => this.toCSV(d),
		},
		[FormatOutput.TEXT]: {
			mime: "text/plain",
			convert: (d) => String(d),
		},
	};

	toCSV(data) {
		const items = this.ensureArray(data);
		if (items.length === 0) return "";

		const headers = Object.keys(items[0]);
		const lines = [headers.join(",")];

		items.forEach((item) => {
			const values = headers.map((h) => item[h]);
			lines.push(values.join(","));
		});

		return lines.join("\n");
	}

	async download(filename, content, mimeType) {
		const base64 = btoa(new TextEncoder().encode(content).reduce((d, b) => d + String.fromCharCode(b), ""));
		const dataUrl = `data:${mimeType};base64,${base64}`;
		await chrome.downloads.download({ url: dataUrl, filename, saveAs: false });
	}
}
