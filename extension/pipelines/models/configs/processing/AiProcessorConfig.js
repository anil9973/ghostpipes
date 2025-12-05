/**
 * @fileoverview AI Processor node configuration for AI-powered data processing
 * @module pipelines/models/configs/processing/AiProcessorConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** AI Processor configuration for AI-powered transformations */
export class AiProcessorConfig extends BaseConfig {
	/** @param {Object} init - Initial configuration */
	constructor(init = {}) {
		super();
		/** @type {string} AI prompt template */
		this.prompt = init.prompt || "";
		/** @type {string} Input data format */
		this.inputFormat = init.inputFormat || "json";
		/** @type {string} Output data format */
		this.outputFormat = init.outputFormat || "json";
		/** @type {string} AI model to use */
		this.model = init.model || "gemini-pro";
		/** @type {number} Temperature for AI generation (0-1) */
		this.temperature = init.temperature || 0.7;
		/** @type {number} Maximum tokens to generate */
		this.maxTokens = init.maxTokens || 1000;
	}

	/** @returns {Object} Schema definition for validation */
	getSchema() {
		return {
			prompt: {
				type: "string",
				required: true,
				minLength: 1,
			},
			inputFormat: {
				type: "string",
				required: false,
			},
			outputFormat: {
				type: "string",
				required: false,
			},
			model: {
				type: "string",
				required: false,
			},
			temperature: {
				type: "number",
				required: false,
				min: 0,
				max: 1,
			},
			maxTokens: {
				type: "number",
				required: false,
				min: 1,
			},
		};
	}

	/** @returns {string} Human-readable summary */
	getSummary() {
		return this.prompt ? `AI: ${this.prompt.substring(0, 30)}...` : "AI Processor";
	}
}
