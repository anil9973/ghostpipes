import { JoinConfig, JoinType } from "../../../../pipelines/models/configs/processing/JoinConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class JoinExecutor extends BaseExecutor {
	/** @param {*} inputs - @param {JoinConfig} config - @param {ExecutionContext} context */
	async execute(inputs, config, context) {
		if (!Array.isArray(inputs) || inputs.length < 2) throw new Error("Join requires two inputs");

		const { type, leftKey, rightKey, duplicateHandling } = config;

		const left = this.ensureArray(inputs[0].data);
		const right = this.ensureArray(inputs[1].data);
		const result = [];

		const joinTypes = {
			[JoinType.INNER]: () => {
				left.forEach((l) => {
					right.forEach((r) => {
						if (this.getFieldValue(l, leftKey) === this.getFieldValue(r, rightKey)) result.push({ ...l, ...r });
					});
				});
			},
			[JoinType.LEFT]: () => {
				left.forEach((l) => {
					let matched = false;
					right.forEach((r) => {
						if (this.getFieldValue(l, leftKey) === this.getFieldValue(r, rightKey)) {
							result.push({ ...l, ...r });
							matched = true;
						}
					});
					if (!matched) result.push(l);
				});
			},
		};

		(joinTypes[type] || joinTypes[JoinType.INNER])();

		return result;
	}
}
