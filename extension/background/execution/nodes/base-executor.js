/**
 * @fileoverview Base class for all node executors
 * @module background/execution/nodes/base-executor
 */

/**
 * Base executor class that all node executors extend
 * Provides common functionality for execution, error handling, and utilities
 */
export class BaseExecutor {
	/**
	 * Execute the node logic
	 * @param {any} input - Data from previous node(s)
	 * @param {Object} config - Node configuration
	 * @param {import("../execution-context.js").ExecutionContext} context - Execution context
	 * @returns {Promise<any>} Output data
	 * @abstract
	 */
	async execute(input, config, context) {
		throw new Error(`execute() must be implemented by ${this.constructor.name}`);
	}

	/**
	 * Validate node configuration before execution
	 * @param {Object} config - Node configuration
	 * @returns {Array<string>} Validation errors (empty if valid)
	 */
	validate(config) {
		return [];
	}

	/**
	 * Get nested field value using dot notation
	 * @param {Object} obj - Object to query
	 * @param {string} path - Field path (e.g., "user.name")
	 * @returns {any} Field value or undefined
	 */
	getFieldValue(obj, path) {
		if (!path) return obj;
		return path.split(".").reduce((current, key) => current?.[key], obj);
	}

	/**
	 * Set nested field value using dot notation
	 * @param {Object} obj - Object to modify
	 * @param {string} path - Field path
	 * @param {any} value - Value to set
	 */
	setFieldValue(obj, path, value) {
		const keys = path.split(".");
		const lastKey = keys.pop();
		const target = keys.reduce((current, key) => {
			if (!current[key]) current[key] = {};
			return current[key];
		}, obj);
		target[lastKey] = value;
	}

	/**
	 * Evaluate template string with context
	 * @param {string} template - Template with {{field}} placeholders
	 * @param {Object} context - Data context
	 * @returns {string} Evaluated string
	 */
	evaluateTemplate(template, context) {
		return template.replace(/\{\{(.+?)\}\}/g, (_, path) => {
			const value = this.getFieldValue(context, path.trim());
			return value !== undefined ? String(value) : "";
		});
	}

	/**
	 * Evaluate condition expression
	 * @param {string} condition - Condition string (e.g., "{{price}} > 100")
	 * @param {Object} context - Data context
	 * @returns {boolean} Condition result
	 */
	evaluateCondition(condition, context) {
		// Replace templates with actual values
		const evaluated = this.evaluateTemplate(condition, context);

		try {
			// Parse simple comparisons
			const operators = {
				"==": (a, b) => a == b,
				"!=": (a, b) => a != b,
				"===": (a, b) => a === b,
				"!==": (a, b) => a !== b,
				">": (a, b) => Number(a) > Number(b),
				"<": (a, b) => Number(a) < Number(b),
				">=": (a, b) => Number(a) >= Number(b),
				"<=": (a, b) => Number(a) <= Number(b),
			};

			for (const [op, fn] of Object.entries(operators)) {
				if (evaluated.includes(op)) {
					const [left, right] = evaluated.split(op).map((s) => s.trim());
					return fn(left, right);
				}
			}

			// If no operator, treat as boolean
			return evaluated === "true" || evaluated === "1";
		} catch (error) {
			console.error("Failed to evaluate condition:", condition, error);
			return false;
		}
	}

	/**
	 * Compare two values using operator
	 * @param {any} a - First value
	 * @param {string} operator - Comparison operator
	 * @param {any} b - Second value
	 * @returns {boolean} Comparison result
	 */
	compareValues(a, operator, b) {
		const ops = {
			"==": (x, y) => x == y,
			"!=": (x, y) => x != y,
			">": (x, y) => Number(x) > Number(y),
			"<": (x, y) => Number(x) < Number(y),
			">=": (x, y) => Number(x) >= Number(y),
			"<=": (x, y) => Number(x) <= Number(y),
			contains: (x, y) => String(x).includes(y),
			matches: (x, y) => new RegExp(y).test(String(x)),
			startsWith: (x, y) => String(x).startsWith(y),
			endsWith: (x, y) => String(x).endsWith(y),
		};
		return ops[operator]?.(a, b) ?? false;
	}

	/**
	 * Ensure input is an array
	 * @param {any} input - Input data
	 * @returns {Array} Array of items
	 */
	ensureArray(input) {
		if (Array.isArray(input)) return input;
		if (input === null || input === undefined) return [];
		return [input];
	}

	/**
	 * Delay execution
	 * @param {number} ms - Milliseconds to wait
	 * @returns {Promise<void>}
	 */
	delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Format data size for logging
	 * @param {any} data - Data to measure
	 * @returns {string} Formatted size (e.g., "1.5 KB")
	 */
	formatDataSize(data) {
		const bytes = JSON.stringify(data).length;
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	/**
	 * Log execution info
	 * @param {string} message - Log message
	 * @param {Object} [data] - Additional data
	 */
	log(message, data) {
		const timestamp = new Date().toISOString();
		console.log(`[${timestamp}] [${this.constructor.name}] ${message}`, data || "");
	}
}
