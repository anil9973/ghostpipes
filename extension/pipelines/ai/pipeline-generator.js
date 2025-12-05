/**
 * @fileoverview Pipeline Generator - Converts AI responses to executable pipelines
 * @module pipelines/ai/pipeline-generator
 */

import { Pipe } from "../models/Pipe.js";
import { PipeNode } from "../models/PipeNode.js";
import { aiService } from "./ai-service.js";

/**
 * Generates pipelines from user intent using AI
 * Handles AI API calls, response validation, and pipeline construction
 */
export class PipelineGenerator {
	constructor() {}

	/**
	 * Generate complete pipeline from user intent
	 * @param {Object} context
	 * @param {string} context.userIntent - What user wants to accomplish
	 * @param {string} context.dataSource - URL, file, or text
	 * @param {string} context.dataType - html, json, csv, text
	 * @param {string} [context.additionalContext] - Extra context
	 * @param {string} [context.trigger] - How to trigger (manual, schedule, webhook)
	 * @returns  {Promise<{nodes:PipeNode[], pipes:Pipe[], reasoning:string}>}
	 */
	async generatePipeline(context) {
		// 1. Parse and validate response
		const pipelineData = await aiService.generatePipeline(context);
		// 2. Convert to PipeNode instances
		const nodes = this.createPipeNodes(pipelineData.nodes);
		// 3. Calculate node positions
		this.calculateNodePositions(nodes);
		// 4. Generate pipe connections
		const pipes = this.generatePipes(nodes);
		return {
			nodes,
			pipes,
			reasoning: pipelineData.reasoning,
		};
	}

	/**
	 * Convert AI node data to PipeNode instances
	 * @param {Array<Object>} nodeData - Raw node data from AI
	 * @returns {Array<PipeNode>} Array of PipeNode instances
	 */
	createPipeNodes(nodeData) {
		const nodes = [];

		for (const data of nodeData) {
			// Create PipeNode instance
			const node = new PipeNode({
				id: data.id,
				type: data.type,
				title: data.title,
				summary: data.summary,
				config: data.config,
				// Convert inputs array to new structure
				inputs: this.convertInputs(data.inputs),
				// Convert outputs array to new structure
				outputs: this.convertOutputs(data.outputs),
			});

			nodes.push(node);
		}

		// Validate connections
		this.validateConnections(nodes);

		return nodes;
	}

	/**
	 * Convert AI inputs to new structure with schemas
	 * @param {Array} inputs - AI-provided inputs
	 * @returns {Array<Object>} Formatted inputs
	 */
	convertInputs(inputs) {
		if (!inputs || !Array.isArray(inputs)) {
			return [];
		}

		return inputs.map((input) => ({
			nodeId: input.nodeId,
			inputSchema: input.inputSchema || {},
		}));
	}

	/**
	 * Convert AI outputs to new structure with schemas
	 * @param {Array} outputs - AI-provided outputs
	 * @returns {Array<Object>} Formatted outputs
	 */
	convertOutputs(outputs) {
		if (!outputs || !Array.isArray(outputs)) {
			return [];
		}

		return outputs.map((output) => ({
			nodeId: output.nodeId,
			outputSchema: output.outputSchema || {},
		}));
	}

	/**
	 * Validate that all node connections are valid
	 * @param {Array<PipeNode>} nodes - All nodes
	 * @throws {Error} If connections are invalid
	 */
	validateConnections(nodes) {
		const nodeIds = new Set(nodes.map((n) => n.id));

		for (const node of nodes) {
			// Check all input connections exist
			for (const input of node.inputs) {
				if (!nodeIds.has(input.nodeId)) {
					throw new Error(`Node "${node.id}" references non-existent input "${input.nodeId}"`);
				}
			}

			// Check all output connections exist
			for (const output of node.outputs) {
				if (!nodeIds.has(output.nodeId)) {
					throw new Error(`Node "${node.id}" references non-existent output "${output.nodeId}"`);
				}
			}
		}

		// Check for cycles (optional, can cause infinite loops)
		this.checkForCycles(nodes);
	}

