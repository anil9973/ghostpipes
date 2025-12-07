/**
 * @fileoverview HTTP POST node configuration
 * @module pipelines/models/configs/output/HttpPostConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} HTTP methods */
export const HttpMethod = {
	GET: "GET",
	POST: "POST",
	PUT: "PUT",
	DELETE: "DELETE",
	PATCH: "PATCH",
};

/**
 * Helper class for HTTP headers
 * Represents a key-value pair for HTTP request headers
 */
export class HttpHeader {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.key] - Header key
	 * @param {string} [init.value] - Header value
	 */
	constructor(init = {}) {
		this.key = init.key || "";
		this.value = init.value || "";
	}
}

/** @enum {string} Supported HTTP body content types */
export const HttpContentType = {
	JSON: "application/json",
	FORM_URLENCODED: "application/x-www-form-urlencoded",
	FORM_DATA: "multipart/form-data",
	TEXT: "text/plain",
	XML: "application/xml",
	CSV: "text/csv",
	HTML: "text/html",
	MARKDOWN: "text/markdown",
};

/**
 * Helper class for body fields
 * Represents a key-value pair for request body
 */
export class BodyField {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.key] - Field key
	 * @param {string} [init.value] - Field value
	 */
	constructor(init = {}) {
		this.key = init.key || "";
		this.value = init.value || "";
	}
}

/**
 * Configuration for HTTP POST node
 * Sends data to an HTTP endpoint
 */
export class HttpPostConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.method] - HTTP method (GET, POST, PUT, DELETE, PATCH)
	 * @param {string} [init.url] - Target URL
	 * @param {Array<Object>} [init.headers] - HTTP headers
	 * @param {string} [init.contentType] - Content type (json, form)
	 * @param {Array<Object>} [init.bodyFields] - Body fields for form data
	 * @param {string} [init.rawBody] - Raw body content
	 */
	constructor(init = {}) {
		super();
		/** @type {HttpMethod} HTTP request method */
		this.method = init.method || HttpMethod.POST;

		/** @type {string} Target request URL */
		this.url = init.url || "";

		/** @type {HttpHeader[]} Request headers */
		this.headers = (init.headers || []).map((h) => new HttpHeader(h));

		/** @type {HttpContentType} How the request body is encoded */
		this.contentType = init.contentType || HttpContentType.JSON;

		/** @type {BodyField[]} Structured form fields (only valid for FORM contentType) */
		this.bodyFields = (init.bodyFields || []).map((b) => new BodyField(b));

		/** @type {string} Raw JSON/custom payload for JSON or advanced requests */
		this.rawBody = init.rawBody || "";
	}

	getSchema() {
		return {
			method: {
				type: "string",
				required: false,
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
			contentType: {
				type: "string",
				required: false,
				enum: Object.values(HttpContentType),
			},
			bodyFields: {
				type: "array",
				required: false,
			},
			rawBody: {
				type: "string",
				required: false,
			},
		};
	}

	validate() {
		const errors = super.validate();
		this.url ? URL.canParse(this.url) || errors.push("URL must be valid") : errors.push("URL is required");
		if (this.contentType === HttpContentType.FORM_URLENCODED && this.bodyFields.length === 0)
			errors.push("At least one body field is required for form content type");

		return errors;
	}

	getSummary() {
		if (!this.url) return "No URL configured";
		const url = this.url.length > 50 ? this.url.slice(0, 47) + "..." : this.url;
		const contentType = Object.keys(HttpContentType).find((k) => HttpContentType[k] === this.contentType) || "JSON";
		return `${this.method} ${url} (${contentType})`.slice(0, 120);
	}
}
