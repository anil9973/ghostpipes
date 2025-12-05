./input/FileWatchConfig.js
```js
/**
 * @fileoverview File watch input node configuration
 * @module pipelines/models/configs/input/FileWatchConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/**
 * Types of file system events to watch for
 * @enum {string}
 */
export const WatchType = {
	MODIFIED: "modified",
	CREATED: "created",
	DELETED: "deleted",
};

/**
 * Configuration for file watch input node
 * Monitors a directory for file changes and triggers pipeline execution
 *
 * @extends BaseConfig
 */
export class FileWatchConfig extends BaseConfig {
	/**
	 * Create a file watch configuration
	 *
	 * @param {Object} [init={}] - Initial configuration values
	 * @param {FileSystemDirectoryHandle} [init.directoryHandle] - File system directory handle
	 * @param {string} [init.directoryName] - Human-readable directory name
	 * @param {string[]} [init.watchMimeTypes] - Array of MIME types to watch for
	 * @param {string} [init.watchType] - Type of file system event to watch (modified, created, deleted)
	 */
	constructor(init = {}) {
		super();

		/** @type {FileSystemDirectoryHandle|null} Directory handle from File System Access API */
		this.directoryHandle = init.directoryHandle || null;

		/** @type {string} Human-readable directory label for UI display */
		this.directoryName = init.directoryName || "";

		/** @type {string[]} MIME types allowed to trigger pipeline */
		this.watchMimeTypes = init.watchMimeTypes || ["text/csv", "text/plain", "application/json"];

		/** @type {WatchType} File system event type to monitor */
		this.watchType = init.watchType || WatchType.MODIFIED;
	}

	/**
	 * Get the schema definition for validation
	 *
	 * @returns {Object} Schema object with field definitions
	 */
	getSchema() {
		return {
			directoryName: {
				type: "string",
				required: true,
				minLength: 1,
				validator: (value) => {
					// Directory name is required if directoryHandle is not set
					return value.length > 0 || this.directoryHandle !== null;
				},
			},
			watchMimeTypes: {
				type: "array",
				required: true,
				minLength: 1,
			},
			watchType: {
				type: "string",
				required: true,
				enum: Object.values(WatchType),
			},
		};
	}

	/**
	 * Get a human-readable summary of the configuration
	 *
	 * @returns {string} Summary text
	 */
	getSummary() {
		return this.directoryName ? `Watching: ${this.directoryName}` : "No directory selected";
	}
}

```

./input/ManualInputConfig.js
```js
/**
 * @fileoverview Manual input node configuration
 * @module pipelines/models/configs/input/ManualInputConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Allowed MIME types for manual input */
export const AllowedMimeTypes = {
	TEXT_PLAIN: "text/plain",
	TEXT_CSV: "text/csv",
	APPLICATION_JSON: "application/json",
	TEXT_HTML: "text/html",
	APPLICATION_XML: "application/xml",
};

/** Configuration for manual input node */
export class ManualInputConfig extends BaseConfig {
	/**
	 * @param {Object} [init]
	 * @param {string[]} [init.allowedMimeTypes]
	 * @param {string} [init.data]
	 */
	constructor(init = {}) {
		super();

		/** @type {string[]} Allowed MIME types for file uploads */
		this.allowedMimeTypes = init.allowedMimeTypes || [
			AllowedMimeTypes.TEXT_PLAIN,
			AllowedMimeTypes.TEXT_CSV,
			AllowedMimeTypes.APPLICATION_JSON,
		];

		/** @type {string} Input text or file content */
		this.data = init.data || "";
	}

	/** @returns {Object} Schema definition for validation */
	getSchema() {
		return {
			allowedMimeTypes: {
				type: "array",
				required: true,
				minLength: 1,
			},
			data: {
				type: "string",
				required: false,
			},
		};
	}

	/** @returns {string} Human-readable summary */
	getSummary() {
		return `Manual input (${this.allowedMimeTypes.length} types)`;
	}
}

```

./input/WebhookConfig.js
```js
/**
 * @fileoverview Webhook input node configuration
 * @module pipelines/models/configs/input/WebhookConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} HTTP methods supported by webhook endpoints */
export const WebhookMethod = {
	GET: "GET",
	POST: "POST",
	PUT: "PUT",
	DELETE: "DELETE",
	PATCH: "PATCH",
};

/** Configuration for webhook input node */
export class WebhookConfig extends BaseConfig {
	/**
	 * @param {Object} [init]
	 * @param {string} [init.webhookId]
	 * @param {string} [init.method]
	 * @param {string} [init.secret]
	 */
	constructor(init = {}) {
		super();

		/** @type {string} Unique identifier for the webhook endpoint */
		this.webhookId = init.webhookId || crypto.randomUUID();

		/** @type {string} HTTP method to accept */
		this.method = init.method || WebhookMethod.POST;

		/** @type {string} Optional secret for authentication */
		this.secret = init.secret || "";
	}

	/** @returns {Object} Schema definition for validation */
	getSchema() {
		return {
			webhookId: {
				type: "string",
				required: true,
				minLength: 1,
			},
			method: {
				type: "string",
				required: true,
				enum: Object.values(WebhookMethod),
			},
			secret: {
				type: "string",
				required: false,
			},
		};
	}

	/** @returns {string} Human-readable summary */
	getSummary() {
		return `Webhook ID: ...${this.webhookId.slice(-6)}`;
	}
}

```

./input/HttpRequestConfig.js
```js
/**
 * @fileoverview HTTP request node configuration
 * @module pipelines/models/configs/input/HttpRequestConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/**
 * HTTP methods supported by the HTTP request node
 * @enum {string}
 */
export const HttpMethod = {
	GET: "GET",
	POST: "POST",
	PUT: "PUT",
	DELETE: "DELETE",
	PATCH: "PATCH",
};

/**
 * HTTP header key-value pair
 */
export class HttpHeader {
	/**
	 * Create an HTTP header
	 *
	 * @param {Object} [init={}] - Initial values
	 * @param {string} [init.key] - Header name
	 * @param {string} [init.value] - Header value
	 */
	constructor(init = {}) {
		/**
		 * Header name (e.g., "Content-Type", "Authorization")
		 * @type {string}
		 * @default ""
		 */
		this.key = init.key || "";

		/**
		 * Header value
		 * @type {string}
		 * @default ""
		 */
		this.value = init.value || "";
	}
}

/**
 * URL query parameter key-value pair
 */
export class QueryParam {
	/**
	 * Create a query parameter
	 *
	 * @param {Object} [init={}] - Initial values
	 * @param {string} [init.key] - Parameter name
	 * @param {string} [init.value] - Parameter value
	 */
	constructor(init = {}) {
		/**
		 * Query parameter name
		 * @type {string}
		 * @default ""
		 */
		this.key = init.key || "";

		/**
		 * Query parameter value
		 * @type {string}
		 * @default ""
		 */
		this.value = init.value || "";
	}
}

/**
 * Configuration for HTTP request node
 * Fetches data from external HTTP endpoints
 *
 * @extends BaseConfig
 */
export class HttpRequestConfig extends BaseConfig {
	/**
	 * Create an HTTP request configuration
	 *
	 * @param {Object} [init={}] - Initial configuration values
	 * @param {string} [init.method] - HTTP method (GET, POST, etc.)
	 * @param {string} [init.url] - Target URL
	 * @param {Array<Object>} [init.headers] - HTTP headers
	 * @param {Array<Object>} [init.queryParams] - URL query parameters
	 * @param {string} [init.body] - Request body (for POST, PUT, PATCH)
	 * @param {number} [init.timeout] - Request timeout in milliseconds
	 */
	constructor(init = {}) {
		super();

		/** @type {string} HTTP method */
		this.method = init.method || HttpMethod.GET;

		/** @type {string} Target request URL */
		this.url = init.url || "";

		/** @type {HttpHeader[]} List of HTTP headers */
		this.headers = (init.headers || []).map((h) => new HttpHeader(h));

		/** @type {QueryParam[]} Query parameters to append */
		this.queryParams = (init.queryParams || []).map((q) => new QueryParam(q));

		/** @type {string} Raw request body */
		this.body = init.body || "";

		/** @type {number} Request timeout in milliseconds */
		this.timeout = init.timeout || 10000;
	}

	/**
	 * Get the schema definition for validation
	 *
	 * @returns {Object} Schema object with field definitions
	 */
	getSchema() {
		return {
			method: {
				type: "string",
				required: true,
				enum: Object.values(HttpMethod),
			},
			url: {
				type: "string",
				required: true,
				format: "url",
			},
			headers: {
				type: "array",
				required: false,
			},
			queryParams: {
				type: "array",
				required: false,
			},
			body: {
				type: "string",
				required: false,
			},
			timeout: {
				type: "number",
				required: false,
				min: 1000,
				max: 300000,
			},
		};
	}

	/**
	 * Get a human-readable summary of the configuration
	 *
	 * @returns {string} Summary text
	 */
	getSummary() {
		return this.url ? `${this.method} ${this.url}` : "No URL configured";
	}
}

```

