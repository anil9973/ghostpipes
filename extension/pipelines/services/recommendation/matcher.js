import { UrlParser } from "../../utils/url-parser.js";
import { MimeTypes } from "../../utils/mime-types.js";

/**
 * Pattern matching utilities
 */
export class PatternMatcher {
	/**
	 * Check if pipeline has specific node type
	 * @param {Object} pipeline
	 * @param {string} nodeType
	 * @returns {boolean}
	 */
	static hasPipelineNode(pipeline, nodeType) {
		return pipeline.nodes?.some((n) => n.type === nodeType) || false;
	}

	/**
	 * Get parser node for MIME type
	 * @param {Object} pipeline
	 * @param {string} mimeType
	 * @returns {Object|null}
	 */
	static getParserForMime(pipeline, mimeType) {
		const parseNode = pipeline.nodes?.find((n) => n.type === "parse");
		if (!parseNode) return null;

		const format = mimeType.split("/")[1];
		return parseNode.config?.format === format ? parseNode : null;
	}

	/**
	 * Match MIME type with hierarchy
	 * @param {string} pipelineMime
	 * @param {string} inputMime
	 * @returns {number}
	 */
	static matchMimeType(pipelineMime, inputMime) {
		return MimeTypes.scoreMimeMatch(pipelineMime, inputMime);
	}
}
