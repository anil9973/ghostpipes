/** @enum {string} */
export const Store = {
	Pipelines: "pipelines",
	Executions: "executions",
	UsageHistory: "UsageHistory",
	Templates: "templates",
	FileHandles: "FileHandles",
	// Cache: "cache",
	// Settings: "settings",
};

class PipeLogicDatabase {
	constructor() {
		this.db = null;
	}

	onupgradeneeded({ target }) {
		const db = target.result;
		if (!db.objectStoreNames.contains(Store.Pipelines)) {
			const store = db.createObjectStore(Store.Pipelines, { keyPath: "id" });
			/* store.createIndex("status", "status");
			store.createIndex("lastRun", "lastRun"); */
		}

		// Executions
		if (!db.objectStoreNames.contains(Store.Executions)) {
			const store = db.createObjectStore(Store.Executions, { keyPath: "id" });
			/* store.createIndex("pipelineId", "pipelineId");
			store.createIndex("startedAt", "startedAt"); */
		}

		// Usage history store (NEW)
		if (!db.objectStoreNames.contains(Store.UsageHistory)) {
			const historyStore = db.createObjectStore(Store.UsageHistory, { keyPath: "id" });
			historyStore.createIndex("inputType", "inputType", { unique: false });
		}

		// File handles store
		if (!db.objectStoreNames.contains(Store.FileHandles)) {
			db.createObjectStore(Store.FileHandles);
		}
	}

	/** @returns {Promise<IDBDatabase>} */
	connect() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open("PipeLogicDB", 2);
			request.onupgradeneeded = this.onupgradeneeded;
			request.onsuccess = () => {
				this.db = request.result;
				this.db.onclose = () => (this.db = null);
				resolve(this.db);
			};
			request.onerror = () => reject(request.error);
			request.onblocked = () => console.warn("Database open blocked — waiting for release.");
		});
	}

	/** @param {string} storeName, @param {IDBTransactionMode} [mode="readonly"]  */
	async getObjStore(storeName, mode = "readonly") {
		this.db ??= await this.connect();
		const tx = this.db.transaction(storeName, mode);
		return tx.objectStore(storeName);
	}

	/** @param {string} storeName @param {IDBTransactionMode} [mode="readwrite"] */
	async getObjTxn(storeName, mode = "readwrite") {
		this.db ??= await this.connect();
		return this.db.transaction(storeName, mode);
	}

	/**
	 * Generic getAll operation
	 * @param {Store} storeName - Object store name
	 * @param {any} key - Primary key
	 */
	async get(storeName, key) {
		return new Promise((resolve, reject) => {
			this.getObjStore(storeName).then((store) => {
				const request = store.get(key);
				request.onsuccess = (evt) => resolve(evt.target["result"]);
				request.onerror = (e) => reject(e);
			});
		});
	}

	/**
	 * Generic getAll operation
	 * @param {Store} storeName - Object store name
	 * @returns {Promise<any[]>}
	 */
	async getAll(storeName) {
		return new Promise((resolve, reject) => {
			this.getObjStore(storeName).then((store) => {
				const request = store.getAll();
				request.onsuccess = (evt) => resolve(evt.target["result"]);
				request.onerror = (e) => reject(e);
			});
		});
	}

	/**
	 * Generic put operation
	 * @param {Store} storeName - Object store name
	 * @param {Object} objData - Data to store
	 */
	async put(storeName, objData) {
		return new Promise((resolve, reject) => {
			this.getObjStore(storeName, "readwrite").then((store) => {
				const request = store.put(objData);
				request.onsuccess = (evt) => resolve(evt.target["result"]);
				request.onerror = (e) => reject(e);
			});
		});
	}

	/**
	 * Generic put update
	 * @param {Store} storeName - Object store name
	 * @param {string|number} key - Data to store
	 * @param {Object} props - Data to store
	 */
	async update(storeName, key, props) {
		return new Promise((resolve, reject) => {
			this.getObjStore(storeName, "readwrite").then((store) => {
				const request = store.get(key);
				request.onsuccess = (evt) => {
					const obj = evt.target["result"];
					for (const propName in props) obj[propName] = props[propName];
					const request = store.put(obj);
					request.onsuccess = (evt) => resolve(evt.target["result"]);
					request.onerror = (e) => reject(e);
					resolve();
				};
			});
		});
	}

	/**
	 * Generic delete operation
	 * @param {Store} storeName - Object store name
	 * @param {Object} objData - Data to store
	 */
	async delete(storeName, objData) {
		return new Promise((resolve, reject) => {
			this.getObjStore(storeName, "readwrite").then((store) => {
				const request = store.delete(objData);
				request.onsuccess = (evt) => resolve(evt.target["result"]);
				request.onerror = (e) => reject(e);
			});
		});
	}
}

export const db = new PipeLogicDatabase();