./output/HttpPostConfig.js
```js
/**
 * @fileoverview HTTP POST node configuration
 * @module pipelines/models/configs/output/HttpPostConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} HTTP methods */
export const HttpMethod = {
	GET: "GET",
	POST: "POST",
	PUT: "PUT",
	DELETE: "DELETE",
	PATCH: "PATCH",
};

/**
 * Helper class for HTTP headers
 * Represents a key-value pair for HTTP request headers
 */
export class HttpHeader {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.key] - Header key
	 * @param {string} [init.value] - Header value
	 */
	constructor(init = {}) {
		this.key = init.key || "";
		this.value = init.value || "";
	}
}

/** @enum {string} Supported HTTP body content types */
export const HttpContentType = {
	JSON: "application/json",
	FORM_URLENCODED: "application/x-www-form-urlencoded",
	FORM_DATA: "multipart/form-data",
	TEXT: "text/plain",
	XML: "application/xml",
	CSV: "text/csv",
	HTML: "text/html",
	MARKDOWN: "text/markdown",
};

/**
 * Helper class for body fields
 * Represents a key-value pair for request body
 */
export class BodyField {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.key] - Field key
	 * @param {string} [init.value] - Field value
	 */
	constructor(init = {}) {
		this.key = init.key || "";
		this.value = init.value || "";
	}
}

/**
 * Configuration for HTTP POST node
 * Sends data to an HTTP endpoint
 */
export class HttpPostConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.method] - HTTP method (GET, POST, PUT, DELETE, PATCH)
	 * @param {string} [init.url] - Target URL
	 * @param {Array<Object>} [init.headers] - HTTP headers
	 * @param {string} [init.contentType] - Content type (json, form)
	 * @param {Array<Object>} [init.bodyFields] - Body fields for form data
	 * @param {string} [init.rawBody] - Raw body content
	 */
	constructor(init = {}) {
		super();
		/** @type {HttpMethod} HTTP request method */
		this.method = init.method || HttpMethod.POST;

		/** @type {string} Target request URL */
		this.url = init.url || "";

		/** @type {HttpHeader[]} Request headers */
		this.headers = (init.headers || []).map((h) => new HttpHeader(h));

		/** @type {HttpContentType} How the request body is encoded */
		this.contentType = init.contentType || HttpContentType.JSON;

		/** @type {BodyField[]} Structured form fields (only valid for FORM contentType) */
		this.bodyFields = (init.bodyFields || []).map((b) => new BodyField(b));

		/** @type {string} Raw JSON/custom payload for JSON or advanced requests */
		this.rawBody = init.rawBody || "";
	}

	getSchema() {
		return {
			method: {
				type: "string",
				required: false,
				enum: Object.values(HttpMethod),
			},
			url: {
				type: "string",
				required: true,
				format: "url",
			},
			headers: {
				type: "array",
				required: false,
			},
			contentType: {
				type: "string",
				required: false,
				enum: ["json", "form"],
			},
			bodyFields: {
				type: "array",
				required: false,
			},
			rawBody: {
				type: "string",
				required: false,
			},
		};
	}

	getSummary() {
		return this.url ? `${this.method} ${this.url}` : "No URL configured";
	}
}

```

./output/SendEmailConfig.js
```js
/**
 * @fileoverview Send email node configuration
 * @module pipelines/models/configs/output/SendEmailConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/**
 * Configuration for send email node
 * Sends pipeline results via email
 */
export class SendEmailConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {Array<string>} [init.recipients] - Email recipients
	 * @param {string} [init.subject] - Email subject line
	 * @param {string} [init.body] - Email body content
	 * @param {string} [init.bodyTemplate] - Template for email body
	 */
	constructor(init = {}) {
		super();
		/** @type {string[]} Email addresses to deliver to */
		this.recipients = init.recipients || [];

		/** @type {string} Subject line for the message */
		this.subject = init.subject || "Pipeline Results";

		/** @type {string} Raw email body */
		this.body = init.body || "";

		/** @type {string} Template with variable substitution support */
		this.bodyTemplate = init.bodyTemplate || "";
	}

	getSchema() {
		return {
			recipients: {
				type: "array",
				required: true,
				minLength: 1,
			},
			subject: {
				type: "string",
				required: false,
			},
			body: {
				type: "string",
				required: false,
			},
			bodyTemplate: {
				type: "string",
				required: false,
			},
		};
	}

	getSummary() {
		const count = this.recipients.length;
		return count === 1 ? `Email to ${this.recipients[0]}` : `Email to ${count} recipients`;
	}
}

```

./output/DownloadConfig.js
```js
/**
 * @fileoverview Download node configuration
 * @module pipelines/models/configs/output/DownloadConfig
 */

import { BaseConfig } from "../../BaseConfig.js";
import { FormatOutput } from "../processing/FormatConfig.js";

/**
 * Configuration for download node
 * Downloads data as a file to the user's device
 */
export class DownloadConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.filename] - Name of the file to download
	 * @param {string} [init.format] - Output format (json, csv, xml, text, custom)
	 */
	constructor(init = {}) {
		super();
		/** @type {string} Output filename */
		this.filename = init.filename || "data.json";

		/** @type {FormatOutput} File format for serialization */
		this.format = init.format || FormatOutput.JSON;
	}

	getSchema() {
		return {
			filename: {
				type: "string",
				required: true,
				minLength: 1,
			},
			format: {
				type: "string",
				required: false,
				enum: Object.values(FormatOutput),
			},
		};
	}

	getSummary() {
		return `Download ${this.filename}`;
	}
}

```

