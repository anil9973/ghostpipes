import { db, Store } from "./db.js";

/**
 * Cleanup old usage history
 * @param {number} cutoffTimestamp - Delete entries older than this
 * @returns {Promise<void>}
 */
export async function cleanupUsageHistory(cutoffTimestamp) {
	return new Promise((resolve, reject) => {
		db.getObjStore(Store.UsageHistory, "readwrite").then((store) => {
			const index = store.index("timestamp");
			const range = IDBKeyRange.upperBound(cutoffTimestamp);
			const request = index.openCursor(range);

			request.onsuccess = (event) => {
				const cursor = event.target["result"];
				if (cursor) {
					cursor.delete();
					cursor.continue();
				} else resolve();
			};

			request.onerror = () => reject(request.error);
		});
	});
}

export const usagedb = { cleanupUsageHistory };
