/** Text structure detection utilities */
export class TextAnalyzer {
	/**
	 * Detect structure type of text
	 * @param {string} text
	 * @returns {'json'|'csv'|'xml'|'plain'}
	 */
	static detectStructure(text) {
		const trimmed = text.trim();

		// JSON detection
		if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
			try {
				JSON.parse(trimmed);
				return "json";
			} catch {}
		}

		// XML/HTML detection
		if (trimmed.startsWith("<")) return "xml";

		// CSV detection
		const lines = trimmed.split("\n").filter((l) => l.trim());
		if (lines.length > 1) {
			const commaCounts = lines.map((l) => (l.match(/,/g) || []).length);
			const consistent = commaCounts.every((c) => c === commaCounts[0]);
			if (consistent && commaCounts[0] > 0) return "csv";
		}

		return "plain";
	}
}
