/**
 * @fileoverview HTTP request node configuration
 * @module pipelines/models/configs/input/HttpRequestConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/**
 * HTTP methods supported by the HTTP request node
 * @enum {string}
 */
export const HttpMethod = {
	GET: "GET",
	POST: "POST",
	PUT: "PUT",
	DELETE: "DELETE",
	PATCH: "PATCH",
};

/**
 * HTTP header key-value pair
 */
export class HttpHeader {
	/**
	 * Create an HTTP header
	 *
	 * @param {Object} [init={}] - Initial values
	 * @param {string} [init.key] - Header name
	 * @param {string} [init.value] - Header value
	 */
	constructor(init = {}) {
		/**
		 * Header name (e.g., "Content-Type", "Authorization")
		 * @type {string}
		 * @default ""
		 */
		this.key = init.key || "";

		/**
		 * Header value
		 * @type {string}
		 * @default ""
		 */
		this.value = init.value || "";
	}
}

/**
 * URL query parameter key-value pair
 */
export class QueryParam {
	/**
	 * Create a query parameter
	 *
	 * @param {Object} [init={}] - Initial values
	 * @param {string} [init.key] - Parameter name
	 * @param {string} [init.value] - Parameter value
	 */
	constructor(init = {}) {
		/**
		 * Query parameter name
		 * @type {string}
		 * @default ""
		 */
		this.key = init.key || "";

		/**
		 * Query parameter value
		 * @type {string}
		 * @default ""
		 */
		this.value = init.value || "";
	}
}

/**
 * Configuration for HTTP request node
 * Fetches data from external HTTP endpoints
 *
 * @extends BaseConfig
 */
export class HttpRequestConfig extends BaseConfig {
	/**
	 * Create an HTTP request configuration
	 *
	 * @param {Object} [init={}] - Initial configuration values
	 * @param {string} [init.method] - HTTP method (GET, POST, etc.)
	 * @param {string} [init.url] - Target URL
	 * @param {Array<Object>} [init.headers] - HTTP headers
	 * @param {Array<Object>} [init.queryParams] - URL query parameters
	 * @param {string} [init.body] - Request body (for POST, PUT, PATCH)
	 * @param {number} [init.timeout] - Request timeout in milliseconds
	 */
	constructor(init = {}) {
		super();

		/** @type {string} HTTP method */
		this.method = init.method || HttpMethod.GET;

		/** @type {string} Target request URL */
		this.url = init.url || "";

		/** @type {HttpHeader[]} List of HTTP headers */
		this.headers = (init.headers || []).map((h) => new HttpHeader(h));

		/** @type {QueryParam[]} Query parameters to append */
		this.queryParams = (init.queryParams || []).map((q) => new QueryParam(q));

		/** @type {string} Raw request body */
		this.body = init.body || "";

		/** @type {number} Request timeout in milliseconds */
		this.timeout = init.timeout || 10000;
	}

	/**
	 * Get the schema definition for validation
	 *
	 * @returns {Object} Schema object with field definitions
	 */
	getSchema() {
		return {
			method: {
				type: "string",
				required: true,
				enum: Object.values(HttpMethod),
			},
			url: {
				type: "string",
				required: true,
				format: "url",
			},
			headers: {
				type: "array",
				required: false,
			},
			queryParams: {
				type: "array",
				required: false,
			},
			body: {
				type: "string",
				required: false,
			},
			timeout: {
				type: "number",
				required: false,
				min: 1000,
				max: 300000,
			},
		};
	}

	/**
	 * Get a human-readable summary of the configuration
	 *
	 * @returns {string} Summary text
	 */
	getSummary() {
		return this.url ? `${this.method} ${this.url}` : "No URL configured";
	}
}
