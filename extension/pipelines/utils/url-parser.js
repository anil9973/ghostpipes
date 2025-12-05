/** URL parsing utilities */
export class UrlParser {
	/**
	 * Extract domain from URL
	 * @param {string} url
	 * @returns {string}
	 */
	static extractDomain(url) {
		try {
			const urlObj = new URL(url);
			return urlObj.hostname;
		} catch {
			return "";
		}
	}

	/**
	 * Extract path without query
	 * @param {string} url
	 * @returns {string}
	 */
	static extractPath(url) {
		try {
			const urlObj = new URL(url);
			return urlObj.pathname;
		} catch {
			return "";
		}
	}

	/**
	 * Check if string is valid URL
	 * @param {string} str
	 * @returns {boolean}
	 */
	static isUrl(str) {
		return /^https?:\/\/.+/i.test(str.trim());
	}

	/**
	 * Check if URL has query parameters
	 * @param {string} url
	 * @returns {boolean}
	 */
	static hasQueryParams(url) {
		return url.includes("?");
	}
}
