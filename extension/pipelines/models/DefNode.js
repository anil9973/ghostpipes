import { NodeType } from "./PipeNode.js";

/**@enum {string} */
export const NodeTypeTitles = Object.freeze({
	[NodeType.MANUAL_INPUT]: "Manual Input",
	[NodeType.HTTP_REQUEST]: "HTTP Request",
	[NodeType.SCHEDULED_HTTP]: "Scheduled HTTP",
	[NodeType.WEBHOOK]: "Webhook",
	[NodeType.TAB_VISIT]: "Tab Visit",
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
	[NodeType.EXTENSION_DATA]: "Extension Data",
	[NodeType.COPY]: "Copy",
	[NodeType.DRIVE_UPLOAD]: "Upload to Drive",
	[NodeType.EMAIL_SEND]: "Send Email",
	[NodeType.DATABASE_WRITE]: "Database Write",
});

/**@enum {string} */
export const NodeTypeSubtitles = Object.freeze({
	// Manual input
	[NodeType.MANUAL_INPUT]: "Paste text / Upload file",
	[NodeType.EXTENSION_DATA]: "Selected data from extension",

	// HTTP & triggers
	[NodeType.SCHEDULED_HTTP]: "Fetch data on a recurring schedule",
	[NodeType.HTTP_REQUEST]: "One-time fetch",
	[NodeType.TAB_VISIT]: "Auto trigger on tab visit",

	// Standalone event receivers
	[NodeType.FILE_WATCH]: "Monitor folder for new files",
	[NodeType.WEBHOOK]: "Receive POST data (Auto-generated URL)",

	// Common Data Ops
	[NodeType.FILTER]: "Remove unwanted data",
	[NodeType.TRANSFORM]: "Change format/structure",
	[NodeType.JOIN]: "Combine datasets",
	[NodeType.SPLIT]: "Divide data",
	[NodeType.DEDUPLICATE]: "Remove duplicates",
	[NodeType.VALIDATE]: "Check data quality",
	[NodeType.CONDITION]: "Conditional",
	[NodeType.AGGREGATE]: "Calculate stats (SUM, AVG, COUNT, MIN, MAX)",
	[NodeType.LOOKUP]: "Lookup/Enrich",
	[NodeType.PARSE]: "Extract from JSON/HTML/CSV",
	[NodeType.FORMAT]: "Output formatting",

	// Advanced Data Ops / Set Ops / Control Flow
	[NodeType.UNION]: "Union operation",
	[NodeType.INTERSECT]: "Intersect operation",
	[NodeType.DISTINCT]: "Distinct rows",
	[NodeType.STRING_BUILDER]: "String operations (substring, concat, regex)",
	[NodeType.LOOP]: "Loop/Iterate",
	[NodeType.UNTIL_LOOP]: "Until loop",

	// File operations
	[NodeType.FILE_APPEND]: "Append to File",
	// Custom logic
	[NodeType.CUSTOM_CODE]: "Custom code (JavaScript)",
	// Outputs
	[NodeType.DOWNLOAD]: "Download file",
	// AI
	[NodeType.AI_PROCESSOR]: "Ask AI to build pipeline",
	[NodeType.COPY]: "Write to clipboard",
	[NodeType.DRIVE_UPLOAD]: "Upload to online drive (GDrive, Dropbox, etc.)",
	[NodeType.EMAIL_SEND]: "Send email",
	[NodeType.DATABASE_WRITE]: "Write to database (coming soon)",
	[NodeType.HTTP_POST]: "Custom HTTP POST request",
});

/** Nodes where pipeline starts: user/manual data input */
export const ManualInputNodes = Object.freeze([NodeType.MANUAL_INPUT, NodeType.EXTENSION_DATA]);

/** HTTP & external fetch triggers */
export const HttpNodes = Object.freeze([NodeType.HTTP_REQUEST, NodeType.HTTP_POST]);

/** Autonomous nodes (no upstream input needed) */
export const AutoTriggerNodes = Object.freeze([
	NodeType.SCHEDULED_HTTP,
	NodeType.TAB_VISIT,
	NodeType.FILE_WATCH,
	NodeType.WEBHOOK,
]);

/** Most common ETL data operations */
export const CommonDataOps = Object.freeze([
	NodeType.FILTER,
	NodeType.TRANSFORM,
	NodeType.JOIN,
	NodeType.SPLIT,
	NodeType.DEDUPLICATE,
	NodeType.VALIDATE,
	NodeType.AGGREGATE,
	NodeType.LOOKUP,
	NodeType.CONDITION,
	NodeType.PARSE,
	NodeType.FORMAT,
	NodeType.SORT,
]);

/** Advanced processing / control-flow */
export const AdvancedDataOps = Object.freeze([
	NodeType.UNION,
	NodeType.INTERSECT,
	NodeType.DISTINCT,
	NodeType.STRING_BUILDER,
	NodeType.LOOP,
	NodeType.UNTIL_LOOP,
	NodeType.FILE_APPEND,
	NodeType.CUSTOM_CODE,
	NodeType.AI_PROCESSOR, // from your AI plumber node
]);

export const OutputNodes = Object.freeze([
	NodeType.DOWNLOAD,
	NodeType.COPY,
	NodeType.FILE_APPEND,
	NodeType.DRIVE_UPLOAD,
	NodeType.EMAIL_SEND,
	NodeType.DATABASE_WRITE,
	NodeType.HTTP_POST,
]);

export class DefNode {
	/** @param {NodeType} type*/
	constructor(type) {
		this.type = type;
		this.iconId = type.replace(/_/, "-"); // auto-convert for icons;
		this.title = NodeTypeTitles[type];
		this.subtitle = NodeTypeSubtitles[type];
	}
}
