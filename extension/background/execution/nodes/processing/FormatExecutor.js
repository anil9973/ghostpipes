import { FormatConfig, FormatOutput } from "../../../../pipelines/models/configs/processing/FormatConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class FormatExecutor extends BaseExecutor {
	/** @param {*} input - @param {FormatConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { format, csvIncludeHeaders, csvDelimiter, jsonPretty } = config;

		const formatters = {
			[FormatOutput.CSV]: () => this.toCSV(input, csvIncludeHeaders, csvDelimiter),
			[FormatOutput.JSON]: () => JSON.stringify(input, null, jsonPretty ? 2 : 0),
			[FormatOutput.XML]: () => `<data>${JSON.stringify(input)}</data>`,
		};

		return (formatters[format] || (() => input))();
	}

	toCSV(data, includeHeaders = true, delimiter = ",") {
		const items = this.ensureArray(data);
		if (items.length === 0) return "";

		const headers = Object.keys(items[0]);
		const lines = includeHeaders ? [headers.join(delimiter)] : [];
		items.forEach((item) => {
			const values = headers.map((h) => {
				const val = item[h];
				return typeof val === "string" && val.includes(delimiter) ? `"${val}"` : val;
			});
			lines.push(values.join(delimiter));
		});
		return lines.join("\n");
	}

	toXML(data) {
		return `<data>${JSON.stringify(data)}</data>`;
	}
}
