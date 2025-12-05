import { ConditionConfig, LogicOperator } from "../../../../pipelines/models/configs/processing/ConditionConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class ConditionExecutor extends BaseExecutor {
	/** @param {*} input - @param {ConditionConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { logic, rules } = config;

		const results = rules.map((rule) => {
			const value = this.getFieldValue(input, rule.field);
			return this.compareValues(value, rule.operator, rule.value);
		});

		const pass = logic === LogicOperator.AND ? results.every((r) => r) : results.some((r) => r);

		return { ...input, _conditionPassed: pass };
	}
}
