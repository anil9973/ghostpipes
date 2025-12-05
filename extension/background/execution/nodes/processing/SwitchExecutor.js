import { SwitchConfig } from "../../../../pipelines/models/configs/processing/SwitchConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class SwitchExecutor extends BaseExecutor {
	/** @param {*} input - @param {SwitchConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { switchField } = config;
		const value = this.getFieldValue(input, switchField);

		// Add switch value to output
		return { ...input, _switchValue: value };
	}
}
