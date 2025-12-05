/* function decodeBase64(base64String) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

	const rawData = atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
	return outputArray;
}

function encodeBase64(keyu8Array) {
	const base64 = btoa(String.fromCharCode(...keyu8Array));
	return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function generateVPIDKey() {
	const alogithm = { name: "ECDSA", namedCurve: "P-256" };
	const keyPair = await crypto.subtle.generateKey(alogithm, true, ["sign", "verify"]);

	//public key
	const publicKeyBuffer = await crypto.subtle.exportKey("raw", keyPair.publicKey);
	const publicVapidKey = encodeBase64(new Uint8Array(publicKeyBuffer));
	// privateKey
	const privateJwKey = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
	const privateKey = decodeBase64(privateJwKey.d);
	const privateVapidKey = encodeBase64(privateKey);
	//private key for nodejs
	const privateKeyBuffer = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
	const privateVapidKeyPk = btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer)));

	chrome.storage.local.set({ publicVapidKey, privateVapidKey, privateVapidKeyPk });
	return publicVapidKey;
} */

import { SERVER_URL } from "../../pipelines/js/constant.js";

export async function subscribeForPushMessage() {
	const applicationServerKey =
		"BLQPWUgWsNaOf1rB_TNwp5BMH7GMpTa_pMf_ymstLlAmF55YQorE_tJnyo35BKe-98JQsmjUesP7Dn-wrWGldbI";
	const AUTH_TOKEN =
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDJmYmEwMS1iY2JiLTRiYjItODhhYi1kOTdjYWIwMTM0NGQiLCJpYXQiOjE3NjQ3Mjk1MzcsImV4cCI6MTc2NTMzNDMzN30.xR0Pj9hbUy9TW3gPRJmuI_JwOD4AiFSc3_39WmzPuqo";
	try {
		// @ts-ignore
		const subscription = await self.registration.pushManager.subscribe({
			userVisibleOnly: false,
			applicationServerKey: applicationServerKey,
		});

		const headers = new Headers({ "Content-Type": "application/json", Authorization: "Bearer " + AUTH_TOKEN });
		const response = await fetch(`${SERVER_URL}/push/subscribe`, {
			method: "POST",
			body: JSON.stringify(subscription),
			headers: headers,
		});
		if (response.ok) {
			const subscriptionData = `${subscription.endpoint} ${subscription.keys.p256dh} ${subscription.keys.auth}`;
			await setStore({ pushSubscription: subscriptionData });
			console.log("webPush message subscribed");
		}
	} catch (error) {
		console.error(error.message);
	}
}
