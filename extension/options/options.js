import { getFileHandleById } from "../pipelines/db/filehandle-db.js";

/**@type {HTMLDialogElement} */
const dialog = eId("file-permission");
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.command === "requestPermission") {
		function requestPermission(fileHandle) {
			dialog.querySelector("var").textContent = fileHandle.name;
			dialog.showModal();
			$on(dialog.querySelector("button"), "click", grantPermission);
			async function grantPermission() {
				const isGranted = (await fileHandle.requestPermission({ mode: "readwrite" })) === "granted";
				sendResponse(isGranted);
				toast("Permission " + isGranted ? "granted" : "denied");
				dialog.close();
				setTimeout(() => close(), 5000);
			}
		}
		getFileHandleById(request.filename).then(requestPermission);
		return true;
	} else if (request === "knock knock") sendResponse();
});
