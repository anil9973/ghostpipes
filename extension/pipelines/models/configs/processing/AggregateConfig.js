/**
 * @fileoverview Aggregate node configuration
 * @module pipelines/models/configs/processing/AggregateConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Aggregate operation types */
export const AggregateOperation = {
	SUM: "sum",
	AVG: "avg",
	COUNT: "count",
	MIN: "min",
	MAX: "max",
	FIRST: "first",
	LAST: "last",
};

/**
 * Aggregation helper class
 * Defines a single aggregation operation
 */
export class Aggregation {
	/**
	 * @param {Object} init - Initial data
	 * @param {string} [init.field] - Field to aggregate
	 * @param {string} [init.operation] - Aggregation operation (sum, avg, count, etc.)
	 * @param {string} [init.alias] - Output field name
	 */
	constructor(init = {}) {
		/** @type {string} Field used for aggregation */
		this.field = init.field || "";

		/** @type {AggregateOperation} Operation defining the aggregation behavior */
		this.operation = init.operation || AggregateOperation.COUNT;

		/** @type {string} Output alias for aggregated value */
		this.alias = init.alias || "";
	}
}

/**
 * Configuration for aggregate node
 * Groups and aggregates data based on specified operations
 */
export class AggregateConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {boolean} [init.groupByKey] - Group by key field
	 * @param {string[]} [init.groupByFields] - Fields to group by
	 * @param {Array<Aggregation>} [init.aggregations] - Aggregation operations
	 */
	constructor(init = {}) {
		super();
		/** @type {boolean} Enable grouping by record key */
		this.groupByKey = init.groupByKey ?? true;

		/** @type {string[]} Fields used for grouping when groupByKey = false */
		this.groupByFields = init.groupByFields || [];

		/** @type {Aggregation[]} Aggregation rules applied to each group */
		this.aggregations = (init.aggregations || []).map((a) => new Aggregation(a));
	}

	getSchema() {
		return {
			groupByKey: {
				type: "boolean",
				required: false,
			},
			groupByFields: {
				type: "array",
				required: false,
			},
			aggregations: {
				type: "array",
				required: true,
				minLength: 1,
			},
		};
	}

	getSummary() {
		const count = this.aggregations.filter((a) => a.field).length;
		return `${count} aggregation${count !== 1 ? "s" : ""}`;
	}
}
