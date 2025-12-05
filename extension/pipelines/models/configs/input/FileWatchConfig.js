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
