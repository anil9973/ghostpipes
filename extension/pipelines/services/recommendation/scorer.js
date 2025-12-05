import { UrlParser } from "../../utils/url-parser.js";
import { PatternMatcher } from "./matcher.js";
import { MimeTypes } from "../../utils/mime-types.js";

/**
 * Scores pipelines based on input compatibility
 */
export class PipelineScorer {
	/**
	 * Score pipeline relevance
	 * @param {Object} pipeline
	 * @param {InputType} input
	 * @param {Array} history
	 * @returns {number}
	 */
	score(pipeline, input, history) {
		let score = 10; // Base compatibility

		if (input.type === "url") score += this.scoreUrlMatch(pipeline, input);
		if (input.type === "file") score += this.scoreFileMatch(pipeline, input);
		if (input.type === "text") score += this.scoreTextMatch(pipeline, input);

		score += this.applyUsageBoost(score, pipeline, input, history);
		score += this.applyComplexityPenalty(pipeline);

		return Math.min(100, Math.max(0, score));
	}

	/** @private */
	scoreUrlMatch(pipeline, input) {
		let score = 0;
		const trigger = pipeline.trigger;

		if (trigger.type !== "http_request") return 0;

		const triggerUrl = trigger.config?.url || "";
		const triggerDomain = UrlParser.extractDomain(triggerUrl);
		const triggerPath = UrlParser.extractPath(triggerUrl);

		if (triggerDomain === input.domain) score += 10;
		else if (triggerDomain.includes(input.domain) || input.domain.includes(triggerDomain)) score += 5;

		if (triggerPath === input.path) score += 7;

		if (trigger.config?.schedule) score += 3;

		return score;
	}

	/** @private */
	scoreFileMatch(pipeline, input) {
		let score = 0;
		const trigger = pipeline.trigger;

		if (trigger.type !== "manual_input" && trigger.type !== "file_watch") return 0;

		const allowedMimes = trigger.config?.allowedMimeTypes || [];
		const exactMatch = allowedMimes.includes(input.mimeType);

		if (exactMatch) score += 10;
		else {
			const bestMatch = Math.max(...allowedMimes.map((m) => MimeTypes.scoreMimeMatch(m, input.mimeType)));
			score += bestMatch;
		}

		if (PatternMatcher.getParserForMime(pipeline, input.mimeType)) score += 8;
		if (trigger.type === "file_watch") score += 4;

		return score;
	}

	/** @private */
	scoreTextMatch(pipeline, input) {
		let score = 0;
		const trigger = pipeline.trigger;

		if (trigger.type !== "manual_input") return 0;

		const allowedMimes = trigger.config?.allowedMimeTypes || [];
		if (allowedMimes.includes("text/plain")) score += 10;

		if (PatternMatcher.hasPipelineNode(pipeline, "parse")) score += 6;
		if (PatternMatcher.hasPipelineNode(pipeline, "ai_processor")) score += 5;
		if (PatternMatcher.hasPipelineNode(pipeline, "regex")) score += 4;

		return score;
	}

	/** @private */
	applyUsageBoost(baseScore, pipeline, input, history) {
		const recentUses = history.filter((h) => h.pipelineId === pipeline.id && h.inputType === input.type);
		return Math.min(15, recentUses.length * 3);
	}

	/** @private */
	applyComplexityPenalty(pipeline) {
		const nodeCount = pipeline.nodes?.length || 0;
		if (nodeCount <= 5) return 2;
		if (nodeCount > 15) return -3;
		return 0;
	}
}
