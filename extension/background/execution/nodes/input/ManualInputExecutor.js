import { ManualInputConfig } from "../../../../pipelines/models/configs/input/ManualInputConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class ManualInputExecutor extends BaseExecutor {
	/** @param {*} input - @param {ManualInputConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		// Input comes from trigger data
		const data = context.metadata.trigger.data || config.data;

		if (!data) throw new Error("No input data provided");

		// Parse data if string
		if (typeof data === "string") {
			try {
				return JSON.parse(data);
			} catch {
				return data; // Return as-is if not JSON
			}
		}

		return data;
	}
}