./output/FileAppendConfig.js
```js
/**
 * @fileoverview File append node configuration
 * @module pipelines/models/configs/output/FileAppendConfig
 */

import { BaseConfig } from "../../BaseConfig.js";
import { FormatOutput } from "../processing/FormatConfig.js";

/**
 * Configuration for file append node
 * Appends data to a file on the filesystem
 */
export class FileAppendConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.path] - File path to append to
	 * @param {string} [init.format] - Output format (json, csv, xml, text, custom)
	 * @param {boolean} [init.createIfMissing] - Create file if it doesn't exist
	 * @param {boolean} [init.addHeader] - Add header row for CSV files
	 * @param {string} [init.encoding] - File encoding (utf8, ascii, etc.)
	 */
	constructor(init = {}) {
		super();
		/** @type {string} Target file path or storage key */
		this.path = init.path || "";

		/** @type {FormatOutput} Output serialization format */
		this.format = init.format || FormatOutput.CSV;

		/** @type {boolean} Auto-create file if missing */
		this.createIfMissing = init.createIfMissing ?? true;

		/** @type {boolean} Add header row when writing CSV files */
		this.addHeader = init.addHeader ?? true;

		/** @type {string} File encoding type */
		this.encoding = init.encoding || "utf8";
	}

	getSchema() {
		return {
			path: {
				type: "string",
				required: true,
				minLength: 1,
			},
			format: {
				type: "string",
				required: false,
				enum: Object.values(FormatOutput),
			},
			createIfMissing: {
				type: "boolean",
				required: false,
			},
			addHeader: {
				type: "boolean",
				required: false,
			},
			encoding: {
				type: "string",
				required: false,
			},
		};
	}

	getSummary() {
		return this.path ? `Append to ${this.path}` : "No file path";
	}
}

```

./processing/AiProcessorConfig.js
```js
/**
 * @fileoverview AI Processor node configuration for AI-powered data processing
 * @module pipelines/models/configs/processing/AiProcessorConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** AI Processor configuration for AI-powered transformations */
export class AiProcessorConfig extends BaseConfig {
	/** @param {Object} init - Initial configuration */
	constructor(init = {}) {
		super();
		/** @type {string} AI prompt template */
		this.prompt = init.prompt || "";
		/** @type {string} Input data format */
		this.inputFormat = init.inputFormat || "json";
		/** @type {string} Output data format */
		this.outputFormat = init.outputFormat || "json";
		/** @type {string} AI model to use */
		this.model = init.model || "gemini-pro";
		/** @type {number} Temperature for AI generation (0-1) */
		this.temperature = init.temperature || 0.7;
		/** @type {number} Maximum tokens to generate */
		this.maxTokens = init.maxTokens || 1000;
	}

	/** @returns {Object} Schema definition for validation */
	getSchema() {
		return {
			prompt: {
				type: "string",
				required: true,
				minLength: 1,
			},
			inputFormat: {
				type: "string",
				required: false,
			},
			outputFormat: {
				type: "string",
				required: false,
			},
			model: {
				type: "string",
				required: false,
			},
			temperature: {
				type: "number",
				required: false,
				min: 0,
				max: 1,
			},
			maxTokens: {
				type: "number",
				required: false,
				min: 1,
			},
		};
	}

	/** @returns {string} Human-readable summary */
	getSummary() {
		return this.prompt ? `AI: ${this.prompt.substring(0, 30)}...` : "AI Processor";
	}
}

```

./processing/StringBuilderConfig.js
```js
/**
 * @fileoverview String builder node configuration
 * @module pipelines/models/configs/processing/StringBuilderConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/**
 * Helper class for string parts
 * Represents a part of the string (text literal or field reference)
 */
export class StringPart {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.type] - Part type (text or field)
	 * @param {string} [init.value] - Part value (literal text or field name)
	 */
	constructor(init = {}) {
		this.type = init.type || "text";
		this.value = init.value || "";
	}
}

/**
 * Configuration for string builder node
 * Builds strings from text literals and field values
 */
export class StringBuilderConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {Array<Object>} [init.parts] - Array of string parts
	 */
	constructor(init = {}) {
		super();
		this.parts = (init.parts || []).map((p) => new StringPart(p));
	}

	getSchema() {
		return {
			parts: { type: "array", required: true, minLength: 1 },
		};
	}

	getSummary() {
		return `Build string (${this.parts.length} parts)`;
	}
}

```

./processing/DeduplicateConfig.js
```js
/**
 * @fileoverview Deduplicate node configuration
 * @module pipelines/models/configs/processing/DeduplicateConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Deduplicate scope types */
export const DeduplicateScope = {
	FIELD: "field",
	FULL: "full",
};

/** @enum {string} Which duplicate instance to keep */
export const DeduplicateKeep = {
	FIRST: "first",
	LAST: "last",
};

/**
 * Configuration for deduplicate node
 * Removes duplicate items based on field values or full object comparison
 */
export class DeduplicateConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.scope] - Deduplicate scope (field, full)
	 * @param {string[]} [init.fields] - Fields to compare for uniqueness
	 * @param {string} [init.keep] - Which duplicate to keep (first, last)
	 * @param {boolean} [init.ignoreCase] - Ignore case when comparing strings
	 */
	constructor(init = {}) {
		super();
		/** @type {DeduplicateScope} Comparison scope */
		this.scope = init.scope || DeduplicateScope.FIELD;

		/** @type {string[]} Fields to compare if scope = FIELD */
		this.fields = init.fields || [];

		/** @type {DeduplicateKeep} Which duplicate to preserve */
		this.keep = init.keep || DeduplicateKeep.FIRST;

		/** @type {boolean} Ignore case when comparing string values */
		this.ignoreCase = init.ignoreCase ?? true;
	}

	getSchema() {
		return {
			scope: {
				type: "string",
				required: true,
				enum: Object.values(DeduplicateScope),
			},
			fields: {
				type: "array",
				required: false,
			},
			keep: {
				type: "string",
				required: true,
				enum: ["first", "last"],
			},
			ignoreCase: {
				type: "boolean",
				required: false,
			},
		};
	}

	validate() {
		const errors = super.validate();
		if (this.scope === DeduplicateScope.FIELD && this.fields.length === 0)
			errors.push("At least one field is required for field scope");
		return errors;
	}

	getSummary() {
		return this.scope === DeduplicateScope.FIELD && this.fields.length > 0
			? `Unique by [${this.fields.join(", ")}]`
			: `Unique by ${this.scope}`;
	}
}

```

