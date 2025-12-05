import { SortConfig, SortOrder } from "../../../../pipelines/models/configs/processing/SortConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class SortExecutor extends BaseExecutor {
	/** @param {*} input - @param {SortConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { criteria } = config;
		const items = this.ensureArray(input);

		return items.sort((a, b) => {
			for (const crit of criteria.filter((c) => c.enabled)) {
				const aVal = this.getFieldValue(a, crit.field);
				const bVal = this.getFieldValue(b, crit.field);

				let comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
				if (comparison !== 0) return crit.order === SortOrder.ASC ? comparison : -comparison;
			}
			return 0;
		});
	}
}
