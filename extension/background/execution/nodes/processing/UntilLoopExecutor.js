import { UntilLoopConfig } from "../../../../pipelines/models/configs/processing/UntilLoopConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class UntilLoopExecutor extends BaseExecutor {
	/** @param {*} input - @param {UntilLoopConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { maxIterations, timeout, onTimeout } = config;

		// For now, return input
		// Actual until loop requires condition checking
		return input;
	}
}