./processing/FilterConfig.js
```js
/**
 * @fileoverview Filter node configuration with rule-based filtering
 * @module pipelines/models/configs/processing/FilterConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Filter mode - permit or block matching items */
export const FilterMode = {
	PERMIT: "permit",
	BLOCK: "block",
};

/** @enum {string} Match type - all rules or any rule */
export const MatchType = {
	ALL: "all",
	ANY: "any",
};

/** @enum {string} Comparison operators for filter rules */
export const ComparisonOperator = {
	EQUALS: "==",
	NOT_EQUALS: "!=",
	GREATER_THAN: ">",
	LESS_THAN: "<",
	GREATER_EQUAL: ">=",
	LESS_EQUAL: "<=",
	CONTAINS: "contains",
	MATCHES: "matches",
	STARTS_WITH: "startsWith",
	ENDS_WITH: "endsWith",
};

/** Filter rule helper class */
export class FilterRule {
	/** @param {Object} init - Initial values */
	constructor(init = {}) {
		/** @type {string} Field to evaluate */
		this.field = init.field || "";
		/** @type {string} Comparison operator */
		this.operator = init.operator || ComparisonOperator.EQUALS;
		/** @type {*} Value to compare against */
		this.value = init.value || "";
		this.enabled = init.enabled ?? true;
	}
}

/** Filter configuration for permit/block filtering with rules */
export class FilterConfig extends BaseConfig {
	/** @param {Object} init - Initial configuration */
	constructor(init = {}) {
		super();
		/** @type {string} Filter mode (permit or block) */
		this.mode = init.mode || FilterMode.PERMIT;
		/** @type {string} Match type (all or any) */
		this.matchType = init.matchType || MatchType.ALL;
		/** @type {FilterRule[]} Array of filter rules */
		this.rules = (init.rules || []).map((r) => new FilterRule(r));
	}

	/** @returns {Object} Schema definition for validation */
	getSchema() {
		return {
			mode: {
				type: "string",
				required: true,
				enum: Object.values(FilterMode),
			},
			matchType: {
				type: "string",
				required: true,
				enum: Object.values(MatchType),
			},
			rules: {
				type: "array",
				required: true,
				minLength: 1,
			},
		};
	}

	/** @returns {string} Human-readable summary */
	getSummary() {
		const count = this.rules.filter((r) => r.field && r.value).length;
		if (count === 0) return "No rules";
		const logic = this.matchType === MatchType.ALL ? "AND" : "OR";
		return `${this.mode.toUpperCase()} where (${count} rules via ${logic})`;
	}
}

```

./processing/SwitchConfig.js
```js
/**
 * @fileoverview Switch node configuration
 * @module pipelines/models/configs/processing/SwitchConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/**
 * Configuration for switch node
 * Routes data to different outputs based on field value
 */
export class SwitchConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.switchField] - Field to switch on
	 * @param {Object} [init.cases] - Map of case values to output names
	 * @param {string} [init.defaultCase] - Default output name if no case matches
	 */
	constructor(init = {}) {
		super();
		/** @type {string} Field to inspect for routing */
		this.switchField = init.switchField || "";

		/** @type {Record<string, string>} Case value → output name map */
		this.cases = init.cases || {};

		/** @type {string|null} Output used when no case matches */
		this.defaultCase = init.defaultCase || null;
	}

	getSchema() {
		return {
			switchField: {
				type: "string",
				required: true,
				minLength: 1,
			},
			cases: {
				type: "object",
				required: false,
			},
			defaultCase: {
				type: "string",
				required: false,
			},
		};
	}

	getSummary() {
		return this.switchField ? `Switch on ${this.switchField}` : "No switch field";
	}
}

```

./processing/UrlBuilderConfig.js
```js
/**
 * @fileoverview URL builder node configuration
 * @module pipelines/models/configs/processing/UrlBuilderConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/**
 * Helper class for query parameters
 * Represents a key-value pair for URL query strings
 */
export class QueryParam {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.key] - Query parameter key
	 * @param {string} [init.value] - Query parameter value
	 */
	constructor(init = {}) {
		/** @type {string} Query parameter key */
		this.key = init.key || "";

		/** @type {string} Query parameter value */
		this.value = init.value || "";
	}
}

/**
 * Configuration for URL builder node
 * Constructs URLs from base URL, path segments, and query parameters
 */
export class UrlBuilderConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.baseUrl] - Base URL (e.g., https://api.example.com)
	 * @param {Array<string>} [init.pathSegments] - Path segments to append
	 * @param {Array<Object>} [init.queryParams] - Query parameters
	 */
	constructor(init = {}) {
		super();
		/** @type {string} Base URL (e.g. https://api.example.com) */
		this.baseUrl = init.baseUrl || "";

		/** @type {string[]} Path segments to append */
		this.pathSegments = init.pathSegments || [];

		/** @type {QueryParam[]} Query parameters list */
		this.queryParams = (init.queryParams || []).map((q) => new QueryParam(q));
	}

	getSchema() {
		return {
			baseUrl: {
				type: "string",
				required: true,
				format: "url",
			},
			pathSegments: {
				type: "array",
				required: false,
			},
			queryParams: {
				type: "array",
				required: false,
			},
		};
	}

	getSummary() {
		return this.baseUrl || "URL Builder";
	}
}

```

./processing/UntilLoopConfig.js
```js
/**
 * @fileoverview Until loop node configuration
 * @module pipelines/models/configs/processing/UntilLoopConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Timeout action types */
export const TimeoutAction = {
	FAIL: "fail",
	CONTINUE: "continue",
	SKIP: "skip",
};

/**
 * Configuration for until loop node
 * Loops until a condition is met or timeout/max iterations reached
 */
export class UntilLoopConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.condition] - Condition expression to evaluate
	 * @param {number} [init.maxIterations] - Maximum iterations allowed
	 * @param {number} [init.timeout] - Timeout in seconds
	 * @param {string} [init.onTimeout] - Action on timeout (skip, fail, tag)
	 */
	constructor(init = {}) {
		super();
		/** @type {string} Condition expression to evaluate each iteration */
		this.condition = init.condition || "";

		/** @type {number} Maximum allowed iterations */
		this.maxIterations = init.maxIterations || 100;

		/** @type {number} Timeout in seconds before triggering onTimeout */
		this.timeout = init.timeout || 300;

		/** @type {TimeoutAction} Action to take upon timeout */
		this.onTimeout = init.onTimeout || TimeoutAction.FAIL;
	}

	getSchema() {
		return {
			condition: {
				type: "string",
				required: true,
			},
			maxIterations: {
				type: "number",
				required: false,
				min: 1,
			},
			timeout: {
				type: "number",
				required: false,
				min: 1,
			},
			onTimeout: {
				type: "string",
				required: false,
				enum: Object.values(TimeoutAction),
			},
		};
	}

	getSummary() {
		return `Until loop (max ${this.maxIterations} runs)`;
	}
}

```

./processing/ConditionConfig.js
```js
/**
 * @fileoverview Condition node configuration for conditional routing
 * @module pipelines/models/configs/processing/ConditionConfig
 */

import { BaseConfig } from "../../BaseConfig.js";
import { FilterRule } from "./FilterConfig.js";

/** @enum {string} Logic operators for combining rules */
export const LogicOperator = {
	AND: "AND",
	OR: "OR",
};

/** Condition configuration for conditional data routing */
export class ConditionConfig extends BaseConfig {
	/** @param {Object} init - Initial configuration */
	constructor(init = {}) {
		super();
		/** @type {string} Logic operator for combining rules */
		this.logic = init.logic || LogicOperator.AND;
		/** @type {FilterRule[]} Array of condition rules */
		this.rules = (init.rules || []).map((r) => new FilterRule(r));
	}

	/** @returns {Object} Schema definition for validation */
	getSchema() {
		return {
			logic: {
				type: "string",
				required: true,
				enum: Object.values(LogicOperator),
			},
			rules: {
				type: "array",
				required: true,
				minLength: 1,
			},
		};
	}

	/** @returns {string} Human-readable summary */
	getSummary() {
		const count = this.rules.filter((r) => r.field).length;
		return `If ${count} rule${count !== 1 ? "s" : ""} match (${this.logic})`;
	}
}

```

