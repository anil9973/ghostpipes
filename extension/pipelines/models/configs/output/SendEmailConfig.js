/**
 * @fileoverview Send email node configuration
 * @module pipelines/models/configs/output/SendEmailConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/**
 * Configuration for send email node
 * Sends pipeline results via email
 */
export class SendEmailConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {Array<string>} [init.recipients] - Email recipients
	 * @param {string} [init.subject] - Email subject line
	 * @param {string} [init.body] - Email body content
	 * @param {string} [init.bodyTemplate] - Template for email body
	 */
	constructor(init = {}) {
		super();
		/** @type {string[]} Email addresses to deliver to */
		this.recipients = init.recipients || [];

		/** @type {string} Subject line for the message */
		this.subject = init.subject || "Pipeline Results";

		/** @type {string} Raw email body */
		this.body = init.body || "";

		/** @type {string} Template with variable substitution support */
		this.bodyTemplate = init.bodyTemplate || "";
	}

	getSchema() {
		return {
			recipients: {
				type: "array",
				required: true,
				minLength: 1,
			},
			subject: {
				type: "string",
				required: false,
			},
			body: {
				type: "string",
				required: false,
			},
			bodyTemplate: {
				type: "string",
				required: false,
			},
		};
	}

	getSummary() {
		const count = this.recipients.length;
		return count === 1 ? `Email to ${this.recipients[0]}` : `Email to ${count} recipients`;
	}
}
