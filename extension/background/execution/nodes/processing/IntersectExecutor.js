import {
	IntersectCompareBy,
	IntersectConfig,
} from "../../../../pipelines/models/configs/processing/IntersectConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class IntersectExecutor extends BaseExecutor {
	/** @param {*} inputs - @param {IntersectConfig} config - @param {ExecutionContext} context */
	async execute(inputs, config, context) {
		if (!Array.isArray(inputs) || inputs.length < 2) throw new Error("Intersect requires two inputs");

		const { compareBy, field, ignoreCase } = config;

		const first = this.ensureArray(inputs[0].data);
		const second = this.ensureArray(inputs[1].data);

		const secondKeys = new Set(
			second.map((item) => {
				let key = compareBy === IntersectCompareBy.FIELD ? this.getFieldValue(item, field) : JSON.stringify(item);
				if (ignoreCase && typeof key === "string") key = key.toLowerCase();
				return key;
			})
		);

		return first.filter((item) => {
			let key = compareBy === IntersectCompareBy.FIELD ? this.getFieldValue(item, field) : JSON.stringify(item);
			if (ignoreCase && typeof key === "string") key = key.toLowerCase();
			return secondKeys.has(key);
		});
	}
}
