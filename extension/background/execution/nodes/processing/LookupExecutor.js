import { LookupConfig, LookupSource } from "../../../../pipelines/models/configs/processing/LookupConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class LookupExecutor extends BaseExecutor {
	/** @param {*} input - @param {LookupConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { source, requestUrl, requestMethod, extractPath } = config;
		const items = this.ensureArray(input);

		if (source === LookupSource.API) {
			// Lookup each item via API
			return await Promise.all(
				items.map(async (item) => {
					const url = this.evaluateTemplate(requestUrl, item);
					const response = await fetch(url, { method: requestMethod });
					const data = await response.json();
					const extractedData = extractPath ? this.getFieldValue(data, extractPath) : data;
					return { ...item, _lookupData: extractedData };
				})
			);
		}

		return items;
	}
}