./processing/JoinConfig.js
```js
/**
 * @fileoverview Join node configuration for joining data streams
 * @module pipelines/models/configs/processing/JoinConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Join types */
export const JoinType = {
	INNER: "inner",
	LEFT: "left",
	RIGHT: "right",
	OUTER: "outer",
};

/** Join configuration for combining data from multiple sources */
export class JoinConfig extends BaseConfig {
	/** @param {Object} init - Initial configuration */
	constructor(init = {}) {
		super();
		/** @type {string} Type of join operation */
		this.type = init.type || JoinType.INNER;
		/** @type {string} Key field from left input */
		this.leftKey = init.leftKey || "";
		/** @type {string} Key field from right input */
		this.rightKey = init.rightKey || "";
		/** @type {string} How to handle duplicate matches */
		this.duplicateHandling = init.duplicateHandling || "all";
	}

	/** @returns {Object} Schema definition for validation */
	getSchema() {
		return {
			type: {
				type: "string",
				required: true,
				enum: Object.values(JoinType),
			},
			leftKey: {
				type: "string",
				required: true,
				minLength: 1,
			},
			rightKey: {
				type: "string",
				required: true,
				minLength: 1,
			},
			duplicateHandling: {
				type: "string",
				required: false,
				enum: ["all", "first", "last"],
			},
		};
	}

	/** @returns {string} Human-readable summary */
	getSummary() {
		return this.leftKey && this.rightKey
			? `${this.type.toUpperCase()} on ${this.leftKey} = ${this.rightKey}`
			: "Join keys not set";
	}
}

```

./processing/FormatConfig.js
```js
/**
 * @fileoverview Format node configuration
 * @module pipelines/models/configs/processing/FormatConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Output format types with proper MIME */
export const FormatOutput = {
	JSON: "application/json",
	CSV: "text/csv",
	XML: "application/xml",
	TEXT: "text/plain",
	HTML: "text/html",
	MARKDOWN: "text/markdown",
	XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	PDF: "application/pdf",
	CUSTOM: "custom",
};

/**
 * Configuration for format node
 * Formats data into various output formats
 */
export class FormatConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.format] - Output format (json, csv, xml, text, custom)
	 * @param {boolean} [init.csvIncludeHeaders] - Include headers in CSV output
	 * @param {string} [init.csvDelimiter] - CSV delimiter character
	 * @param {string} [init.csvQuote] - CSV quote character
	 * @param {boolean} [init.jsonPretty] - Pretty print JSON
	 * @param {string} [init.template] - Custom template string
	 * @param {string} [init.fieldOrder] - Order of fields in output
	 */
	constructor(init = {}) {
		super();
		/** @type {FormatOutput} Selected export format */
		this.format = init.format || FormatOutput.CSV;

		/** @type {boolean} Whether to include header row in CSV */
		this.csvIncludeHeaders = init.csvIncludeHeaders ?? true;

		/** @type {string} CSV delimiter character */
		this.csvDelimiter = init.csvDelimiter || ",";

		/** @type {string} CSV quote wrapper character */
		this.csvQuote = init.csvQuote || '"';

		/** @type {boolean} Pretty print JSON output */
		this.jsonPretty = init.jsonPretty ?? true;

		/** @type {string} Template string for custom formatting */
		this.template = init.template || "";

		/** @type {string} Explicit field ordering control */
		this.fieldOrder = init.fieldOrder || "";
	}

	getSchema() {
		return {
			format: {
				type: "string",
				required: true,
				enum: Object.values(FormatOutput),
			},
			csvIncludeHeaders: {
				type: "boolean",
				required: false,
			},
			csvDelimiter: {
				type: "string",
				required: false,
			},
			csvQuote: {
				type: "string",
				required: false,
			},
			jsonPretty: {
				type: "boolean",
				required: false,
			},
			template: {
				type: "string",
				required: false,
			},
			fieldOrder: {
				type: "string",
				required: false,
			},
		};
	}

	getSummary() {
		return `Format as ${this.format.toUpperCase()}`;
	}
}

```

./processing/LookupConfig.js
```js
/**
 * @fileoverview Lookup node configuration
 * @module pipelines/models/configs/processing/LookupConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Lookup data sources */
export const LookupSource = {
	API: "api",
	CACHE: "cache",
	STORAGE: "storage",
};

/**
 * Configuration for lookup node
 * Enriches data by looking up additional information from external sources
 */
export class LookupConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.source] - Lookup source (api, cache, storage)
	 * @param {string} [init.requestUrl] - API request URL
	 * @param {string} [init.requestMethod] - HTTP method for API requests
	 * @param {string} [init.extractPath] - JSON path to extract from response
	 * @param {boolean} [init.cacheResults] - Whether to cache lookup results
	 * @param {number} [init.cacheTTL] - Cache time-to-live in milliseconds
	 */
	constructor(init = {}) {
		super();
		/** @type {LookupSource} Lookup data source */
		this.source = init.source || LookupSource.API;

		/** @type {string} API endpoint URL */
		this.requestUrl = init.requestUrl || "";

		/** @type {string} HTTP request method (GET, POST, etc.) */
		this.requestMethod = init.requestMethod || "GET";

		/** @type {string} JSONPath to extract from API response */
		this.extractPath = init.extractPath || "";

		/** @type {boolean} Whether lookup results should be cached */
		this.cacheResults = init.cacheResults ?? true;

		/** @type {number} Cache Time-To-Live in milliseconds */
		this.cacheTTL = init.cacheTTL || 300000;
	}

	getSchema() {
		return {
			source: {
				type: "string",
				required: true,
				enum: Object.values(LookupSource),
			},
			requestUrl: {
				type: "string",
				required: false,
				validator: (value) => {
					if (this.source === LookupSource.API && !value) return false;
					return true;
				},
			},
			requestMethod: {
				type: "string",
				required: false,
			},
			extractPath: {
				type: "string",
				required: false,
			},
			cacheResults: {
				type: "boolean",
				required: false,
			},
			cacheTTL: {
				type: "number",
				required: false,
				min: 0,
			},
		};
	}

	getSummary() {
		return this.source === LookupSource.API && this.requestUrl
			? `Lookup: ${this.requestMethod} ${this.requestUrl}`
			: `Lookup from ${this.source}`;
	}
}

```

