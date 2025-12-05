import { WebhookConfig } from "../../../../pipelines/models/configs/input/WebhookConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class WebhookExecutor extends BaseExecutor {
	/** @param {*} input - @param {WebhookConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		// Webhook data comes from trigger
		return context.metadata.trigger.data || input;
	}
}
