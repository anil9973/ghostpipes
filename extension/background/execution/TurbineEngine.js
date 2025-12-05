/**
 * @fileoverview TurbineEngine - Master pipeline execution controller
 * @module background/execution/turbine-engine
 */

import { db, Store } from "../../pipelines/db/db.js";
import { PipeNode } from "../../pipelines/models/PipeNode.js";
import { ExecutionContext } from "./execution-context.js";
import { ExecutorRegistry } from "./nodes/executor-registry.js";

/**
 * Master controller for pipeline execution
 * Handles loading, scheduling, executing, and storing pipeline results
 */
export class TurbineEngine {
	constructor() {
		this.executorRegistry = new ExecutorRegistry();
		this.activeExecutions = new Map();
	}

	/**
	 * Execute a pipeline
	 * @param {string} pipelineId - Pipeline identifier
	 * @param {Object} triggerInfo - Trigger information
	 * @returns {Promise<Object>} Execution result
	 */
	async executePipeline(pipelineId, triggerInfo = {}) {
		console.log(`Starting pipeline execution: ${pipelineId}`);

		// Create execution context
		const context = new ExecutionContext(pipelineId, triggerInfo);
		this.activeExecutions.set(context.executionId, context);

		try {
			// 1. Load pipeline from IndexedDB
			const pipeline = await this.loadAndValidatePipeline(pipelineId);
			console.log(pipeline);

			// 2. Execute nodes sequentially
			const executionOrder = this.getExecutionOrder(pipeline.nodes);
			await this.runNodesSequentially(executionOrder, context);

			// 3. Get final output (last node's output)
			const lastNode = executionOrder[executionOrder.length - 1];
			const finalOutput = context.getNodeOutput(lastNode.id);

			// 4. Store execution result
			return await this.storeExecutionSuccess(context, pipeline, finalOutput);
		} catch (error) {
			await this.storeExecutionFailure(context, pipelineId, error);
			throw error;
		} finally {
			this.activeExecutions.delete(context.executionId);
		}
	}

	async loadAndValidatePipeline(pipelineId) {
		const pipeline = await db.get(Store.Pipelines, pipelineId);
		if (!pipeline) throw new Error(`Pipeline not found: ${pipelineId}`);

		const errors = this.validatePipeline(pipeline);
		if (errors.length) throw new Error(`Invalid pipeline: ${errors.join(", ")}`);

		return pipeline;
	}

	async runNodesSequentially(executionOrder, context) {
		for (const node of executionOrder) {
			const startTime = Date.now();

			try {
				await this.executeNode(node, context);
				const duration = Date.now() - startTime;
				context.recordNodeTiming(node.id, duration);

				console.log(`Node ${node.id} completed in ${duration}ms`);
			} catch (error) {
				const duration = Date.now() - startTime;
				context.recordNodeTiming(node.id, duration);

				// Handle node failure
				const recovered = await this.handleNodeFailure(node, error, context);
				if (!recovered) throw error; // Stop pipeline
			}
		}
	}

	/**
	 * Execute single node
	 * @param {PipeNode} node - Node configuration
	 * @param {ExecutionContext} context - Execution context
	 */
	async executeNode(node, context) {
		console.log(`Executing node: ${node.type} (${node.id})`);
		// Get executor for node type
		const executor = this.executorRegistry.getExecutor(node.type);
		if (!executor) throw new Error(`No executor found for node type: ${node.type}`);
		// Get input data
		const input = context.getInputData(node);

		// Execute with timeout
		const timeout = node.config.timeout || 30000; // 30 seconds default
		const message = `Node ${node.id} timed out after ${timeout}ms`;
		const cb = () => executor.execute(input, node.config, context);
		const output = await this.executeWithTimeout(cb, timeout, message);
		debugger;
		// Store output
		context.setNodeOutput(node.id, output);
	}

	/**
	 * Execute with timeout
	 * @param {Function} fn - Function to execute
	 * @param {number} timeoutMs - Timeout in milliseconds
	 * @param {string} message - Timeout error message
	 * @returns {Promise<any>} Result
	 */
	async executeWithTimeout(fn, timeoutMs, message) {
		return Promise.race([fn(), new Promise((_, reject) => setTimeout(() => reject(new Error(message)), timeoutMs))]);
	}

