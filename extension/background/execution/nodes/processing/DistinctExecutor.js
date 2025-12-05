import { DeduplicateScope } from "../../../../pipelines/models/configs/processing/DeduplicateConfig.js";
import {
	DistinctConfig,
	DistinctOutputFormat,
	SortOrder,
} from "../../../../pipelines/models/configs/processing/DistinctConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class DistinctExecutor extends BaseExecutor {
	/** @param {*} input - @param {DistinctConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { scope, fields, outputFormat, sort } = config;
		const items = this.ensureArray(input);

		if (scope === DeduplicateScope.FIELD) {
			const seen = new Set();
			const distinct = [];

			items.forEach((item) => {
				fields.forEach((field) => {
					const value = this.getFieldValue(item, field);
					if (!seen.has(value)) {
						seen.add(value);
						distinct.push(value);
					}
				});
			});

			if (sort !== SortOrder.NONE) {
				distinct.sort((a, b) => (sort === SortOrder.ASC ? (a > b ? 1 : -1) : a < b ? 1 : -1));
			}

			return outputFormat === DistinctOutputFormat.ARRAY ? distinct : { distinct };
		}

		// Full object distinct
		const seen = new Set();
		return items.filter((item) => {
			const key = JSON.stringify(item);
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});
	}
}