./processing/IntersectConfig.js
```js
/**
 * @fileoverview Intersect node configuration
 * @module pipelines/models/configs/processing/IntersectConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Intersect comparison methods */
export const IntersectCompareBy = {
	FIELD: "field",
	FULL: "full",
};

/** @enum {string} Intersect output source */
export const IntersectOutputFrom = {
	FIRST: "first", // Output elements from first input
	SECOND: "second", // Output elements from second input
	BOTH: "both", // Merge objects from both sides
};

/**
 * Configuration for intersect node
 * Finds common elements between two data streams
 */
export class IntersectConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.compareBy] - Comparison method (field, full)
	 * @param {string} [init.outputFrom] - Which input to output from (first, second)
	 * @param {string} [init.field] - Field to compare when using field comparison
	 * @param {boolean} [init.ignoreCase] - Whether to ignore case in comparisons
	 */
	constructor(init = {}) {
		super();
		/** @type {IntersectCompareBy} How equality is determined */
		this.compareBy = init.compareBy || IntersectCompareBy.FIELD;

		/** @type {IntersectOutputFrom} Which side determines output structure */
		this.outputFrom = init.outputFrom || IntersectOutputFrom.FIRST;

		/** @type {string} Field name for FIELD-based comparisons */
		this.field = init.field || "";

		/** @type {boolean} Case-insensitive string comparison */
		this.ignoreCase = init.ignoreCase ?? true;
	}

	getSchema() {
		return {
			compareBy: {
				type: "string",
				required: true,
				enum: Object.values(IntersectCompareBy),
			},
			outputFrom: {
				type: "string",
				required: false,
				enum: ["first", "second"],
			},
			field: {
				type: "string",
				required: false,
				validator: (value) => {
					if (this.compareBy === IntersectCompareBy.FIELD && !value) return false;
					return true;
				},
			},
			ignoreCase: {
				type: "boolean",
				required: false,
			},
		};
	}

	getSummary() {
		return "Intersect Data";
	}
}

```

./processing/LoopConfig.js
```js
/**
 * @fileoverview Loop node configuration
 * @module pipelines/models/configs/processing/LoopConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Loop output mode types */
export const LoopOutputMode = {
	EMIT: "emit",
	COLLECT: "collect",
};

/**
 * Configuration for loop node
 * Iterates over array items and processes each one
 */
export class LoopConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.loopOver] - Field containing array to loop over
	 * @param {boolean} [init.flatten] - Flatten nested arrays in output
	 * @param {string} [init.outputMode] - Output mode (emit, collect)
	 * @param {string} [init.assignTo] - Variable name for loop item
	 * @param {number} [init.maxIterations] - Maximum iterations allowed
	 */
	constructor(init = {}) {
		super();
		/** @type {string} Field name that contains the iterable array */
		this.loopOver = init.loopOver || "";

		/** @type {boolean} Flatten nested arrays into a single list */
		this.flatten = init.flatten ?? false;

		/** @type {LoopOutputMode} Output style: emit each, or collect full results */
		this.outputMode = init.outputMode || LoopOutputMode.EMIT;

		/** @type {string} Variable to reference current item in expressions */
		this.assignTo = init.assignTo || "";

		/** @type {number} Max iterations to avoid infinite loops */
		this.maxIterations = init.maxIterations || 1000;
	}

	getSchema() {
		return {
			loopOver: {
				type: "string",
				required: true,
			},
			flatten: {
				type: "boolean",
				required: false,
			},
			outputMode: {
				type: "string",
				required: true,
				enum: Object.values(LoopOutputMode),
			},
			assignTo: {
				type: "string",
				required: false,
			},
			maxIterations: {
				type: "number",
				required: false,
				min: 1,
			},
		};
	}

	getSummary() {
		return this.loopOver ? `Loop over ${this.loopOver}` : "Loop";
	}
}

```

./processing/ParseConfig.js
```js
/**
 * @fileoverview Parse node configuration for data format parsing
 * @module pipelines/models/configs/processing/ParseConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Parse format types */
export const ParseFormat = {
	JSON: "json",
	CSV: "csv",
	HTML: "html",
	XML: "xml",
	YAML: "yaml",
};

/** @enum {string} Validation failure actions */
export const ValidationFailureAction = {
	SKIP: "skip",
	FAIL: "fail",
	TAG: "tag",
};

/** Parse configuration for parsing various data formats */
export class ParseConfig extends BaseConfig {
	/** @param {Object} init - Initial configuration */
	constructor(init = {}) {
		super();
		/** @type {string} Input field containing data to parse */
		this.inputField = init.inputField || "raw_data";
		/** @type {string} Format to parse */
		this.format = init.format || ParseFormat.JSON;
		/** @type {string} Action on parse error */
		this.onError = init.onError || ValidationFailureAction.SKIP;
		/** @type {string} JSONPath expression for JSON parsing */
		this.jsonPath = init.jsonPath || "";
		/** @type {string} CSV delimiter character */
		this.csvDelimiter = init.csvDelimiter || ",";
		/** @type {boolean} CSV has header row */
		this.csvHasHeaders = init.csvHasHeaders ?? true;
		/** @type {Object} HTML selector mappings */
		this.htmlSelectors = init.htmlSelectors || {};
		/** @type {boolean} Flatten nested structures */
		this.flatten = init.flatten ?? true;
	}

	/** @returns {Object} Schema definition for validation */
	getSchema() {
		return {
			inputField: {
				type: "string",
				required: true,
			},
			format: {
				type: "string",
				required: true,
				enum: Object.values(ParseFormat),
			},
			onError: {
				type: "string",
				required: false,
				enum: Object.values(ValidationFailureAction),
			},
			jsonPath: {
				type: "string",
				required: false,
			},
			csvDelimiter: {
				type: "string",
				required: false,
			},
			csvHasHeaders: {
				type: "boolean",
				required: false,
			},
			htmlSelectors: {
				type: "object",
				required: false,
			},
			flatten: {
				type: "boolean",
				required: false,
			},
		};
	}

	/** @returns {string} Human-readable summary */
	getSummary() {
		return `Parse ${this.format.toUpperCase()} from ${this.inputField}`;
	}
}

```

./processing/RegexPatternConfig.js
```js
/**
 * @fileoverview Regex pattern node configuration
 * @module pipelines/models/configs/processing/RegexPatternConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/**
 * Regex pattern helper class
 * Defines a single regex pattern operation
 */
export class RegexPattern {
	/**
	 * @param {Object} init - Initial data
	 * @param {string} [init.field] - Field to apply pattern to
	 * @param {string} [init.pattern] - Regex pattern
	 * @param {Object} [init.flags]
	 * @param {string} [init.replacement] - Replacement string
	 * @param {boolean} [init.extract] - Extract matches instead of replace
	 * @param {boolean} [init.enabled]
	 */
	constructor(init = {}) {
		this.field = init.field || "";
		this.pattern = init.pattern || "";
		this.replacement = init.replacement || "";
		this.extract = init.extract ?? false;
		this.enabled = init.enabled ?? true;
		this.flags = {
			g: init.flags?.g ?? true,
			m: init.flags?.m ?? false,
			s: init.flags?.s ?? false,
			i: init.flags?.i ?? false,
			u: init.flags?.u ?? false,
			y: init.flags?.y ?? false,
		};
	}

	getFlagString() {
		return Object.entries(this.flags)
			.filter(([, v]) => v)
			.map(([k]) => k)
			.join("");
	}

	toRegex() {
		return new RegExp(this.pattern, this.getFlagString());
	}
}

/**
 * Configuration for regex pattern node
 * Applies regex patterns to extract or replace text
 */
export class RegexPatternConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {Array<RegexPattern>} [init.patterns] - Regex patterns to apply
	 */
	constructor(init = {}) {
		super();
		/** @type {RegexPattern[]} */
		this.patterns = (init.patterns || []).map((p) => new RegexPattern(p));
	}

	getSchema() {
		return {
			patterns: {
				type: "array",
				required: true,
				minLength: 1,
			},
		};
	}

	getSummary() {
		const count = this.patterns.filter((p) => p.field).length;
		return `${count} regex pattern${count !== 1 ? "s" : ""}`;
	}
}

```

