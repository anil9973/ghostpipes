import {
	TransformConfig,
	TransformOperation,
} from "../../../../pipelines/models/configs/processing/TransformConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class TransformExecutor extends BaseExecutor {
	/** @param {*} input - @param {TransformConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { transformations } = config;
		const items = this.ensureArray(input);

		return items.map((item) => {
			const transformed = {};

			transformations.forEach((t) => {
				const handlers = {
					[TransformOperation.COPY]: () => this.getFieldValue(item, t.sourceField),
					[TransformOperation.TEMPLATE]: () => this.evaluateTemplate(t.sourceField, item),
					[TransformOperation.CALCULATE]: () => this.evaluateExpression(t.sourceField, item),
					[TransformOperation.UPPERCASE]: () => String(this.getFieldValue(item, t.sourceField)).toUpperCase(),
					[TransformOperation.LOWERCASE]: () => String(this.getFieldValue(item, t.sourceField)).toLowerCase(),
					[TransformOperation.TRIM]: () => String(this.getFieldValue(item, t.sourceField)).trim(),
				};

				const handler = handlers[t.operation];
				if (handler) this.setFieldValue(transformed, t.targetField, handler());
			});

			return transformed;
		});
	}

	evaluateExpression(expr, context) {
		// Simple expression evaluation
		// e.g., "{{price}} * {{quantity}}"
		const evaluated = this.evaluateTemplate(expr, context);
		try {
			return eval(evaluated);
		} catch {
			return evaluated;
		}
	}
}
