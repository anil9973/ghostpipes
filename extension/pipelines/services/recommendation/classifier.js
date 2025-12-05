import { UrlParser } from "../../utils/url-parser.js";
import { TextAnalyzer } from "../../utils/text-analyzer.js";

/** Classifies user input into types with metadata*/
export class InputClassifier {
	/**
	 * Classify input
	 * @param {File|string} input
	 * @returns {InputType}
	 */
	classify(input) {
		if (input instanceof File) return this.classifyFile(input);
		if (typeof input === "string") return UrlParser.isUrl(input) ? this.classifyUrl(input) : this.classifyText(input);
		return { type: "unknown" };
	}

	/** @private */
	classifyUrl(url) {
		return {
			type: "url",
			url: url.trim(),
			domain: UrlParser.extractDomain(url),
			path: UrlParser.extractPath(url),
			hasQuery: UrlParser.hasQueryParams(url),
		};
	}

	/** @private */
	classifyFile(file) {
		return {
			type: "file",
			mimeType: file.type,
			name: file.name,
			size: file.size,
		};
	}

	/** @private */
	classifyText(text) {
		return {
			type: "text",
			content: text,
			structure: TextAnalyzer.detectStructure(text),
		};
	}
}

/**
 * @typedef {Object} InputType
 * @property {'url'|'file'|'text'|'unknown'} type
 * @property {string} [url]
 * @property {string} [domain]
 * @property {string} [path]
 * @property {boolean} [hasQuery]
 * @property {string} [mimeType]
 * @property {string} [name]
 * @property {number} [size]
 * @property {string} [content]
 * @property {'json'|'csv'|'xml'|'plain'} [structure]
 */
