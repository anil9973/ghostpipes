function setBadge(tabId, text, color) {
	chrome.action.setBadgeText({ tabId, text: text });
	chrome.action.setBadgeBackgroundColor({ tabId, color });
	chrome.action.setIcon({ tabId, path: text === "on" ? "/assets/icon.png" : "/assets/icon-gray.png" });
}

export async function toggleSelectionActionScript(tab) {
	const status = await chrome.action.getBadgeText({ tabId: tab.id });
	if (status === "on") {
		chrome.tabs.onUpdated.removeListener(onUpdateTab);
		setBadge(tab.id, "off", "gray");
		return await chrome.tabs.sendMessage(tab.id, "removeFontDownloader");
	}

	try {
		await chrome.tabs.sendMessage(tab.id, "addFontDownloader");
	} catch (error) {
		injectScript(tab.id);
	} finally {
		chrome.tabs.onUpdated.addListener(onUpdateTab);
		setBadge(tab.id, "on", "green");
	}
}

export async function onUpdateTab(tabId, info, tab) {
	if (info.status !== "complete") return;
	if (!tab.url && !tab.url.startsWith("https")) return;

	try {
		await chrome.tabs.sendMessage(tab.id, "ping");
	} catch (error) {
		injectScript(tabId).then(() => setBadge(tab.id, "on", "green"));
	}
}

async function injectScript(tabId) {
	await chrome.scripting.executeScript({
		target: { tabId, allFrames: true },
		files: ["/scripts/content.js"],
	});
}

export function openPipeStation(selectedTexts) {
	const WEB_URL = "pipelines/index.html";
	chrome.storage.session.set({ selectedTexts: selectedTexts }).then(() => chrome.tabs.create({ url: WEB_URL }));
}
