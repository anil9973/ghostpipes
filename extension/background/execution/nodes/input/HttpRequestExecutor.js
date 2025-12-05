import { HttpMethod, HttpRequestConfig } from "../../../../pipelines/models/configs/input/HttpRequestConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class HttpRequestExecutor extends BaseExecutor {
	/** @param {*} input - @param {HttpRequestConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { method, url, headers, queryParams, body, timeout } = config;

		// Build URL with query params
		const finalUrl = this.buildUrl(url, queryParams);

		// Build headers
		const finalHeaders = new Headers();
		headers?.forEach((h) => finalHeaders.set(h.key, h.value));

		const options = {
			method: method || HttpMethod.GET,
			headers: finalHeaders,
			signal: AbortSignal.timeout(timeout || 10000),
		};

		if ([HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH].includes(method))
			options.body = body || JSON.stringify(input);

		const response = await fetch(finalUrl, options);

		if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		const contentType = response.headers.get("content-type") || "";

		if (contentType.includes("application/json")) return await response.json();

		return await response.text();
	}

	buildUrl(baseUrl, queryParams) {
		if (!queryParams || queryParams.length === 0) return baseUrl;

		const url = new URL(baseUrl);
		queryParams.forEach((param) => url.searchParams.append(param.key, param.value));
		return url.toString();
	}
}