./processing/TransformConfig.js
```js
/**
 * @fileoverview Transform node configuration for data transformations
 * @module pipelines/models/configs/processing/TransformConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Transform operations */
export const TransformOperation = {
	COPY: "copy",
	TEMPLATE: "template",
	CALCULATE: "calculate",
	CONCAT: "concat",
	SPLIT: "split",
	UPPERCASE: "uppercase",
	LOWERCASE: "lowercase",
	TRIM: "trim",
};

/** Transformation helper class */
export class Transformation {
	/** @param {Object} init - Initial values */
	constructor(init = {}) {
		/** @type {string} Target field name */
		this.targetField = init.targetField || "";
		/** @type {string} Source field name */
		this.sourceField = init.sourceField || "";
		/** @type {string} Operation to perform */
		this.operation = init.operation || TransformOperation.COPY;
		/** @type {Object} Operation-specific options */
		this.options = init.options || {};
	}
}

/** Transform configuration for data field transformations */
export class TransformConfig extends BaseConfig {
	/** @param {Object} init - Initial configuration */
	constructor(init = {}) {
		super();
		/** @type {Transformation[]} Array of transformations to apply */
		this.transformations = (init.transformations || []).map((t) => new Transformation(t));
		/** @type {boolean} Keep original fields */
		this.preserveOriginal = init.preserveOriginal ?? false;
		/** @type {boolean} Skip items on transformation error */
		this.skipOnError = init.skipOnError ?? false;
		/** @type {string} Field name for error messages */
		this.errorField = init.errorField || "_transformError";
	}

	/** @returns {Object} Schema definition for validation */
	getSchema() {
		return {
			transformations: {
				type: "array",
				required: true,
				minLength: 1,
			},
			preserveOriginal: {
				type: "boolean",
				required: false,
			},
			skipOnError: {
				type: "boolean",
				required: false,
			},
			errorField: {
				type: "string",
				required: false,
			},
		};
	}

	/** @returns {string[]} Validation errors */
	validate() {
		const errors = super.validate();
		this.transformations.forEach((t, i) => {
			if (!t.targetField) errors.push(`Transformation ${i}: targetField is required`);
			if (!t.sourceField) errors.push(`Transformation ${i}: sourceField is required`);
		});
		return errors;
	}

	/** @returns {string} Human-readable summary */
	getSummary() {
		const count = this.transformations.filter((t) => t.targetField && t.sourceField).length;
		if (count === 0) return "No transformations defined";
		return `${count} transformation${count !== 1 ? "s" : ""}`;
	}
}

```

./processing/AggregateConfig.js
```js
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

```

./processing/DistinctConfig.js
```js
/**
 * @fileoverview Distinct node configuration
 * @module pipelines/models/configs/processing/DistinctConfig
 */

import { BaseConfig } from "../../BaseConfig.js";
import { DeduplicateScope } from "./DeduplicateConfig.js";

/** @enum {string} Distinct output formats */
export const DistinctOutputFormat = {
	ARRAY: "array",
	OBJECT: "object",
};

/** @enum {string} Sort order */
export const SortOrder = {
	NONE: "none",
	ASC: "asc",
	DESC: "desc",
};

/**
 * Configuration for distinct node
 * Extracts unique values from data
 */
export class DistinctConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.scope] - Comparison scope (field, full)
	 * @param {Array<string>} [init.fields] - Fields to extract distinct values from
	 * @param {string} [init.outputFormat] - Output format (array, object)
	 * @param {string} [init.sort] - Sort order (none, asc, desc)
	 */
	constructor(init = {}) {
		super();
		/** @type {DeduplicateScope} Scope used for comparison */
		this.scope = init.scope || DeduplicateScope.FIELD;

		/** @type {string[]} List of fields when scope=FIELD */
		this.fields = init.fields || [];

		/** @type {DistinctOutputFormat} Output format */
		this.outputFormat = init.outputFormat || DistinctOutputFormat.ARRAY;

		/** @type {SortOrder} Sort order for distinct results */
		this.sort = init.sort || SortOrder.NONE;
	}

	getSchema() {
		return {
			scope: {
				type: "string",
				required: true,
				enum: Object.values(DeduplicateScope),
			},
			fields: {
				type: "array",
				required: false,
				validator: (value) => {
					if (this.scope === DeduplicateScope.FIELD && value.length === 0) return false;
					return true;
				},
			},
			outputFormat: {
				type: "string",
				required: false,
				enum: Object.values(DistinctOutputFormat),
			},
			sort: {
				type: "string",
				required: false,
				enum: ["none", "asc", "desc"],
			},
		};
	}

	getSummary() {
		return "Distinct values";
	}
}

```

./processing/ValidateConfig.js
```js
/**
 * @fileoverview Validate node configuration
 * @module pipelines/models/configs/processing/ValidateConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Validation failure action types */
export const ValidationFailureAction = {
	SKIP: "skip",
	FAIL: "fail",
	MARK: "mark",
	SEPARATE: "separate",
};

/**
 * Validation rule helper class
 * Defines a single validation rule for a field
 */
export class ValidationRule {
	/**
	 * @param {Object} init - Initial data
	 * @param {string} [init.field] - Field to validate
	 * @param {boolean} [init.required] - Whether field is required
	 * @param {string} [init.type] - Expected type (string, number, boolean, etc.)
	 * @param {string} [init.pattern] - Regex pattern for validation
	 * @param {number} [init.min] - Minimum value (for numbers) or length (for strings)
	 * @param {number} [init.max] - Maximum value (for numbers) or length (for strings)
	 * @param {boolean} [init.enabled] - Maximum value (for numbers) or length (for strings)
	 */
	constructor(init = {}) {
		/** @type {string} Field to validate */
		this.field = init.field || "";

		/** @type {boolean} Whether field is required */
		this.required = init.required ?? false;

		/** @type {string} Expected type: string, number, boolean, etc. */
		this.type = init.type || "";

		/** @type {string} Regex pattern for validation */
		this.pattern = init.pattern || "";

		/** @type {number|undefined} Minimum value or length */
		this.min = init.min;

		/** @type {number|undefined} Maximum value or length */
		this.max = init.max;

		/** @type {boolean} Whether this rule is active */
		this.enabled = init.enabled ?? true;
	}
}

/**
 * Configuration for validate node
 * Validates data against defined rules
 */
export class ValidateConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.onFailure] - Action on validation failure (skip, fail, tag)
	 * @param {Array<ValidationRule>} [init.rules] - Validation rules
	 */
	constructor(init = {}) {
		super();
		/** @type {ValidationFailureAction} Action on validation failure */
		this.onFailure = init.onFailure || ValidationFailureAction.SKIP;

		/** @type {ValidationRule[]} Array of configured validation rules */
		this.rules = (init.rules || []).map((r) => new ValidationRule(r));
	}

	getSchema() {
		return {
			onFailure: {
				type: "string",
				required: true,
				enum: Object.values(ValidationFailureAction),
			},
			rules: {
				type: "array",
				required: true,
				minLength: 1,
			},
		};
	}

	getSummary() {
		const count = this.rules.filter((r) => r.field).length;
		return `${count} validation${count !== 1 ? "s" : ""} (${this.onFailure} invalid)`;
	}
}

```

