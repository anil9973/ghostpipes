import { RecommendationLearner } from "./learner.js";
import { InputClassifier } from "./classifier.js";
import { PipelineScorer } from "./scorer.js";
import { PatternMatcher } from "./matcher.js";

/** Main recommendation service */
export class RecommendationService {
	constructor() {
		this.classifier = new InputClassifier();
		this.scorer = new PipelineScorer();
		this.learner = new RecommendationLearner();
	}

	/**
	 * Get recommended pipelines for input
	 * @param {File|string} input
	 * @param {Array} allPipelines
	 * @param {number} maxResults
	 * @returns {Promise<Array>}
	 */
	async recommend(input, allPipelines, maxResults = 5) {
		const classified = this.classifier.classify(input);
		if (classified.type === "unknown") return [];

		const compatible = this.filterCompatible(classified, allPipelines);
		const history = await this.learner.getHistory(classified.type);

		const scored = compatible.map((pipeline) => ({
			pipeline,
			score: this.scorer.score(pipeline, classified, history),
			confidence: this.calculateConfidence(this.scorer.score(pipeline, classified, history)),
			reason: this.generateReason(pipeline, classified),
		}));

		return scored.sort((a, b) => b.score - a.score).slice(0, maxResults);
	}

	/** @private */
	filterCompatible(input, pipelines) {
		return pipelines.filter((pipeline) => {
			const trigger = pipeline.trigger;
			if (!trigger) return false;

			if (input.type === "url") return trigger.type === "http_request";

			if (input.type === "file")
				return (
					(trigger.type === "manual_input" || trigger.type === "file_watch") &&
					trigger.config?.allowedMimeTypes?.includes(input.mimeType)
				);

			if (input.type === "text")
				return trigger.type === "manual_input" && trigger.config?.allowedMimeTypes?.includes("text/plain");

			return false;
		});
	}

	/** @private */
	calculateConfidence(score) {
		const percentage = Math.min(100, (score / 50) * 100);
		if (percentage >= 80) return "high";
		if (percentage >= 60) return "good";
		if (percentage >= 40) return "possible";
		return "low";
	}

	/** @private */
	generateReason(pipeline, input) {
		const reasons = [];

		if (input.type === "url" && pipeline.trigger.config?.url) {
			if (pipeline.trigger.config.url.includes(input.domain)) reasons.push("Domain match for " + input.domain);
		}

		if (input.type === "file") {
			const allowedMimes = pipeline.trigger.config?.allowedMimeTypes || [];
			if (allowedMimes.includes(input.mimeType)) reasons.push("Exact MIME type match (" + input.mimeType + ")");

			if (PatternMatcher.getParserForMime(pipeline, input.mimeType)) reasons.push("Has parser configured");
		}

		if (input.type === "text") {
			if (PatternMatcher.hasPipelineNode(pipeline, "ai_processor"))
				reasons.push("Has AI processor for text analysis");

			if (PatternMatcher.hasPipelineNode(pipeline, "parse")) reasons.push("Has parse node configured");
		}

		return reasons;
	}
}
