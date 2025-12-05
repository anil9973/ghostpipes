import { StringBuilderConfig } from "../../../../pipelines/models/configs/processing/StringBuilderConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class StringBuilderExecutor extends BaseExecutor {
	/** @param {*} input - @param {StringBuilderConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { parts } = config;
		return parts.map((p) => (p.type === "text" ? p.value : this.getFieldValue(input, p.value) || "")).join("");
	}
}
