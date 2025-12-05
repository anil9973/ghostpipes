import { buildPushPayload } from "@block65/webcrypto-web-push";
import config from "../../config/env.js";
import { ValidationError } from "../../utils/errors.js";

export class PushService {
	constructor(db) {
		this.db = db;
	}

	/** Subscribe user to push notifications */
	async subscribe(userId, subscription) {
		const { endpoint, keys } = subscription;

		const existing = await this.db("push_subscriptions").where({ user_id: userId, endpoint }).first();

		if (existing) {
			const [updated] = await this.db("push_subscriptions")
				.where({ id: existing.id })
				.update({
					p256dh_key: keys.p256dh,
					auth_key: keys.auth,
					last_used_at: this.db.fn.now(),
				})
				.returning("*");
			return updated;
		}

		const [sub] = await this.db("push_subscriptions")
			.insert({
				user_id: userId,
				endpoint,
				p256dh_key: keys.p256dh,
				auth_key: keys.auth,
			})
			.returning("*");

		return sub;
	}

	/** Get all subscriptions for user */
	async getUserSubscriptions(userId) {
		return await this.db("push_subscriptions").where({ user_id: userId }).select("*");
	}

	/** Send push notification to user */
	async sendToUser(userId, message) {
		console.log(message);
		const subscriptions = await this.getUserSubscriptions(userId);

		const results = await Promise.allSettled(
			subscriptions.map(async (sub) => {
				try {
					const payload = await buildPushPayload(
						JSON.stringify(message),
						{
							endpoint: sub.endpoint,
							keys: {
								p256dh: sub.p256dh_key,
								auth: sub.auth_key,
							},
						},
						{
							subject: config.vapid.subject,
							publicKey: config.vapid.publicKey,
							privateKey: config.vapid.privateKey,
						}
					);

					const response = await fetch(sub.endpoint, payload);
					console.log(response);
					// await this.db("push_subscriptions").where({ id: sub.id }).update({ last_used_at: this.db.fn.now() });
					return { success: true, subscriptionId: sub.id, response };
				} catch (error) {
					if (error.statusCode === 410 || error.statusCode === 404) {
						await this.db("push_subscriptions").where({ id: sub.id }).delete();
					}
					throw error;
				}
			})
		);

		return results;
	}

	/** Unsubscribe */
	async unsubscribe(userId, endpoint) {
		await this.db("push_subscriptions").where({ user_id: userId, endpoint }).delete();
	}
}
