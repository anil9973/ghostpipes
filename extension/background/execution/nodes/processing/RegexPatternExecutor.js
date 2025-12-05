import { RegexPatternConfig } from "../../../../pipelines/models/configs/processing/RegexPatternConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class RegexPatternExecutor extends BaseExecutor {
	/** @param {*} input - @param {RegexPatternConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { patterns } = config;
		const items = this.ensureArray(input);

		const getFlagString = (flags) =>
			Object.entries(flags)
				.filter(([, v]) => v)
				.map(([k]) => k)
				.join("");

		return items.map((item) => {
			const result = { ...item };

			patterns
				.filter((p) => p.enabled)
				.forEach((p) => {
					const value = this.getFieldValue(item, p.field);
					if (typeof value === "string") {
						const regex = new RegExp(p.pattern, getFlagString(p.flags));

						if (p.extract) result[`${p.field}_extracted`] = value.match(regex) || [];
						else if (p.replacement !== undefined) result[p.field] = value.replace(regex, p.replacement);
					}
				});

			return result;
		});
	}
}
