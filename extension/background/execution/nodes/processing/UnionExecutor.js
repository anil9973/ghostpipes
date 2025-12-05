import { UnionConfig, UnionStrategy } from "../../../../pipelines/models/configs/processing/UnionConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class UnionExecutor extends BaseExecutor {
	/** @param {*} inputs - @param {UnionConfig} config - @param {ExecutionContext} context */
	async execute(inputs, config, context) {
		if (!Array.isArray(inputs)) return inputs;

		const { strategy, deduplicateField } = config;
		let result = inputs.flatMap((input) => this.ensureArray(input.data));

		if (strategy === UnionStrategy.UNIQUE && deduplicateField) {
			const seen = new Set();
			result = result.filter((item) => {
				const key = this.getFieldValue(item, deduplicateField);
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
		}

		return result;
	}
}
