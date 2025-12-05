import { FileAppendConfig } from "../../../../pipelines/models/configs/output/FileAppendConfig.js";
import { FormatOutput } from "../../../../pipelines/models/configs/processing/FormatConfig.js";
import { ExecutionContext } from "../../execution-context.js";
import { BaseExecutor } from "../base-executor.js";

export class FileAppendExecutor extends BaseExecutor {
	/** @param {*} input - @param {FileAppendConfig} config - @param {ExecutionContext} context */
	async execute(input, config, context) {
		const { path, format, createIfMissing, addHeader } = config;

		this.dirHandle ??= await this.setDirHandle();
		if (!this.dirHandle) return;

		const content = this.formatContent(input, format, addHeader);
		const contentBuffer = new TextEncoder().encode(content);
		const fileHandle = await this.getFileHandle(path);
		const writableStream = await fileHandle.createWritable({ keepExistingData: true });
		try {
			/**@type {FileSystemWritableFileStream} */
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

	async getFileHandle(filePath) {
		let dirHandle = this.dirHandle;
		if (filePath.includes("/")) {
			const dirPaths = filePath.split("/");
			filePath = dirPaths.pop();
			for (const dirName of dirPaths) dirHandle = await dirHandle.getDirectoryHandle(dirName, { create: true });
		}
		return await dirHandle.getFileHandle(filePath, { create: true });
	}
}
