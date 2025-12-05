import { FileWatchConfig } from "../../../../pipelines/models/configs/input/FileWatchConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class FileWatchExecutor extends BaseExecutor {
	/** @param {*} input - @param {FileWatchConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		// File content comes from trigger
		const content = context.metadata.trigger.data;
		const filename = context.metadata.trigger.filename;

		if (!content) throw new Error("No file content provided");

		return { filename, content, timestamp: Date.now() };
	}
}
