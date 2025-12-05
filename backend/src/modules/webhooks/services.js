import { nanoid } from "nanoid";
import { NotFoundError, ForbiddenError } from "../../utils/errors.js";

export class WebhookService {
	constructor(db, pushService) {
		this.db = db;
		this.pushService = pushService;
	}

	/** Create webhook for pipeline */
	async createWebhook(pipelineId, userId, method = "POST") {
		const pipeline = await this.db("pipelines").where({ id: pipelineId, user_id: userId }).first();
		if (!pipeline) throw new NotFoundError("Pipeline not found");

		const [webhook] = await this.db("webhooks")
			.insert({
				pipeline_id: pipelineId,
				user_id: userId,
				webhook_token: nanoid(32),
				method: method.toUpperCase(),
			})
			.returning("*");

		return webhook;
	}

	/** Get webhook by ID */
	async getWebhook(webhookId, userId) {
		const webhook = await this.db("webhooks").where({ id: webhookId, user_id: userId }).first();
		if (!webhook) throw new NotFoundError("Webhook not found");
		return webhook;
	}

	/** List webhooks for pipeline */
	async listWebhooks(pipelineId, userId) {
		return await this.db("webhooks")
			.where({ pipeline_id: pipelineId, user_id: userId })
			.select("id", "webhook_token", "method", "is_active", "trigger_count", "last_triggered_at", "created_at");
	}

	/** Delete webhook */
	async deleteWebhook(webhookId, userId) {
		await this.getWebhook(webhookId, userId);
		await this.db("webhooks").where({ id: webhookId }).delete();
	}

	/** Handle webhook trigger */
	async triggerWebhook(webhookToken, method, data) {
		const webhook = await this.db("webhooks").where({ webhook_token: webhookToken, is_active: true }).first();

		if (!webhook) throw new NotFoundError("Webhook not found");
		if (webhook.method !== method.toUpperCase()) throw new ForbiddenError("Method not allowed");

		const pipeline = await this.db("pipelines").where({ id: webhook.pipeline_id }).first();

		await this.db("webhooks")
			.where({ id: webhook.id })
			.update({
				last_request: JSON.stringify({ data, timestamp: new Date().toISOString() }),
				last_triggered_at: this.db.fn.now(),
			})
			.increment("trigger_count", 1);

		const payload = {
			type: "webhook",
			webhookId: webhook.id,
			pipelineId: webhook.pipeline_id,
			pipelineName: pipeline.name,
			data,
			timestamp: new Date().toISOString(),
		};

		const payloadSize = JSON.stringify(payload).length;

		if (payloadSize < 3800) {
			await this.pushService.sendToUser(webhook.user_id, payload);
		} else {
			await this.pushService.sendToUser(webhook.user_id, {
				type: "webhook_large",
				webhookId: webhook.id,
				message: "Webhook triggered - fetch data from server",
			});
		}

		return { success: true, triggered: true };
	}

	/** Get webhook trigger data */
	async getWebhookData(webhookId, userId) {
		const webhook = await this.getWebhook(webhookId, userId);
		return webhook.last_request ? JSON.parse(webhook.last_request) : null;
	}
}
