/**
 * @fileoverview Lookup node configuration
 * @module pipelines/models/configs/processing/LookupConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Lookup data sources */
export const LookupSource = {
	API: "api",
	CACHE: "cache",
	STORAGE: "storage",
};

/**
 * Configuration for lookup node
 * Enriches data by looking up additional information from external sources
 */
export class LookupConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.source] - Lookup source (api, cache, storage)
	 * @param {string} [init.requestUrl] - API request URL
	 * @param {string} [init.requestMethod] - HTTP method for API requests
	 * @param {string} [init.extractPath] - JSON path to extract from response
	 * @param {boolean} [init.cacheResults] - Whether to cache lookup results
	 * @param {number} [init.cacheTTL] - Cache time-to-live in milliseconds
	 */
	constructor(init = {}) {
		super();
		/** @type {LookupSource} Lookup data source */
		this.source = init.source || LookupSource.API;

		/** @type {string} API endpoint URL */
		this.requestUrl = init.requestUrl || "";

		/** @type {string} HTTP request method (GET, POST, etc.) */
		this.requestMethod = init.requestMethod || "GET";

		/** @type {string} JSONPath to extract from API response */
		this.extractPath = init.extractPath || "";

		/** @type {boolean} Whether lookup results should be cached */
		this.cacheResults = init.cacheResults ?? true;

		/** @type {number} Cache Time-To-Live in milliseconds */
		this.cacheTTL = init.cacheTTL || 300000;
	}

	getSchema() {
		return {
			source: {
				type: "string",
				required: true,
				enum: Object.values(LookupSource),
			},
			requestUrl: {
				type: "string",
				required: false,
				validator: (value) => {
					if (this.source === LookupSource.API && !value) return false;
					return true;
				},
			},
			requestMethod: {
				type: "string",
				required: false,
			},
			extractPath: {
				type: "string",
				required: false,
			},
			cacheResults: {
				type: "boolean",
				required: false,
			},
			cacheTTL: {
				type: "number",
				required: false,
				min: 0,
			},
		};
	}

	validate() {
		const errors = super.validate();
		if (this.source === LookupSource.API && !this.requestUrl) {
			errors.push("Request URL is required for API lookup");
		}
		if (this.cacheTTL < 0) {
			errors.push("Cache TTL must be non-negative");
		}
		return errors;
	}

	getSummary() {
		if (this.source === LookupSource.API && this.requestUrl) {
			const url = this.requestUrl.length > 40 ? this.requestUrl.slice(0, 37) + "..." : this.requestUrl;
			return `Lookup ${this.requestMethod} ${url}`.slice(0, 120);
		}
		const cached = this.cacheResults ? " (cached)" : "";
		return `Lookup from ${this.source}${cached}`;
	}
}
