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

	validate() {
		const errors = super.validate();
		if (this.recipients.length === 0) {
			errors.push("At least one recipient is required");
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		this.recipients.forEach((email, i) => {
			if (!emailRegex.test(email)) {
				errors.push(`Recipient ${i + 1}: invalid email address`);
			}
		});
		if (!this.subject && !this.body && !this.bodyTemplate) {
			errors.push("Subject, body, or body template is required");
		}
		return errors;
	}

	getSummary() {
		const count = this.recipients.length;
		if (count === 0) return "No recipients";
		const to = count === 1 ? this.recipients[0] : `${count} recipients`;
		const subj = this.subject !== "Pipeline Results" ? `: ${this.subject.slice(0, 30)}` : "";
		return `Email to ${to}${subj}`.slice(0, 120);
	}
}
