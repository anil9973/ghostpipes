import {
	AggregateConfig,
	AggregateOperation,
} from "../../../../pipelines/models/configs/processing/AggregateConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class AggregateExecutor extends BaseExecutor {
	/** @param {*} input - @param {AggregateConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { groupByKey, aggregations } = config;
		const items = this.ensureArray(input);

		// Group items
		const groups = groupByKey ? Object.groupBy(items, (item) => JSON.stringify(item)) : new Map([["all", items]]);
		return Array.from(Object.entries(groups)).map(([key, items]) => {
			const result = groupByKey ? JSON.parse(key) : {};

			aggregations.forEach((agg) => {
				const values = items.map((item) => this.getFieldValue(item, agg.field)).filter((v) => v !== undefined);

				const ops = {
					[AggregateOperation.SUM]: () => values.reduce((sum, v) => sum + Number(v), 0),
					[AggregateOperation.AVG]: () => values.reduce((sum, v) => sum + Number(v), 0) / values.length,
					[AggregateOperation.COUNT]: () => values.length,
					[AggregateOperation.MIN]: () => Math.min(...values.map(Number)),
					[AggregateOperation.MAX]: () => Math.max(...values.map(Number)),
					[AggregateOperation.FIRST]: () => values[0],
					[AggregateOperation.LAST]: () => values.at(-1),
				};

				result[agg.alias || `${agg.operation}_${agg.field}`] = (ops[agg.operation] || (() => null))();
			});

			return result;
		});
	}
}
