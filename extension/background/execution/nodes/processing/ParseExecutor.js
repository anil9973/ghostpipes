import { ParseConfig, ParseFormat } from "../../../../pipelines/models/configs/processing/ParseConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class ParseExecutor extends BaseExecutor {
	/** @param {*} input - @param {ParseConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { inputField, format, onError, jsonPath, flatten } = config;

		// Get raw data
		let data = inputField ? this.getFieldValue(input, inputField) : input;
		if (typeof data !== "string") data = JSON.stringify(data);

		try {
			const parsers = {
				[ParseFormat.JSON]: () => {
					let parsed = JSON.parse(data);
					return jsonPath ? this.getFieldValue(parsed, jsonPath) : parsed;
				},
				[ParseFormat.CSV]: () => this.parseCSV(data, config),
				[ParseFormat.HTML]: () => this.parseHTML(data, config),
				[ParseFormat.XML]: () => ({ xml: data }),
			};

			throw new Error(`Unknown format: ${format}`);
		} catch (error) {
			if (onError === "skip") {
				context.addWarning("parse", `Parse failed: ${error.message}`);
				return null;
			}

			throw error;
		}
	}

	parseCSV(data, config) {
		const lines = data.split("\n").filter((l) => l.trim());
		if (lines.length === 0) return [];

		const delimiter = config.csvDelimiter || ",";
		const headers = lines[0].split(delimiter).map((h) => h.trim());

		return lines.slice(1).map((row) => {
			const values = row.split(delimiter);
			return Object.fromEntries(headers.map((h, i) => [h, values[i]?.trim() || ""]));
		});
	}

	parseHTML(html, config) {
		const { htmlSelectors } = config;
		// TODO: Implement proper HTML parsing with cheerio-like library
		return { content: html.replace(/<[^>]+>/g, "").trim() };
	}
}