	/**
	 * Check for circular dependencies
	 * @param {Array<PipeNode>} nodes - All nodes
	 * @throws {Error} If cycle detected
	 */
	checkForCycles(nodes) {
		const visited = new Set();
		const recursionStack = new Set();

		const hasCycle = (nodeId) => {
			if (recursionStack.has(nodeId)) {
				return true; // Cycle detected
			}

			if (visited.has(nodeId)) {
				return false; // Already processed
			}

			visited.add(nodeId);
			recursionStack.add(nodeId);

			const node = nodes.find((n) => n.id === nodeId);
			if (node) {
				for (const output of node.outputs) {
					if (hasCycle(output.nodeId)) {
						return true;
					}
				}
			}

			recursionStack.delete(nodeId);
			return false;
		};

		for (const node of nodes) {
			if (hasCycle(node.id)) {
				throw new Error("Pipeline contains circular dependency");
			}
		}
	}

	/**
	 * Calculate visual positions for nodes
	 * Arranges nodes in horizontal layers with proper spacing
	 * @param {Array<PipeNode>} nodes - All nodes
	 */
	calculateNodePositions(nodes) {
		// 1. Build dependency graph
		const layers = this.calculateNodeLayers(nodes);

		// 2. Calculate positions based on layers
		const VIEWPORT_WIDTH = window.innerWidth - 220; // Screen width - sidebar (approx 1200px)
		const LAYER_HEIGHT = 250; // Vertical spacing between layers
		const MIN_HORIZONTAL_SPACING = 450; // Minimum horizontal spacing

		layers.forEach((layerNodes, layerIndex) => {
			const nodesInLayer = layerNodes.length;

			// Calculate spacing to center nodes horizontally
			const totalWidth = (nodesInLayer - 1) * MIN_HORIZONTAL_SPACING;
			const startX = (VIEWPORT_WIDTH - totalWidth) / 2;

			layerNodes.forEach((node, indexInLayer) => {
				node.position = {
					x: startX + indexInLayer * MIN_HORIZONTAL_SPACING,
					y: 100 + layerIndex * LAYER_HEIGHT,
				};
			});
		});
	}

	/**
	 * Calculate which layer each node belongs to
	 * Layer 0 = input nodes, Layer N = output nodes
	 * @param {Array<PipeNode>} nodes - All nodes
	 * @returns {Array<Array<PipeNode>>} Nodes grouped by layer
	 */
	calculateNodeLayers(nodes) {
		const layers = [];
		const nodeToLayer = new Map();

		// Find nodes with no inputs (layer 0)
		const rootNodes = nodes.filter((n) => n.inputs.length === 0);

		// BFS to assign layers
		const queue = rootNodes.map((n) => ({ node: n, layer: 0 }));
		const visited = new Set();

		while (queue.length > 0) {
			const { node, layer } = queue.shift();

			if (visited.has(node.id)) {
				continue;
			}

			visited.add(node.id);
			nodeToLayer.set(node.id, layer);

			// Add to layer array
			if (!layers[layer]) {
				layers[layer] = [];
			}
			layers[layer].push(node);

			// Process outputs (next layer)
			for (const output of node.outputs) {
				const childNode = nodes.find((n) => n.id === output.nodeId);
				if (childNode && !visited.has(childNode.id)) {
					queue.push({ node: childNode, layer: layer + 1 });
				}
			}
		}

		return layers;
	}

	/**
	 * Generate pipe connections between nodes
	 * @param {Array<PipeNode>} nodes - All positioned nodes
	 * @returns {Array<Pipe>} Pipe connection objects
	 */
	generatePipes(nodes) {
		const pipes = [];
		let pipeIndex = 1;

		for (const node of nodes) {
			for (const output of node.outputs) {
				const targetNode = nodes.find((n) => n.id === output.nodeId);
				if (!targetNode) {
					console.warn(`Target node "${output.nodeId}" not found for pipe from "${node.id}"`);
					continue;
				}

				// Determine connection sides based on positions
				const { sourceSide, targetSide } = this.calculateConnectionSides(node, targetNode);
				pipes.push(
					new Pipe({ id: `pipe_${pipeIndex++}`, sourceId: node.id, sourceSide, targetId: targetNode.id, targetSide })
				);
			}
		}

		return pipes;
	}

