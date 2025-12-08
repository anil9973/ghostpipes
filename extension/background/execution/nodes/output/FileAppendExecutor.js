import { FileAppendConfig } from "../../../../pipelines/models/configs/output/FileAppendConfig.js";
import { FormatOutput } from "../../../../pipelines/models/configs/processing/FormatConfig.js";
import { getFileHandleById } from "../../../../pipelines/db/filehandle-db.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class FileAppendExecutor extends BaseExecutor {
	/** @param {*} input - @param {FileAppendConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { path, format, createIfMissing, addHeader } = config;
		const fileHandle = await getFileHandleById(config.fileHandleId);
		if (fileHandle instanceof FileSystemDirectoryHandle) return;

		const isGranted = (await fileHandle["queryPermission"]({ mode: "readwrite" })) === "granted";
		if (!isGranted) await requestFilePermission(fileHandle.name);

		const content = this.formatContent(input, format, addHeader);
		const contentBuffer = new TextEncoder().encode(content);
		/**@type {FileSystemWritableFileStream} */
		const writableStream = await fileHandle.createWritable({ keepExistingData: true });
		try {
			const offset = (await fileHandle.getFile()).size;
			await writableStream.seek(offset);
			await writableStream.write(contentBuffer);
		} catch (error) {
			error.stack += `\nfileName=${path}`;
			console.error(error);
		} finally {
			await writableStream.close();
		}

		return {
			appended: true,
			path,
		};
	}

	formatContent(input, format, addHeader) {
		const formatters = {
			[FormatOutput.JSON]: () => JSON.stringify(input, null, 2),
			[FormatOutput.CSV]: () => this.toCSV(input, addHeader),
			[FormatOutput.TEXT]: () => String(input),
		};
		return (formatters[format] || formatters[FormatOutput.TEXT])();
	}

	toCSV(data, includeHeaders) {
		const items = this.ensureArray(data);
		if (items.length === 0) return "";

		const headers = Object.keys(items[0]);
		const lines = includeHeaders ? [headers.join(",")] : [];
		items.forEach((item) => lines.push(headers.map((h) => item[h]).join(",")));
		return lines.join("\n");
	}
}

export async function requestFilePermission(filename, isDirectory) {
	try {
		await chrome.tabs.create({ url: "options/index.html" });
		await new Promise((r) => setTimeout(r, 2000));

		const message = { command: "requestPermission", filename, isDirectory };
		const isGranted = await chrome.runtime.sendMessage(message);
		isGranted || console.error("Permission denied");
		return isGranted;
	} catch (error) {
		console.error(error);
	}
}
