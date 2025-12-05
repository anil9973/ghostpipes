/**
 * @fileoverview Execution context - Runtime environment for pipeline execution
 * @module background/execution/execution-context
 */

import { PipeNode } from "../../pipelines/models/PipeNode.js";

/**
 * Maintains state during pipeline execution
 * Stores node outputs, shared data, and execution metadata
 */
export class ExecutionContext {
	/**
	 * @param {string} pipelineId - Pipeline identifier
	 * @param {Object} trigger - Trigger information
	 */
	constructor(pipelineId, trigger = {}) {
		this.pipelineId = pipelineId;
		this.executionId = crypto.randomUUID();
		this.startedAt = Date.now();

		// Node outputs stored by node ID
		this.nodeOutputs = new Map();

		// Shared storage for data persistence between nodes
		this.storage = new Map();

		// Execution metadata
		this.metadata = {
			trigger: trigger,
			variables: {},
			errors: [],
			warnings: [],
		};

		// Performance tracking
		this.performance = {
			nodeTimings: new Map(),
			totalDuration: 0,
		};
	}

	/**
	 * Store output from a node
	 * @param {string} nodeId - Node identifier
	 * @param {any} data - Output data
	 */
	setNodeOutput(nodeId, data) {
		this.nodeOutputs.set(nodeId, data);
		console.log(`Stored output for node: ${nodeId}`);
	}

	/**
	 * Get output from a node
	 * @param {string} nodeId - Node identifier
	 * @returns {any} Output data or undefined
	 */
	getNodeOutput(nodeId) {
		return this.nodeOutputs.get(nodeId);
	}

	/**
	 * Clear output for a node (memory optimization)
	 * @param {string} nodeId - Node identifier
	 */
	clearNodeOutput(nodeId) {
		this.nodeOutputs.delete(nodeId);
	}

	/**
	 * Get input data for current node
	 * @param {PipeNode} node - Node configuration
	 * @returns {any | null | Array<{nodeId: string, data: any, schema: PipeSchema}>}
	 */
	getInputData(node) {
		// No inputs (source node)
		if (!node.inputs || node.inputs.length === 0) {
			return this.metadata.trigger.data || null;
		}

		// Single input
		if (node.inputs.length === 1) {
			const inputNodeId = node.inputs[0].nodeId;
			const data = this.getNodeOutput(inputNodeId);

			if (data === undefined) throw new Error(`No output found for input node: ${inputNodeId}`);

			return data;
		}

		// Multiple inputs (for join, union, etc.)
		return node.inputs.map((input) => {
			const data = this.getNodeOutput(input.nodeId);

			if (data === undefined) throw new Error(`No output found for input node: ${input.nodeId}`);

			return {
				nodeId: input.nodeId,
				data: data,
				schema: input.inputSchema || {},
			};
		});
	}

	/**
	 * Store data in shared storage
	 * @param {string} key - Storage key
	 * @param {any} value - Value to store
	 */
	setStorage(key, value) {
		this.storage.set(key, value);
	}

	/**
	 * Get data from shared storage
	 * @param {string} key - Storage key
	 * @returns {any} Stored value or undefined
	 */
	getStorage(key) {
		return this.storage.get(key);
	}

	/**
	 * Set execution variable
	 * @param {string} name - Variable name
	 * @param {any} value - Variable value
	 */
	setVariable(name, value) {
		this.metadata.variables[name] = value;
	}

	/**
	 * Get execution variable
	 * @param {string} name - Variable name
	 * @returns {any} Variable value
	 */
	getVariable(name) {
		return this.metadata.variables[name];
	}

	/**
	 * Add error to execution log
	 * @param {string} nodeId - Node that failed
	 * @param {Error} error - Error object
	 * @param {string} recovery - Recovery action taken
	 */
	addError(nodeId, error, recovery = "none") {
		this.metadata.errors.push({
			nodeId,
			message: error.message,
			stack: error.stack,
			recovery,
			timestamp: Date.now(),
		});
	}

	/**
	 * Add warning to execution log
	 * @param {string} nodeId - Node identifier
	 * @param {string} message - Warning message
	 */
	addWarning(nodeId, message) {
		this.metadata.warnings.push({
			nodeId,
			message,
			timestamp: Date.now(),
		});
	}

	/**
	 * Record node execution time
	 * @param {string} nodeId - Node identifier
	 * @param {number} duration - Duration in milliseconds
	 */
	recordNodeTiming(nodeId, duration) {
		this.performance.nodeTimings.set(nodeId, duration);
	}

	/**
	 * Get execution summary
	 * @returns {Object} Execution summary
	 */
	getSummary() {
		const completedAt = Date.now();
		const duration = completedAt - this.startedAt;

		return {
			executionId: this.executionId,
			pipelineId: this.pipelineId,
			startedAt: new Date(this.startedAt).toISOString(),
			completedAt: new Date(completedAt).toISOString(),
			duration,
			trigger: this.metadata.trigger,
			nodesExecuted: this.nodeOutputs.size,
			errors: this.metadata.errors,
			warnings: this.metadata.warnings,
			performance: {
				totalDuration: duration,
				nodeTimings: Object.fromEntries(this.performance.nodeTimings),
			},
		};
	}

	/**
	 * Get execution result for storage
	 * @param {string} status - Execution status
	 * @param {any} finalOutput - Final pipeline output
	 * @returns {Object} Execution result
	 */
	getExecutionResult(status, finalOutput = null) {
		const summary = this.getSummary();

		return {
			id: this.executionId,
			pipelineId: this.pipelineId,
			status, // success, failed, partial
			...summary,
			finalOutput,
			// Node-by-node results
			nodeResults: Object.fromEntries(
				Array.from(this.performance.nodeTimings.entries()).map(([nodeId, duration]) => [
					nodeId,
					{
						success: true,
						duration,
					},
				])
			),
		};
	}
}
