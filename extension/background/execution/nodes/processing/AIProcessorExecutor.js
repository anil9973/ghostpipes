import { aiService } from "../../../../pipelines/ai/ai-service.js";
import { AiProcessorConfig } from "../../../../pipelines/models/configs/processing/AiProcessorConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class AIProcessorExecutor extends BaseExecutor {
	/** @param {*} input - @param {AiProcessorConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { prompt, inputFormat, outputFormat } = config;

		// Format input for AI
		let formattedInput = input;
		if (inputFormat === "json") {
			formattedInput = JSON.stringify(input);
		}

		//TODO
		debugger;
		const response = await aiService.processData(prompt, formattedInput);
		return response;
	}
}
