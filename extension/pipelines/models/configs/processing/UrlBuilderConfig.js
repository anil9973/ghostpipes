/**
 * @fileoverview URL builder node configuration
 * @module pipelines/models/configs/processing/UrlBuilderConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/**
 * Helper class for query parameters
 * Represents a key-value pair for URL query strings
 */
export class QueryParam {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.key] - Query parameter key
	 * @param {string} [init.value] - Query parameter value
	 */
	constructor(init = {}) {
		/** @type {string} Query parameter key */
		this.key = init.key || "";

		/** @type {string} Query parameter value */
		this.value = init.value || "";
	}
}

/**
 * Configuration for URL builder node
 * Constructs URLs from base URL, path segments, and query parameters
 */
export class UrlBuilderConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.baseUrl] - Base URL (e.g., https://api.example.com)
	 * @param {Array<string>} [init.pathSegments] - Path segments to append
	 * @param {Array<Object>} [init.queryParams] - Query parameters
	 */
	constructor(init = {}) {
		super();
		/** @type {string} Base URL (e.g. https://api.example.com) */
		this.baseUrl = init.baseUrl || "";

		/** @type {string[]} Path segments to append */
		this.pathSegments = init.pathSegments || [];

		/** @type {QueryParam[]} Query parameters list */
		this.queryParams = (init.queryParams || []).map((q) => new QueryParam(q));
	}

	getSchema() {
		return {
			baseUrl: {
				type: "string",
				required: true,
				format: "url",
			},
			pathSegments: {
				type: "array",
				required: false,
			},
			queryParams: {
				type: "array",
				required: false,
			},
		};
	}

	validate() {
		const errors = super.validate();
		if (!this.baseUrl) {
			errors.push("Base URL is required");
		} else {
			try {
				new URL(this.baseUrl);
			} catch {
				errors.push("Base URL must be a valid URL");
			}
		}
		return errors;
	}

	getSummary() {
		if (!this.baseUrl) return "No base URL";
		const url = new URL(this.baseUrl).hostname;
		const paths =
			this.pathSegments.length > 0
				? `/${this.pathSegments.length} path${this.pathSegments.length !== 1 ? "s" : ""}`
				: "";
		const params =
			this.queryParams.length > 0
				? ` +${this.queryParams.length} param${this.queryParams.length !== 1 ? "s" : ""}`
				: "";
		return `${url}${paths}${params}`.slice(0, 120);
	}
}
