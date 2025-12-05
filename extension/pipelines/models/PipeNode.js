import { nanoid } from "../utils/common.js";
import { BaseConfig } from "./BaseConfig.js";
import { FileWatchConfig } from "./configs/input/FileWatchConfig.js";
import { HttpRequestConfig } from "./configs/input/HttpRequestConfig.js";
import { ManualInputConfig } from "./configs/input/ManualInputConfig.js";
import { WebhookConfig } from "./configs/input/WebhookConfig.js";
import { DownloadConfig } from "./configs/output/DownloadConfig.js";
import { FileAppendConfig } from "./configs/output/FileAppendConfig.js";
import { HttpPostConfig } from "./configs/output/HttpPostConfig.js";
import { SendEmailConfig } from "./configs/output/SendEmailConfig.js";
import { AggregateConfig } from "./configs/processing/AggregateConfig.js";
import { AiProcessorConfig } from "./configs/processing/AiProcessorConfig.js";
import { ConditionConfig } from "./configs/processing/ConditionConfig.js";
import { CustomCodeConfig } from "./configs/processing/CustomCodeConfig.js";
import { DeduplicateConfig } from "./configs/processing/DeduplicateConfig.js";
import { DistinctConfig } from "./configs/processing/DistinctConfig.js";
import { FilterConfig } from "./configs/processing/FilterConfig.js";
import { FormatConfig } from "./configs/processing/FormatConfig.js";
import { IntersectConfig } from "./configs/processing/IntersectConfig.js";
import { JoinConfig } from "./configs/processing/JoinConfig.js";
import { LookupConfig } from "./configs/processing/LookupConfig.js";
import { LoopConfig } from "./configs/processing/LoopConfig.js";
import { ParseConfig } from "./configs/processing/ParseConfig.js";
import { RegexPatternConfig } from "./configs/processing/RegexPatternConfig.js";
import { SortConfig } from "./configs/processing/SortConfig.js";
import { SplitConfig } from "./configs/processing/SplitConfig.js";
import { StringBuilderConfig } from "./configs/processing/StringBuilderConfig.js";
import { SwitchConfig } from "./configs/processing/SwitchConfig.js";
import { TransformConfig } from "./configs/processing/TransformConfig.js";
import { UnionConfig } from "./configs/processing/UnionConfig.js";
import { UntilLoopConfig } from "./configs/processing/UntilLoopConfig.js";
import { UrlBuilderConfig } from "./configs/processing/UrlBuilderConfig.js";
import { ValidateConfig } from "./configs/processing/ValidateConfig.js";

/**@enum {string} */
export const NodeType = Object.freeze({
	MANUAL_INPUT: "manual_input",
	HTTP_REQUEST: "http_request",
	WEBHOOK: "webhook",
	FILE_WATCH: "file_watch",
	SCHEDULED: "scheduled",
	FILTER: "filter",
	TRANSFORM: "transform",
	PARSE: "parse",
	AI_PROCESSOR: "ai_processor",
	CONDITION: "condition",
	SWITCH: "switch",
	JOIN: "join",
	SPLIT: "split",
	DEDUPLICATE: "deduplicate",
	VALIDATE: "validate",
	AGGREGATE: "aggregate",
	SORT: "sort",
	LOOP: "loop",
	UNTIL_LOOP: "until_loop",
	REGEX_PATTERN: "regex_pattern",
	FORMAT: "format",
	STRING_BUILDER: "string_builder",
	URL_BUILDER: "url_builder",
	LOOKUP: "lookup",
	UNION: "union",
	INTERSECT: "intersect",
	DISTINCT: "distinct",
	CUSTOM_CODE: "custom_code",
	DOWNLOAD: "download",
	FILE_APPEND: "file_append",
	HTTP_POST: "http_post",
	SEND_EMAIL: "send_email",
	COPY: "copy",
	DRIVE_UPLOAD: "drive_upload",
	EMAIL_SEND: "email_send",
	DATABASE_WRITE: "database_write",
	// Additional category from def nodes
	EXTENSION_DATA: "extension_data",
});

/**Represents a single node in a data-flow pipeline. */
export class PipeNode {
	/**
	 * @typedef {Object} PipeNodePosition
	 * @property {number} x - X-axis position in the canvas.
	 * @property {number} y - Y-axis position in the canvas.
	 */

	/**
	 * @typedef {Object<string, string>} PipeSchema
	 * @description Defines the structure and type of data expected or produced by a node.
	 * @example
	 * {
	 *   "title": "string",
	 *   "price": "number"
	 * }
	 */

	/**
	 * @typedef {Object} PipeConnection
	 * @property {string} nodeId - ID of the connected node.
	 * @property {PipeSchema} [inputSchema] - Expected incoming data format.
	 * @property {PipeSchema} [outputSchema] - Data format this node outputs to the connection.
	 */

	/**
	 * @typedef {Object} PipeNodeInit
	 * @property {string} [id] - Unique node ID; auto-generated if omitted.
	 * @property {string} [type="manual_input"] - Node operation category (e.g. http_request, transform, filter).
	 * @property {string} [title] - Display name in UI; defaults based on type.
	 * @property {string|null} [summary=null] - Short description for AI and UX hints.
	 * @property {PipeNodePosition} [position={x:0,y:0}] - Canvas coordinates.
	 * @property {PipeConnection[]} [inputs=[]] - Incoming edges defining data requirements.
	 * @property {PipeConnection[]} [outputs=[]] - Outgoing edges defining produced data structure.
	 * @property {Object} [config] - Node runtime configuration.
	 */

