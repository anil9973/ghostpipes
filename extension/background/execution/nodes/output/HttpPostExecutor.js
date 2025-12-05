import { HttpPostConfig } from "../../../../pipelines/models/configs/output/HttpPostConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class HttpPostExecutor extends BaseExecutor {
	/** @param {*} input - @param {HttpPostConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { method, url, headers, contentType, bodyFields, rawBody } = config;

		const finalHeaders = new Headers();
		headers?.forEach((h) => finalHeaders.set(h.key, h.value));
		finalHeaders.set("Content-Type", "application/json");

		let body;
		if (rawBody) body = this.evaluateTemplate(rawBody, input);
		else if (bodyFields && bodyFields.length > 0) {
			const bodyData = {};
			bodyFields.forEach((field) => (bodyData[field.key] = this.getFieldValue(input, field.value)));
			body = JSON.stringify(bodyData);
		} else body = JSON.stringify(input);

		const response = await fetch(url, { method, headers: finalHeaders, body });

		if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		return await response.json();
	}
}
