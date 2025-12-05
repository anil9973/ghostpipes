import {
	SplitConfig,
	SplitMethod,
	SplitStrategy,
} from "../../../../pipelines/models/configs/processing/SplitConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class SplitExecutor extends BaseExecutor {
	/** @param {*} input - @param {SplitConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { method, splitField, strategy, chunkSize } = config;
		const items = this.ensureArray(input);

		const splitMethods = {
			[SplitMethod.FIELD]: () => {
				const groups = Object.groupBy(items, (item) => this.getFieldValue(item, splitField));
				return strategy === SplitStrategy.SEPARATE
					? Object.entries(groups).map(([key, items]) => ({ group: key, items }))
					: { groups };
			},
			[SplitMethod.BATCH]: () => {
				const chunks = [];
				for (let i = 0; i < items.length; i += chunkSize) {
					chunks.push(items.slice(i, i + chunkSize));
				}
				return chunks;
			},
		};

		return (splitMethods[method] || (() => items))();
	}
}
