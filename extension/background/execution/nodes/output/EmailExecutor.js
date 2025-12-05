import { SendEmailConfig } from "../../../../pipelines/models/configs/output/SendEmailConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class EmailExecutor extends BaseExecutor {
	/** @param {*} input - @param {SendEmailConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { recipients, subject, bodyTemplate, body } = config;

		const gmailUrl = "https://mail.google.com/mail/u/0/";
		const mailTo = recipients[0];
		const finalSubject = this.evaluateTemplate(subject, input);
		const finalBody = this.evaluateTemplate(bodyTemplate || body, input);
		//prettier-ignore
		const url = `${gmailUrl}?to=${encodeURIComponent(mailTo)}&su=${encodeURIComponent( finalSubject )}&body=${encodeURIComponent(finalBody)}&fs=1&tf=cm`;
		await chrome.tabs.create({ url });

		return {
			sent: true,
			recipients: recipients.length,
		};
	}
}