./processing/SplitConfig.js
```js
/**
 * @fileoverview Split node configuration
 * @module pipelines/models/configs/processing/SplitConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Split method types */
export const SplitMethod = {
	FIELD: "field",
	CONDITION: "condition",
	BATCH: "batch",
	PERCENTAGE: "percentage",
};

/** @enum {string} Split strategy types */
export const SplitStrategy = {
	SEPARATE: "separate",
	ARRAY: "array",
	OBJECT: "object",
};

/**
 * Configuration for split node
 * Splits data into groups based on field values or chunk size
 */
export class SplitConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.method] - Split method (field, count, size)
	 * @param {string} [init.splitField] - Field to split by (for field method)
	 * @param {string} [init.strategy] - Split strategy (separate, nest)
	 * @param {boolean} [init.includeGroupName] - Include group name in output
	 * @param {number} [init.chunkSize] - Size of chunks (for count/size methods)
	 */
	constructor(init = {}) {
		super();
		/** @type {SplitMethod} Method used to split data */
		this.method = init.method || SplitMethod.FIELD;

		/** @type {string} Field to split by when using FIELD method */
		this.splitField = init.splitField || "";

		/** @type {SplitStrategy} Output grouping style */
		this.strategy = init.strategy || SplitStrategy.SEPARATE;

		/** @type {boolean} Include group key in emitted data */
		this.includeGroupName = init.includeGroupName ?? false;

		/** @type {number} Chunk size for BATCH splitting */
		this.chunkSize = init.chunkSize || 10;
	}

	getSchema() {
		return {
			method: {
				type: "string",
				required: true,
				enum: Object.values(SplitMethod),
			},
			splitField: {
				type: "string",
				required: false,
			},
			strategy: {
				type: "string",
				required: true,
				enum: Object.values(SplitStrategy),
			},
			includeGroupName: {
				type: "boolean",
				required: false,
			},
			chunkSize: {
				type: "number",
				required: false,
				min: 1,
			},
		};
	}

	validate() {
		const errors = super.validate();
		if (this.method === SplitMethod.FIELD && !this.splitField)
			errors.push("Split field is required for field method");
		return errors;
	}

	getSummary() {
		return this.splitField ? `Split by ${this.splitField}` : "No field selected";
	}
}

```

./processing/SortConfig.js
```js
/**
 * @fileoverview Sort node configuration
 * @module pipelines/models/configs/processing/SortConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Sort order types */
export const SortOrder = {
	ASC: "asc",
	DESC: "desc",
};

/**
 * Sort criteria helper class
 * Defines a single sort criterion
 */
export class SortCriteria {
	/**
	 * @param {Object} init - Initial data
	 * @param {string} [init.field] - Field to sort by
	 * @param {string} [init.order] - Sort order (asc, desc)
	 * @param {boolean} [init.enabled]
	 */
	constructor(init = {}) {
		this.field = init.field || "";
		this.order = init.order || SortOrder.ASC;
		this.enabled = init.enabled ?? true;
	}
}

/**
 * Configuration for sort node
 * Sorts data based on specified criteria
 */
export class SortConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {Array<SortCriteria>} [init.criteria] - Sort criteria
	 */
	constructor(init = {}) {
		super();
		/** @type {SortCriteria[]} Array of sorting criteria in priority order */
		this.criteria = (init.criteria || []).map((c) => new SortCriteria(c));
	}

	getSchema() {
		return {
			criteria: { type: "array", required: true, minLength: 1 },
		};
	}

	getSummary() {
		if (this.criteria.length === 0) return "No sort criteria";
		const first = this.criteria[0];
		return `Sort by ${first.field} (${first.order})`;
	}
}

```

./processing/CustomCodeConfig.js
```js
/**
 * @fileoverview Custom code node configuration
 * @module pipelines/models/configs/processing/CustomCodeConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Custom code execution modes */
export const CustomCodeMode = {
	MAP: "map",
	FILTER: "filter",
	REDUCE: "reduce",
	TRANSFORM: "transform",
};

/**
 * Configuration for custom code node
 * Executes user-provided JavaScript code on data
 */
export class CustomCodeConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.code] - JavaScript code to execute
	 * @param {string} [init.mode] - Execution mode (map, filter, reduce, transform)
	 * @param {boolean} [init.sandbox] - Whether to run code in sandbox
	 * @param {number} [init.timeout] - Execution timeout in milliseconds
	 */
	constructor(init = {}) {
		super();
		/** @type {string} JavaScript source code */
		this.code = init.code || "";

		/** @type {CustomCodeMode} Execution strategy */
		this.mode = init.mode || CustomCodeMode.MAP;

		/** @type {boolean} Restrict access to globals for safety */
		this.sandbox = init.sandbox ?? true;

		/** @type {number} Max runtime allowed for execution */
		this.timeout = init.timeout || 5000;
	}

	getSchema() {
		return {
			code: {
				type: "string",
				required: true,
				minLength: 1,
			},
			mode: {
				type: "string",
				required: true,
				enum: Object.values(CustomCodeMode),
			},
			sandbox: {
				type: "boolean",
				required: false,
			},
			timeout: {
				type: "number",
				required: false,
				min: 0,
			},
		};
	}

	getSummary() {
		return `JS Code (${this.mode})`;
	}
}

```

./processing/UnionConfig.js
```js
/**
 * @fileoverview Union node configuration
 * @module pipelines/models/configs/processing/UnionConfig
 */

import { BaseConfig } from "../../BaseConfig.js";

/** @enum {string} Union merge strategies */
export const UnionStrategy = {
	APPEND: "append",
	UNIQUE: "unique",
	INTERSECT: "intersect",
};
/**
 * Configuration for union node
 * Combines multiple data streams into a single output
 */
export class UnionConfig extends BaseConfig {
	/**
	 * @param {Object} init - Initial configuration
	 * @param {string} [init.strategy] - Union strategy (append, deduplicate)
	 * @param {string} [init.deduplicateField] - Field to use for deduplication
	 * @param {boolean} [init.preserveOrder] - Whether to preserve input order
	 */
	constructor(init = {}) {
		super();
		/** @type {UnionStrategy} Merge strategy */
		this.strategy = init.strategy || UnionStrategy.APPEND;

		/** @type {string} Field to deduplicate by (applies only in UNIQUE mode) */
		this.deduplicateField = init.deduplicateField || "";

		/** @type {boolean} Whether to preserve the source input ordering */
		this.preserveOrder = init.preserveOrder ?? true;
	}

	getSchema() {
		return {
			strategy: {
				type: "string",
				required: true,
				enum: Object.values(UnionStrategy),
			},
			deduplicateField: {
				type: "string",
				required: false,
			},
			preserveOrder: {
				type: "boolean",
				required: false,
			},
		};
	}

	getSummary() {
		return `Union (${this.strategy})`;
	}
}

```

