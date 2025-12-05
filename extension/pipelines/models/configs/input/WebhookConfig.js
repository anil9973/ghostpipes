/**
 * @fileoverview Webhook input node configuration
 * @module pipelines/models/configs/input/WebhookConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} HTTP methods supported by webhook endpoints */
export const WebhookMethod = {
	GET: "GET",
	POST: "POST",
	PUT: "PUT",
	DELETE: "DELETE",
	PATCH: "PATCH",
};

/** Configuration for webhook input node */
export class WebhookConfig extends BaseConfig {
	/**
	 * @param {Object} [init]
	 * @param {string} [init.webhookId]
	 * @param {string} [init.method]
	 * @param {string} [init.secret]
	 */
	constructor(init = {}) {
		super();

		/** @type {string} Unique identifier for the webhook endpoint */
		this.webhookId = init.webhookId || crypto.randomUUID();

		/** @type {string} HTTP method to accept */
		this.method = init.method || WebhookMethod.POST;

		/** @type {string} Optional secret for authentication */
		this.secret = init.secret || "";
	}

	/** @returns {Object} Schema definition for validation */
	getSchema() {
		return {
			webhookId: {
				type: "string",
				required: true,
				minLength: 1,
			},
			method: {
				type: "string",
				required: true,
				enum: Object.values(WebhookMethod),
			},
			secret: {
				type: "string",
				required: false,
			},
		};
	}

	/** @returns {string} Human-readable summary */
	getSummary() {
		return `Webhook ID: ...${this.webhookId.slice(-6)}`;
	}
}
