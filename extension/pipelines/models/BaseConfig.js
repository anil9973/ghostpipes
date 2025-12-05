/**
 * @fileoverview Base configuration class with schema-driven validation
 * @module pipelines/models/BaseConfig
 */

/**
 * Base class for all node configurations
 * Provides schema-driven validation, type checking, and serialization
 *
 * @abstract
 * @example
 * class MyConfig extends BaseConfig {
 *   constructor(init = {}) {
 *     super();
 *     this.myField = init.myField || '';
 *   }
 *
 *   getSchema() {
 *     return {
 *       myField: { type: 'string', required: true }
 *     };
 *   }
 * }
 */
export class BaseConfig {
	/**
	 * Get the schema definition for this config
	 * Must be implemented by subclasses
	 *
	 * @abstract
	 * @returns {Object} Schema object with field definitions
	 * @example
	 * {
	 *   fieldName: {
	 *     type: 'string' | 'number' | 'boolean' | 'array' | 'object',
	 *     required: true | false,
	 *     enum: [...values],
	 *     min: number,
	 *     max: number,
	 *     pattern: RegExp | string,
	 *     validator: (value) => boolean
	 *   }
	 * }
	 */
	getSchema() {
		return {};
	}

	/**
	 * Validate the configuration against its schema
	 *
	 * @returns {string[]} Array of error messages (empty if valid)
	 */
	validate() {
		const errors = [];
		const schema = this.getSchema();

		for (const [fieldName, fieldSchema] of Object.entries(schema)) {
			const value = this[fieldName];

			// Check required fields
			if (fieldSchema.required && this.isEmpty(value)) {
				errors.push(`${fieldName} is required`);
				continue;
			}

			// Skip validation for empty optional fields
			if (!fieldSchema.required && this.isEmpty(value)) {
				continue;
			}

			// Type validation
			if (fieldSchema.type) {
				const typeError = this.checkType(fieldName, value, fieldSchema.type);
				if (typeError) {
					errors.push(typeError);
					continue;
				}
			}

			// Enum validation
			if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
				errors.push(`${fieldName} must be one of: ${fieldSchema.enum.join(", ")}`);
			}

			// Min/Max validation for numbers
			if (fieldSchema.type === "number") {
				if (fieldSchema.min !== undefined && value < fieldSchema.min) {
					errors.push(`${fieldName} must be at least ${fieldSchema.min}`);
				}
				if (fieldSchema.max !== undefined && value > fieldSchema.max) {
					errors.push(`${fieldName} must be at most ${fieldSchema.max}`);
				}
			}

			// Array length validation
			if (fieldSchema.type === "array") {
				if (fieldSchema.minLength !== undefined && value.length < fieldSchema.minLength) {
					errors.push(`${fieldName} must have at least ${fieldSchema.minLength} item(s)`);
				}
				if (fieldSchema.maxLength !== undefined && value.length > fieldSchema.maxLength) {
					errors.push(`${fieldName} must have at most ${fieldSchema.maxLength} item(s)`);
				}
			}

			// String length validation
			if (fieldSchema.type === "string") {
				if (fieldSchema.minLength !== undefined && value.length < fieldSchema.minLength) {
					errors.push(`${fieldName} must be at least ${fieldSchema.minLength} character(s)`);
				}
				if (fieldSchema.maxLength !== undefined && value.length > fieldSchema.maxLength) {
					errors.push(`${fieldName} must be at most ${fieldSchema.maxLength} character(s)`);
				}
			}

			// Pattern validation
			if (fieldSchema.pattern) {
				const regex = typeof fieldSchema.pattern === "string" ? new RegExp(fieldSchema.pattern) : fieldSchema.pattern;

				if (!regex.test(value)) {
					errors.push(`${fieldName} does not match required pattern`);
				}
			}

			// Custom validator
			if (fieldSchema.validator && typeof fieldSchema.validator === "function") {
				try {
					const isValid = fieldSchema.validator(value);
					if (!isValid) {
						errors.push(`${fieldName} failed custom validation`);
					}
				} catch (error) {
					errors.push(`${fieldName} validation error: ${error.message}`);
				}
			}

			// URL validation
			if (fieldSchema.format === "url") {
				try {
					new URL(value);
				} catch {
					errors.push(`${fieldName} must be a valid URL`);
				}
			}

			// Email validation
			if (fieldSchema.format === "email") {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(value)) {
					errors.push(`${fieldName} must be a valid email address`);
				}
			}
		}

		return errors;
	}

	/**
	 * Check if a value is empty
	 *
	 * @param {*} value - Value to check
	 * @returns {boolean} True if value is empty
	 */
	isEmpty(value) {
		if (value === null || value === undefined) {
			return true;
		}

		if (typeof value === "string") {
			return value.trim() === "";
		}

		if (Array.isArray(value)) {
			return value.length === 0;
		}

		if (typeof value === "object") {
			return Object.keys(value).length === 0;
		}

		return false;
	}

	/**
	 * Check if a value matches the expected type
	 *
	 * @param {string} fieldName - Name of the field
	 * @param {*} value - Value to check
	 * @param {string} expectedType - Expected type
	 * @returns {string|null} Error message or null if valid
	 */
	checkType(fieldName, value, expectedType) {
		const actualType = Array.isArray(value) ? "array" : typeof value;

		// Handle special cases
		if (expectedType === "array" && !Array.isArray(value)) {
			return `${fieldName} must be an array`;
		}

		if (expectedType === "object" && (actualType !== "object" || Array.isArray(value) || value === null)) {
			return `${fieldName} must be an object`;
		}

		if (expectedType === "string" && actualType !== "string") {
			return `${fieldName} must be a string`;
		}

		if (expectedType === "number" && actualType !== "number") {
			return `${fieldName} must be a number`;
		}

		if (expectedType === "boolean" && actualType !== "boolean") {
			return `${fieldName} must be a boolean`;
		}

		return null;
	}

	/**
	 * Convert config to JSON-serializable object
	 *
	 * @returns {Object} Plain object representation
	 */
	toJSON() {
		const result = {};
		const schema = this.getSchema();

		// Include all schema-defined fields
		for (const fieldName of Object.keys(schema)) {
			if (this.hasOwnProperty(fieldName)) {
				result[fieldName] = this[fieldName];
			}
		}

		// Include any additional fields not in schema
		for (const key of Object.keys(this)) {
			if (!schema.hasOwnProperty(key) && this.hasOwnProperty(key)) {
				result[key] = this[key];
			}
		}

		return result;
	}

	/**
	 * Get a human-readable summary of the configuration
	 * Should be overridden by subclasses
	 *
	 * @returns {string} Summary text
	 */
	getSummary() {
		return "Configuration";
	}
}
