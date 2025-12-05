import {
	ValidateConfig,
	ValidationFailureAction,
} from "../../../../pipelines/models/configs/processing/ValidateConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class ValidateExecutor extends BaseExecutor {
	/** @param {*} input - @param {ValidateConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { onFailure, rules } = config;
		const items = this.ensureArray(input);

		return items
			.map((item) => {
				const errors = [];

				rules
					.filter((r) => r.enabled)
					.forEach((rule) => {
						const value = this.getFieldValue(item, rule.field);

						if (rule.required && (value === undefined || value === null || value === ""))
							errors.push(`${rule.field} is required`);

						if (rule.type && value !== undefined) {
							const actualType = typeof value;
							if (actualType !== rule.type) errors.push(`${rule.field} must be ${rule.type}, got ${actualType}`);
						}
					});

				if (errors.length > 0) {
					const actions = {
						[ValidationFailureAction.SKIP]: () => null,
						[ValidationFailureAction.MARK]: () => ({ ...item, _validationErrors: errors }),
						[ValidationFailureAction.FAIL]: () => {
							throw new Error(`Validation failed: ${errors.join(", ")}`);
						},
					};
					return (actions[onFailure] || actions[ValidationFailureAction.SKIP])();
				}

				return item;
			})
			.filter((item) => item !== null);
	}
}
