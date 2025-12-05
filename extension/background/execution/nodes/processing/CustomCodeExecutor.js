import { CustomCodeConfig } from "../../../../pipelines/models/configs/processing/CustomCodeConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class CustomCodeExecutor extends BaseExecutor {
	/** @param {*} input - @param {CustomCodeConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { code, mode, sandbox } = config;

		if (!sandbox) context.addWarning("custom_code", "Executing custom code without sandbox");

		try {
			const fn = new Function("input", "context", code);
			return fn(input, context);
		} catch (error) {
			throw new Error(`Custom code execution failed: ${error.message}`);
		}
	}
}
