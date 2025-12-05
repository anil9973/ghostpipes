import {
	DeduplicateConfig,
	DeduplicateKeep,
	DeduplicateScope,
} from "../../../../pipelines/models/configs/processing/DeduplicateConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class DeduplicateExecutor extends BaseExecutor {
	/** @param {*} input - @param {DeduplicateConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { scope, fields, keep, ignoreCase } = config;
		const items = this.ensureArray(input);

		if (scope === DeduplicateScope.FULL) {
			// Remove exact duplicates
			const seen = new Set();
			return items.filter((item) => {
				const key = JSON.stringify(item);
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}

		// Deduplicate by field(s)
		const seen = new Map();
		return items.filter((item) => {
			const key = fields
				.map((field) => {
					let value = this.getFieldValue(item, field);
					if (ignoreCase && typeof value === "string") value = value.toLowerCase();

					return value;
				})
				.join("|");

			if (seen.has(key)) return keep !== "first";

			seen.set(key, item);
			return keep === DeduplicateKeep.FIRST;
		});
	}
}
