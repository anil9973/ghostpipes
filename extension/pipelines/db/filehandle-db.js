import { db, Store } from "./db.js";

/**@returns {Promise<FileSystemDirectoryHandle|FileSystemFileHandle>} */
export function getSyncDirectory(fileHandleId) {
	return new Promise(async (resolve, reject) =>
		db.getObjStore(Store.FileHandles).then((store) => {
			const request = store.get(fileHandleId);
			// @ts-ignore
			request.onsuccess = ({ target }) => resolve(target.result);
			request.onerror = (e) => reject(e);
		})
	);
}

//put file handle in db
/**@param {FileSystemDirectoryHandle|FileSystemFileHandle} fileHandle*/
export async function saveFileHandle(fileHandle, id) {
	return new Promise((resolve, reject) =>
		db.getObjStore(Store.FileHandles, "readwrite").then((store) => {
			const saveCall = store.put(fileHandle, id);
			saveCall.onsuccess = (e) => resolve(e);
			saveCall.onerror = (e) => reject(e);
		})
	);
}
