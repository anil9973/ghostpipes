/**
 * @fileoverview Registry for all node executors
 * @module background/execution/nodes/executor-registry
 */

import { BaseExecutor } from "./base-executor.js";
import { FileWatchExecutor } from "./input/FileWatchExecutor.js";
import { HttpRequestExecutor } from "./input/HttpRequestExecutor.js";
import { ManualInputExecutor } from "./input/ManualInputExecutor.js";
import { WebhookExecutor } from "./input/WebhookExecutor.js";
import { DownloadExecutor } from "./output/DownloadExecutor.js";
import { EmailExecutor } from "./output/EmailExecutor.js";
import { FileAppendExecutor } from "./output/FileAppendExecutor.js";
import { HttpPostExecutor } from "./output/HttpPostExecutor.js";
import { AggregateExecutor } from "./processing/AggregateExecutor.js";
import { AIProcessorExecutor } from "./processing/AIProcessorExecutor.js";
import { ConditionExecutor } from "./processing/ConditionExecutor.js";
import { CustomCodeExecutor } from "./processing/CustomCodeExecutor.js";
import { DeduplicateExecutor } from "./processing/DeduplicateExecutor.js";
import { DistinctExecutor } from "./processing/DistinctExecutor.js";
import { FilterExecutor } from "./processing/FilterExecutor.js";
import { FormatExecutor } from "./processing/FormatExecutor.js";
import { IntersectExecutor } from "./processing/IntersectExecutor.js";
import { JoinExecutor } from "./processing/JoinExecutor.js";
import { LookupExecutor } from "./processing/LookupExecutor.js";
import { LoopExecutor } from "./processing/LoopExecutor.js";
import { ParseExecutor } from "./processing/ParseExecutor.js";
import { RegexPatternExecutor } from "./processing/RegexPatternExecutor.js";
import { SortExecutor } from "./processing/SortExecutor.js";
import { SplitExecutor } from "./processing/SplitExecutor.js";
import { StringBuilderExecutor } from "./processing/StringBuilderExecutor.js";
import { SwitchExecutor } from "./processing/SwitchExecutor.js";
import { TransformExecutor } from "./processing/TransformExecutor.js";
import { UnionExecutor } from "./processing/UnionExecutor.js";
import { UntilLoopExecutor } from "./processing/UntilLoopExecutor.js";
import { UrlBuilderExecutor } from "./processing/UrlBuilderExecutor.js";
import { ValidateExecutor } from "./processing/ValidateExecutor.js";

/**
 * Central registry for node executors
 * Maps node types to executor instances
 */
export class ExecutorRegistry {
	constructor() {
		this.executors = new Map();
		this.registerAllExecutors();
	}

	/**
	 * Register all executor instances
	 */
	registerAllExecutors() {
		// Input executors
		this.register("manual_input", new ManualInputExecutor());
		this.register("http_request", new HttpRequestExecutor());
		this.register("webhook", new WebhookExecutor());
		this.register("file_watch", new FileWatchExecutor());

		// Processing executors
		this.register("filter", new FilterExecutor());
		this.register("transform", new TransformExecutor());
		this.register("parse", new ParseExecutor());
		this.register("ai_processor", new AIProcessorExecutor());
		this.register("condition", new ConditionExecutor());
		this.register("join", new JoinExecutor());
		this.register("deduplicate", new DeduplicateExecutor());
		this.register("validate", new ValidateExecutor());
		this.register("aggregate", new AggregateExecutor());
		this.register("sort", new SortExecutor());
		this.register("split", new SplitExecutor());
		this.register("loop", new LoopExecutor());
		this.register("switch", new SwitchExecutor());
		this.register("until_loop", new UntilLoopExecutor());
		this.register("regex_pattern", new RegexPatternExecutor());
		this.register("format", new FormatExecutor());
		this.register("string_builder", new StringBuilderExecutor());
		this.register("url_builder", new UrlBuilderExecutor());
		this.register("lookup", new LookupExecutor());
		this.register("union", new UnionExecutor());
		this.register("intersect", new IntersectExecutor());
		this.register("distinct", new DistinctExecutor());
		this.register("custom_code", new CustomCodeExecutor());

		// Output executors
		this.register("download", new DownloadExecutor());
		this.register("file_append", new FileAppendExecutor());
		this.register("http_post", new HttpPostExecutor());
		this.register("send_email", new EmailExecutor());
	}

	/**
	 * Register an executor
	 * @param {string} type - Node type
	 * @param {BaseExecutor} executor - Executor instance
	 */
	register(type, executor) {
		this.executors.set(type, executor);
	}

	/**
	 * Get executor for node type
	 * @param {string} type - Node type
	 * @returns {BaseExecutor} Executor instance
	 */
	getExecutor(type) {
		const executor = this.executors.get(type);
		if (!executor) throw new Error(`No executor registered for type: ${type}`);

		return executor;
	}

	/**
	 * Check if executor exists for type
	 * @param {string} type - Node type
	 * @returns {boolean} True if executor exists
	 */
	hasExecutor(type) {
		return this.executors.has(type);
	}

	/**
	 * Get all registered types
	 * @returns {Array<string>} List of node types
	 */
	getRegisteredTypes() {
		return Array.from(this.executors.keys());
	}
}
