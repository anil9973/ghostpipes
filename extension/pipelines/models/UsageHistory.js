import { nanoid } from "../utils/common.js";

/**
 * Input types for usage tracking
 * @enum {string}
 */
export const InputType = {
	URL: "url",
	FILE: "file",
	TEXT: "text",
};

/**
 * Usage history entry model
 */
export class UsageHistory {
	/**
	 * @param {Object} init
	 * @param {string} [init.id]
	 * @param {string} init.pipelineId
	 * @param {InputType} init.inputType
	 * @param {Object} [init.metadata]
	 * @param {boolean} [init.success]
	 * @param {number} [init.timestamp]
	 * @param {number} [init.executionTime]
	 */
	constructor(init) {
		/** @type {string} */
		this.id = init.id || nanoid(10);

		/** @type {string} */
		this.pipelineId = init.pipelineId;

		/** @type {InputType} */
		this.inputType = init.inputType;

		/** @type {Object} Metadata: { domain, path } | { mimeType, fileName } | { structure, length } */
		this.metadata = init.metadata || {};

		/** @type {boolean} */
		this.success = init.success ?? true;

		/** @type {number} Unix timestamp */
		this.timestamp = init.timestamp || Date.now();

		/** @type {number} Execution time in ms */
		this.executionTime = init.executionTime || 0;
	}

	/**
	 * Create from input classification
	 * @param {string} pipelineId
	 * @param {Object} classifiedInput
	 * @param {number} executionTime
	 * @returns {UsageHistory}
	 */
	static fromInput(pipelineId, classifiedInput, executionTime) {
		const metadata = {};

		if (classifiedInput.type === InputType.URL) {
			metadata.domain = classifiedInput.domain;
			metadata.path = classifiedInput.path;
		} else if (classifiedInput.type === InputType.FILE) {
			metadata.mimeType = classifiedInput.mimeType;
			metadata.fileName = classifiedInput.name;
		} else if (classifiedInput.type === InputType.TEXT) {
			metadata.structure = classifiedInput.structure;
			metadata.length = classifiedInput.content?.length || 0;
		}

		return new UsageHistory({
			pipelineId,
			inputType: classifiedInput.type,
			metadata,
			executionTime,
		});
	}
}
