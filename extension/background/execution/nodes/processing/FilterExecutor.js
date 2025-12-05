import { FilterConfig, FilterMode, MatchType } from "../../../../pipelines/models/configs/processing/FilterConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class FilterExecutor extends BaseExecutor {
	/** @param {*} input - @param {FilterConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { mode, matchType, rules } = config;
		const items = this.ensureArray(input);

		return items.filter((item) => {
			const matches = rules.filter((r) => r.enabled).map((r) => this.evaluateRule(item, r));
			const pass = matchType === MatchType.ALL ? matches.every((m) => m) : matches.some((m) => m);
			return mode === FilterMode.PERMIT ? pass : !pass;
		});
	}

	evaluateRule(item, rule) {
		const value = this.getFieldValue(item, rule.field);
		const ruleValue = rule.value;

		const operators = {
			"==": (a, b) => a == b,
			"!=": (a, b) => a != b,
			">": (a, b) => Number(a) > Number(b),
			"<": (a, b) => Number(a) < Number(b),
			">=": (a, b) => Number(a) >= Number(b),
			"<=": (a, b) => Number(a) <= Number(b),
			contains: (a, b) => String(a).includes(b),
			matches: (a, b) => new RegExp(b).test(String(a)),
			startsWith: (a, b) => String(a).startsWith(b),
			endsWith: (a, b) => String(a).endsWith(b),
		};

		const operator = operators[rule.operator];
		if (!operator) throw new Error(`Unknown operator: ${rule.operator}`);

		return operator(value, ruleValue);
	}
}