	/**
	 * Handle node execution failure
	 * @param {Object} node - Failed node
	 * @param {Error} error - Error object
	 * @param {ExecutionContext} context - Execution context
	 * @returns {Promise<boolean>} True if recovered, false if should stop
	 */
	async handleNodeFailure(node, error, context) {
		console.warn(`Node ${node.id} failed: ${error.message}`);

		// Ordered fallback strategies
		const strategies = [this.tryRetry.bind(this), this.tryUseCache.bind(this), this.trySkipNode.bind(this)];

		for (const strategy of strategies) {
			const recovered = await strategy(node, error, context);
			if (recovered) return true;
		}

		// Final failure result → Stop pipeline
		context.addError(node.id, error, "pipeline_stopped");
		return false;
	}

	async storeExecutionSuccess(context, pipeline, finalOutput) {
		const result = context.getExecutionResult("success", finalOutput);
		await db.put(Store.Executions, result);

		await this.sendNotification("Pipeline Completed", `${pipeline.name} finished successfully`);
		console.log("Pipeline execution completed");
		return result;
	}

	async storeExecutionFailure(context, pipelineId, error) {
		console.warn(`Pipeline execution failed: ${error.message}`);

		const result = context.getExecutionResult("failed", null);
		result.error = error.message;

		await db.put(Store.Executions, result);
		await this.sendNotification("Pipeline Failed", error.message);
	}

	async tryUseCache(node, error, context) {
		if (!node.config.useCachedOnError) return false;

		const cached = context.getStorage(`cache_${node.id}`);
		if (!cached) return false;

		context.setNodeOutput(node.id, cached);
		context.addError(node.id, error, "used_cached_data");
		context.addWarning(node.id, "Using cached data due to error");
		return true;
	}

	async tryRetry(node, error, context) {
		if (!this.shouldRetry(error, node)) return false;

		const maxRetries = node.config.maxRetries || 3;

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
				await this.executeNode(node, context);

				context.addError(node.id, error, `retry_success_attempt_${attempt}`);
				return true;
			} catch (_) {
				if (attempt === maxRetries) return false;
			}
		}
		return false;
	}

	async trySkipNode(node, error, context) {
		if (!node.config.skipOnError) return false;

		context.setNodeOutput(node.id, null);
		context.addError(node.id, error, "skipped");
		context.addWarning(node.id, "Node skipped due to error");
		return true;
	}

	/**
	 * Determine if error should trigger retry
	 * @param {Error} error - Error object
	 * @param {Object} node - Node configuration
	 * @returns {boolean} True if should retry
	 */
	shouldRetry(error, node) {
		// Network errors should be retried
		if (error.message.includes("fetch") || error.message.includes("network")) return true;
		// Timeout errors should be retried
		if (error.message.includes("timeout")) return true;
		// Rate limit errors should be retried
		if (error.message.includes("429") || error.message.includes("rate limit")) return true;
		return false;
	}

	/**
	 * Validate pipeline before execution
	 * @param {Object} pipeline - Pipeline configuration
	 * @returns {Array<string>} Validation errors
	 */
	validatePipeline(pipeline) {
		const errors = [];
		if (!pipeline.nodes || pipeline.nodes.length === 0) errors.push("Pipeline has no nodes");

		// Check for orphaned nodes
		const nodeIds = new Set(pipeline.nodes.map((n) => n.id));
		for (const node of pipeline.nodes) {
			for (const input of node.inputs || []) {
				nodeIds.has(input.nodeId) || errors.push(`Node ${node.id} references non-existent input ${input.nodeId}`);
			}
		}

		return errors;
	}

	/**
	 * Get execution order (topological sort)
	 * @param {Array<Object>} nodes - Pipeline nodes
	 * @returns {Array<Object>} Nodes in execution order
	 */
	getExecutionOrder(nodes) {
		const sorted = [];
		const visited = new Set();
		const visiting = new Set();

		const visit = (node) => {
			if (visited.has(node.id)) return;
			if (visiting.has(node.id)) throw new Error(`Circular dependency detected at node: ${node.id}`);
			visiting.add(node.id);

			// Visit dependencies first
			for (const input of node.inputs || []) {
				const inputNode = nodes.find((n) => n.id === input.nodeId);
				if (inputNode) visit(inputNode);
			}

			visiting.delete(node.id);
			visited.add(node.id);
			sorted.push(node);
		};

		// Start with nodes that have no inputs
		const rootNodes = nodes.filter((n) => !n.inputs || n.inputs.length === 0);
		for (const node of rootNodes) visit(node);
		// Visit remaining nodes
		for (const node of nodes) visited.has(node.id) || visit(node);
		return sorted;
	}

	async sendNotification(title, message) {
		const notification = {
			type: chrome.notifications.TemplateType.BASIC,
			iconUrl: "/assets/icon-128.png",
			title,
			message,
			priority: 2,
		};
		await chrome.notifications.create(notification);
	}
}