	/**
	 * Construct a new pipeline node.
	 * @param {PipeNodeInit} [init={}] Initial properties for the node.
	 */
	constructor(init = {}) {
		/** @type {string} */
		this.id = init.id || nanoid();

		/** @type {string} */
		this.type = init.type || "manual_input";

		/** @type {string} */
		this.title = init.title || this.getDefaultTitle(this.type);

		/** @type {string|null} */
		this.summary = init.summary || null;

		/** @type {PipeNodePosition} */
		this.position = init.position || { x: 0, y: 0 };

		/** @type {PipeConnection[]} */
		this.inputs = init.inputs || [];

		/** @type {PipeConnection[]} */
		this.outputs = init.outputs || [];

		/** @type {Object} */
		this.config = this.createConfig(this.type, init.config);
	}

	static titles = Object.freeze({
		[NodeType.MANUAL_INPUT]: "Manual Input",
		[NodeType.HTTP_REQUEST]: "HTTP Request",
		[NodeType.WEBHOOK]: "Webhook",
		[NodeType.FILE_WATCH]: "File Watcher",
		[NodeType.FILTER]: "Filter",
		[NodeType.TRANSFORM]: "Transform",
		[NodeType.PARSE]: "Parse",
		[NodeType.AI_PROCESSOR]: "AI Processor",
		[NodeType.CONDITION]: "Condition",
		[NodeType.SWITCH]: "Switch",
		[NodeType.JOIN]: "Join",
		[NodeType.SPLIT]: "Split",
		[NodeType.DEDUPLICATE]: "Deduplicate",
		[NodeType.VALIDATE]: "Validate",
		[NodeType.AGGREGATE]: "Aggregate",
		[NodeType.SORT]: "Sort",
		[NodeType.LOOP]: "Loop",
		[NodeType.UNTIL_LOOP]: "Until Loop",
		[NodeType.REGEX_PATTERN]: "Regex Pattern",
		[NodeType.FORMAT]: "Format",
		[NodeType.STRING_BUILDER]: "String Builder",
		[NodeType.URL_BUILDER]: "URL Builder",
		[NodeType.LOOKUP]: "Lookup",
		[NodeType.UNION]: "Union",
		[NodeType.INTERSECT]: "Intersect",
		[NodeType.DISTINCT]: "Distinct",
		[NodeType.CUSTOM_CODE]: "Custom Code",
		[NodeType.DOWNLOAD]: "Download",
		[NodeType.FILE_APPEND]: "File Append",
		[NodeType.HTTP_POST]: "HTTP POST",
		[NodeType.SEND_EMAIL]: "Send Email",
		[NodeType.EXTENSION_DATA]: "Extension Data",
	});

	static configs = Object.freeze({
		[NodeType.MANUAL_INPUT]: (init) => new ManualInputConfig(init),
		[NodeType.HTTP_REQUEST]: (init) => new HttpRequestConfig(init),
		[NodeType.WEBHOOK]: (init) => new WebhookConfig(init),
		[NodeType.FILE_WATCH]: (init) => new FileWatchConfig(init),
		[NodeType.FILTER]: (init) => new FilterConfig(init),
		[NodeType.TRANSFORM]: (init) => new TransformConfig(init),
		[NodeType.PARSE]: (init) => new ParseConfig(init),
		[NodeType.AI_PROCESSOR]: (init) => new AiProcessorConfig(init),
		[NodeType.CONDITION]: (init) => new ConditionConfig(init),
		[NodeType.SWITCH]: (init) => new SwitchConfig(init),
		[NodeType.JOIN]: (init) => new JoinConfig(init),
		[NodeType.SPLIT]: (init) => new SplitConfig(init),
		[NodeType.DEDUPLICATE]: (init) => new DeduplicateConfig(init),
		[NodeType.VALIDATE]: (init) => new ValidateConfig(init),
		[NodeType.AGGREGATE]: (init) => new AggregateConfig(init),
		[NodeType.SORT]: (init) => new SortConfig(init),
		[NodeType.LOOP]: (init) => new LoopConfig(init),
		[NodeType.UNTIL_LOOP]: (init) => new UntilLoopConfig(init),
		[NodeType.REGEX_PATTERN]: (init) => new RegexPatternConfig(init),
		[NodeType.FORMAT]: (init) => new FormatConfig(init),
		[NodeType.STRING_BUILDER]: (init) => new StringBuilderConfig(init),
		[NodeType.URL_BUILDER]: (init) => new UrlBuilderConfig(init),
		[NodeType.LOOKUP]: (init) => new LookupConfig(init),
		[NodeType.UNION]: (init) => new UnionConfig(init),
		[NodeType.INTERSECT]: (init) => new IntersectConfig(init),
		[NodeType.DISTINCT]: (init) => new DistinctConfig(init),
		[NodeType.CUSTOM_CODE]: (init) => new CustomCodeConfig(init),
		[NodeType.DOWNLOAD]: (init) => new DownloadConfig(init),
		[NodeType.FILE_APPEND]: (init) => new FileAppendConfig(init),
		[NodeType.HTTP_POST]: (init) => new HttpPostConfig(init),
		[NodeType.SEND_EMAIL]: (init) => new SendEmailConfig(init),
	});

	getDefaultTitle(type) {
		return PipeNode.titles[type] || type;
	}

	createConfig(type, initConfig = {}) {
		return PipeNode.configs[type] ? PipeNode.configs[type]() : initConfig;
	}

	get properties() {
		const props = new Set();
		this.inputs.forEach(
			(input) => input.inputSchema && Object.keys(input.inputSchema).forEach((key) => props.add(key))
		);
		return Array.from(props);
	}
}
