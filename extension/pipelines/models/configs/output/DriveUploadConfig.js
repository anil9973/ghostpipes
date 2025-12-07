import { BaseConfig } from "../../BaseConfig.js";
import { FormatOutput } from "../processing/FormatConfig.js";

/** @enum {string} Cloud storage providers */
export const CloudProvider = {
	GDRIVE: "gdrive",
	ONEDRIVE: "onedrive",
	DROPBOX: "dropbox",
	BOX: "box",
};

/** @enum {string} Upload conflict resolution */
export const ConflictResolution = {
	REPLACE: "replace",
	RENAME: "rename",
	SKIP: "skip",
	VERSION: "version",
};

/**
 * Configuration for cloud drive upload node
 * Uploads data to Google Drive, OneDrive, Dropbox, or Box
 */
export class DriveUploadConfig extends BaseConfig {
	/**
	 * @param {Object} init
	 * @param {CloudProvider} [init.provider] - Cloud storage provider
	 * @param {string} [init.folderId] - Target folder ID
	 * @param {string} [init.folderPath] - Target folder path
	 * @param {string} [init.filename] - Output filename
	 * @param {FormatOutput} [init.format] - File format
	 * @param {ConflictResolution} [init.onConflict] - Conflict handling
	 * @param {boolean} [init.createFolder] - Create folder if missing
	 * @param {string} [init.accessToken] - OAuth access token (stored securely)
	 * @param {Object} [init.metadata] - Custom file metadata
	 */
	constructor(init = {}) {
		super();

		/** @type {CloudProvider} Cloud storage provider */
		this.provider = init.provider || CloudProvider.GDRIVE;

		/** @type {string} Target folder ID (provider-specific) */
		this.folderId = init.folderId || "";

		/** @type {string} Human-readable folder path */
		this.folderPath = init.folderPath || "/";

		/** @type {string} Output filename */
		this.filename = init.filename || "data";

		/** @type {FormatOutput} File format for upload */
		this.format = init.format || FormatOutput.JSON;

		/** @type {ConflictResolution} How to handle existing files */
		this.onConflict = init.onConflict || ConflictResolution.RENAME;

		/** @type {boolean} Auto-create folder if doesn't exist */
		this.createFolder = init.createFolder ?? true;

		/** @type {string} OAuth access token reference (not stored directly) */
		this.accessToken = init.accessToken || "";

		/** @type {Object} Custom metadata (tags, description, etc.) */
		this.metadata = init.metadata || {};
	}

	getSchema() {
		return {
			provider: {
				type: "string",
				required: true,
				enum: Object.values(CloudProvider),
			},
			folderId: {
				type: "string",
				required: false,
			},
			folderPath: {
				type: "string",
				required: false,
			},
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
			onConflict: {
				type: "string",
				required: false,
				enum: Object.values(ConflictResolution),
			},
			createFolder: {
				type: "boolean",
				required: false,
			},
			accessToken: {
				type: "string",
				required: false,
			},
			metadata: {
				type: "object",
				required: false,
			},
		};
	}

	getSummary() {
		const providerName = this.provider.toUpperCase();
		const folder = this.folderPath !== "/" ? ` to ${this.folderPath}` : "";
		const formatName = Object.keys(FormatOutput).find((k) => FormatOutput[k] === this.format) || "JSON";
		return `Upload ${this.filename}.${formatName.toLowerCase()} to ${providerName}${folder}`.slice(0, 120);
	}

	/** Get provider-specific API endpoint */
	getApiEndpoint() {
		const endpoints = {
			[CloudProvider.GDRIVE]: "https://www.googleapis.com/drive/v3",
			[CloudProvider.ONEDRIVE]: "https://graph.microsoft.com/v1.0/me/drive",
			[CloudProvider.DROPBOX]: "https://api.dropboxapi.com/2",
			[CloudProvider.BOX]: "https://api.box.com/2.0",
		};
		return endpoints[this.provider];
	}
}
