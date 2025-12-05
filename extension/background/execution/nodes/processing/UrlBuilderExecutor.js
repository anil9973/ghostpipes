import { UrlBuilderConfig } from "../../../../pipelines/models/configs/processing/UrlBuilderConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class UrlBuilderExecutor extends BaseExecutor {
	/** @param {*} input - @param {UrlBuilderConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { baseUrl, pathSegments, queryParams } = config;

		let url = baseUrl;

		// Add path segments
		if (pathSegments && pathSegments.length > 0) {
			const segments = pathSegments.map((seg) => this.evaluateTemplate(seg, input));
			url = url.replace(/\/$/, "") + "/" + segments.join("/");
		}

		// Add query parameters
		if (queryParams && queryParams.length > 0) {
			const params = new URLSearchParams();
			queryParams.forEach((param) => {
				const value = this.evaluateTemplate(param.value, input);
				params.append(param.key, value);
			});
			url += "?" + params.toString();
		}

		return url;
	}
}
