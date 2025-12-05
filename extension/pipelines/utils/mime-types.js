/**MIME type utilities and hierarchies*/
export class MimeTypes {
	static hierarchy = {
		"text/csv": ["text/*", "application/vnd.ms-excel"],
		"text/html": ["text/*", "application/xhtml+xml"],
		"application/json": ["application/*", "text/plain"],
		"image/jpeg": ["image/*"],
		"image/png": ["image/*"],
		"application/xml": ["application/*", "text/xml"],
	};

	/**
	 * Score MIME type match
	 * @param {string} pipelineMime
	 * @param {string} inputMime
	 * @returns {number}
	 */
	static scoreMimeMatch(pipelineMime, inputMime) {
		if (pipelineMime === inputMime) return 10;

		const hierarchy = this.hierarchy[inputMime] || [];
		if (hierarchy.includes(pipelineMime)) return 5;

		const [inputCategory] = inputMime.split("/");
		const [pipelineCategory] = pipelineMime.split("/");
		if (inputCategory === pipelineCategory) return 3;

		return 0;
	}
}
