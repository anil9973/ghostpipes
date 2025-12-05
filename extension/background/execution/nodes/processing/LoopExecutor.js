import { LoopConfig } from "../../../../pipelines/models/configs/processing/LoopConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class LoopExecutor extends BaseExecutor {
	/** @param {*} input - @param {LoopConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { loopOver, flatten, outputMode, assignTo } = config;
		const items = this.ensureArray(this.getFieldValue(input, loopOver) || input);

		// For now, return items as-is
		// Actual loop execution would require sub-pipeline support
		return items;
	}
}
