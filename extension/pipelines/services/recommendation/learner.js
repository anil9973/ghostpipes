import { UsageHistory } from "../../models/UsageHistory.js";
import { db, Store } from "../../db/db.js";
import { nanoid } from "../../utils/common.js";
import { usagedb } from "../../db/usage-history-db.js";

/** Tracks usage patterns and improves recommendations*/
export class RecommendationLearner {
	constructor() {}

	/**
	 * Record successful pipeline execution
	 * @param {string} pipelineId
	 * @param {import("./classifier.js").InputType} input
	 * @param {number} executionTime
	 */
	async recordSuccess(pipelineId, input, executionTime) {
		const entry = new UsageHistory({
			pipelineId,
			inputType: input.type,
			metadata: this.extractMetadata(input),
			executionTime,
		});

		await db.put(Store.UsageHistory, entry);
	}

	/**
	 * Get recent usage history
	 * @param {string} inputType
	 * @param {number} limit
	 * @returns {Promise<Array>}
	 */
	async getHistory(inputType, limit = 10) {
		const allHistory = await db.getAll(Store.UsageHistory);
		return allHistory
			.map((data) => new UsageHistory(data))
			.filter((h) => h.inputType === inputType)
			.sort((a, b) => b.timestamp - a.timestamp)
			.slice(0, limit);
	}

	/** Cleanup old history (>90 days)  */
	async cleanup() {
		const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
		await usagedb.cleanupUsageHistory(cutoff);
	}

	/** @private */
	extractMetadata(input) {
		if (input.type === "url") {
			return { domain: input.domain, path: input.path };
		}
		if (input.type === "file") {
			return { mimeType: input.mimeType, fileName: input.name };
		}
		if (input.type === "text") {
			return { structure: input.structure, length: input.content.length };
		}
		return {};
	}
}
