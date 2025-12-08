/**
 * @fileoverview Service Worker - Main entry point for background execution
 * @module background/service-worker
 */

import { TriggerManager } from "./execution/TriggerManager.js";
import { onUpdateTab, openPipeStation, toggleSelectionActionScript } from "./select-action.js";
import { subscribeForPushMessage } from "./webhook/push-api-subscribe.js";
import { handlePushMessage } from "./webhook/webhook-trigger.js";

// import "../tests/execution/execute.js"; // For testing in service_environment

globalThis.getStore = chrome.storage.local.get.bind(chrome.storage.local);
globalThis.setStore = chrome.storage.local.set.bind(chrome.storage.local);

var triggerManager;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type?.endsWith("_PIPELINE")) {
		triggerManager ??= new TriggerManager();
		triggerManager.handlers[request.type]?.(request, sender)
			.then?.(sendResponse)
			.catch((err) => sendResponse({ errCaused: err.message }));
		return true;
	} else if (request.command === "openPipelinesPage") {
		request.selectedTexts && openPipeStation(request.selectedTexts);
	} else if (request.command === "subscribeWebPushMessage") {
		subscribeForPushMessage()
			.then?.(sendResponse)
			.catch((err) => sendResponse({ errCaused: err.message }));
		return true;
	}
});

chrome.alarms.onAlarm.addListener((alarm) => {
	if (alarm.name.startsWith("pipeline_")) {
		triggerManager ??= new TriggerManager();
		triggerManager.handleAlarm(alarm);
	}
});

chrome.action.onClicked.addListener(toggleSelectionActionScript);

getStore("autoRunTabUrlPatterns", ({ autoRunTabUrlPatterns }) => {
	if (!autoRunTabUrlPatterns) return;
	Object.keys(autoRunTabUrlPatterns).length === 0 || chrome.tabs.onUpdated.addListener(onUpdateTab);
});

//context menus
export const contextHandler = {
	processSelectText: (info) => openPipeStation({ [location.host + location.pathname]: info.selectionText }),
	gotoPipelinesStation: () => chrome.runtime.openOptionsPage(),
};
chrome.contextMenus.onClicked.addListener((info, tab) => contextHandler[info.menuItemId](info, tab));

//commands
const commands = {};
chrome.commands.onCommand.addListener((cmd) => commands[cmd]?.());

chrome.alarms.onAlarm.addListener(async (alarm) => {});

self.addEventListener("push", handlePushMessage);

export async function setInstallation({ reason }) {
	async function oneTimeInstall() {
		//> uninstall survey setup
		const LAMBA_KD = crypto.randomUUID();
		const SURVEY_URL = `https://uninstall-feedback.pages.dev/?e=${chrome.runtime.id}&u=${LAMBA_KD}`;
		chrome.runtime.setUninstallURL(SURVEY_URL);
	}
	reason === "install" && oneTimeInstall();
	reason === "update" && onUpdate();

	async function onUpdate() {}

	chrome.contextMenus.create({
		id: "processSelectText",
		title: "Process with GhostPipes",
		contexts: ["selection"],
	});

	/* chrome.contextMenus.create({
		id: "create pipeline",
		title: "Create new Pipeline",
		contexts: ["selection"],
	}); */

	chrome.contextMenus.create({
		id: "gotoPipelinesStation",
		title: "🌀 Go to Pipelines",
		contexts: ["selection"],
	});

	// Temporary: Testing only
	chrome.scripting.registerContentScripts([
		{
			id: "textSelector",
			allFrames: true,
			js: ["scripts/content.js"],
			matches: ["https://*/*"],
		},
	]);
}

// installation setup
chrome.runtime.onInstalled.addListener(setInstallation);

console.log("[Service Worker] Initialized");