	/**
	 * Calculate which sides to connect based on node positions
	 * @param {PipeNode} sourceNode - Source node
	 * @param {PipeNode} targetNode - Target node
	 * @returns {Object} { sourceSide, targetSide }
	 */
	calculateConnectionSides(sourceNode, targetNode) {
		const dx = targetNode.position.x - sourceNode.position.x;
		const dy = targetNode.position.y - sourceNode.position.y;

		// Default: vertical flow (top to bottom)
		if (Math.abs(dy) > Math.abs(dx)) {
			return dy > 0 ? { sourceSide: "bottom", targetSide: "top" } : { sourceSide: "top", targetSide: "bottom" };
		}

		// Horizontal flow (left to right)
		return dx > 0 ? { sourceSide: "right", targetSide: "left" } : { sourceSide: "left", targetSide: "right" };
	}

	// /**
	//  * Generate summary for existing node using AI
	//  * @param {PipeNode} node - Node to generate summary for
	//  * @returns {Promise<string>} Generated summary
	//  */
	// async generateNodeSummary(node) {
	// 	try {
	// 		const response = await this.callGeminiAPI(prompt);
	// 		return response.trim();
	// 	} catch (error) {
	// 		console.error("Failed to generate summary:", error);
	// 		// Fallback to config summary
	// 		return node.config.getSummary ? node.config.getSummary() : "Not configured";
	// 	}
	// }

	/**
	 * Validate pipeline before execution
	 * @param {Array<PipeNode>} nodes - Pipeline nodes
	 * @returns {Array<string>} Validation errors (empty if valid)
	 */
	validatePipeline(nodes) {
		const errors = [];

		if (!nodes || nodes.length === 0) {
			errors.push("Pipeline must have at least one node");
			return errors;
		}

		// Check for input nodes
		const hasInputNode = nodes.some((n) =>
			["manual_input", "http_request", "webhook", "file_watch"].includes(n.type)
		);

		if (!hasInputNode) {
			errors.push("Pipeline must have at least one input node");
		}

		// Check for output nodes
		const hasOutputNode = nodes.some((n) => ["download", "file_append", "http_post", "send_email"].includes(n.type));

		if (!hasOutputNode) {
			errors.push("Pipeline must have at least one output node");
		}

		// Validate each node's configuration
		for (const node of nodes) {
			if (node.config.validate) {
				const nodeErrors = node.config.validate();
				if (nodeErrors && nodeErrors.length > 0) {
					errors.push(`Node "${node.id}": ${nodeErrors.join(", ")}`);
				}
			}
		}

		// Check for disconnected nodes (except single-node pipelines)
		if (nodes.length > 1) {
			const connected = new Set();

			// Mark all nodes that have connections
			for (const node of nodes) {
				if (node.inputs.length > 0 || node.outputs.length > 0) {
					connected.add(node.id);
				}
			}

			const disconnected = nodes.filter((n) => !connected.has(n.id));
			if (disconnected.length > 0) {
				errors.push(`Disconnected nodes: ${disconnected.map((n) => n.id).join(", ")}`);
			}
		}

		return errors;
	}

	/**
	 * Estimate pipeline complexity
	 * @param {Array<PipeNode>} nodes - Pipeline nodes
	 * @returns {Object} Complexity metrics
	 */
	estimateComplexity(nodes) {
		const layers = this.calculateNodeLayers(nodes);

		return {
			totalNodes: nodes.length,
			totalLayers: layers.length,
			maxNodesPerLayer: Math.max(...layers.map((l) => l.length)),
			hasConditions: nodes.some((n) => ["condition", "switch"].includes(n.type)),
			hasLoops: nodes.some((n) => ["loop", "until_loop"].includes(n.type)),
			hasAI: nodes.some((n) => n.type === "ai_processor"),
			estimatedDuration: this.estimateExecutionTime(nodes),
		};
	}

	/**
	 * Estimate pipeline execution time
	 * @param {Array<PipeNode>} nodes - Pipeline nodes
	 * @returns {number} Estimated time in milliseconds
	 */
	estimateExecutionTime(nodes) {
		let total = 0;

		const timings = {
			manual_input: 0,
			http_request: 3000,
			webhook: 0,
			file_watch: 0,
			filter: 50,
			transform: 50,
			parse: 100,
			ai_processor: 5000,
			condition: 10,
			switch: 10,
			join: 100,
			deduplicate: 100,
			validate: 50,
			aggregate: 100,
			sort: 50,
			loop: 500,
			until_loop: 2000,
			custom_code: 200,
			download: 500,
			file_append: 300,
			http_post: 1000,
			send_email: 500,
		};

		for (const node of nodes) {
			total += timings[node.type] || 100;
		}

		return total;
	}
}
