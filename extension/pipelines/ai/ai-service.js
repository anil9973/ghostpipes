import { PipeNode } from "../models/PipeNode.js";
import { PromptBuilder } from "./prompt-builder.js";

/** AiService - Handles all AI-related operations */
export class AiService {
	constructor() {
		this.userProfile = {
			experienceLevel: "beginner",
			preferredOutput: "json",
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		};
	}

	/**
	 * Generate pipeline from user intent
	 * @param {Object} context
	 * @param {string} context.userIntent - What user wants to accomplish
	 * @param {string} context.dataSource - URL, file, or text
	 * @param {string} context.dataType - html, json, csv, text
	 * @param {string} [context.additionalContext] - Extra context
	 * @returns {Promise<{nodes:Object[]}>} Generated pipeline
	 */
	async generatePipeline(context) {
		const promptText = PromptBuilder.buildPipelineGenerationPrompt(context);

		try {
			const response = await generateContentOnGeminiServer(promptText);
			const pipeline = extractJSONContent(response);

			// Validate pipeline structure
			if (!pipeline.nodes || !Array.isArray(pipeline.nodes)) {
				throw new Error("Invalid pipeline structure: missing nodes array");
			}

			return pipeline;
		} catch (error) {
			console.error("Pipeline generation failed:", error);
			throw new Error(`Failed to generate pipeline: ${error.message}`);
		}
	}

	/**
	 * Optimize existing pipeline
	 * @param {Object} pipeline - Current pipeline
	 * @param {Object} stats - Execution statistics
	 * @returns {Promise<Object>} Optimization suggestions
	 */
	async optimizePipeline(pipeline, stats) {
		const promptText = `Analyze this pipeline and suggest optimizations:

Pipeline: ${JSON.stringify(pipeline, null, 2)}
Stats: ${JSON.stringify(stats, null, 2)}

Return JSON with optimization suggestions:
{
  "optimizations": [
    {
      "type": "add_cache" | "reorder" | "batch" | "remove_redundant",
      "description": "What to change",
      "impact": "Expected improvement",
      "estimatedSpeedup": "2x faster"
    }
  ],
  "overallAssessment": "General feedback"
}`;

		try {
			const response = await generateContentOnGeminiServer(promptText);
			return extractJSONContent(response);
		} catch (error) {
			console.error("Pipeline optimization failed:", error);
			throw error;
		}
	}

	async processData(prompt, formattedInput) {
		const promptText = prompt + formattedInput;

		try {
			const response = await generateContentOnGeminiServer(promptText);
			return extractJSONContent(response);
		} catch (error) {
			console.error("Pipeline optimization failed:", error);
			throw error;
		}
	}
}

export const aiService = new AiService();

/**
 * Extract JSON content from markdown response
 * @param {string} markText - Response text that may contain markdown
 * @returns {Object} Parsed JSON object
 */
function extractJSONContent(markText) {
	markText = markText.trim();
	if (markText.startsWith("{") && markText.startsWith("}")) return JSON.parse(markText);
	let jsonStartIndex = markText.indexOf("```json");
	if (jsonStartIndex === -1) return markText;

	jsonStartIndex = jsonStartIndex + 7;
	const blockEndIndex = markText.indexOf("```", jsonStartIndex);
	const jsonContent = markText.slice(jsonStartIndex, blockEndIndex);
	return JSON.parse(jsonContent.trim());
}

/**
 * Call Gemini API for content generation
 * @param {string} promptMessage - The prompt to send
 * @returns {Promise<string>} Generated text response
 */
export async function generateContentOnGeminiServer(promptMessage) {
	const headers = new Headers({ "Content-Type": "application/json" });
	const API_KEY = (await getStore("GeminiAPIKey")).GeminiAPIKey ?? "AIzaSyBlu3XiXCkh0PiZdVHnqCQ--tYnKAgk3O4";
	const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
	const payload = {
		contents: [
			{
				parts: [{ text: promptMessage }],
			},
		],
	};

	try {
		const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
		const jsonData = await response.json();
		if (response.ok) {
			return jsonData.candidates[0].content.parts.map((part) => part.text).join("");
		}
	} catch (error) {
		console.error(error);
	}
}
