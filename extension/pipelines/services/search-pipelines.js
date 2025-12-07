// @ts-nocheck
import Index from "../../lib/flexsearch.js";

export default {
	index: new Index({
		charset: "latin:advanced",
		tokenize: "full",
		cache: true,
	}),

	pipelines: [],

	addObj({ id, title }) {
		const length = this.tabs.length;
		this.index.addAsync(length, title);
		this.index.addAsync(-length, url);
		this.tabs.push({ title });
	},

	removeIdx(tabId) {
		const idx = this.tabs.findIndex(({ id }) => id === tabId);
		this.tabs.splice(idx, 1);
		this.index.removeAsync(tabId);
	},

	async query(input) {
		const resultArr = (await this.index.searchAsync(input)).map((idx) => (idx < 0 ? (idx *= -1) : idx));
		const results = [...new Set(resultArr)];
		return results.map((idx) => this.tabs[idx < 0 ? (idx *= -1) : idx]);
	},
};
