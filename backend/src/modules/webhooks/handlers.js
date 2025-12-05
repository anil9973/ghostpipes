export class WebhookHandlers {
	constructor(webhookService) {
		this.webhookService = webhookService;
	}

	/** POST /webhooks */
	async create(request, reply) {
		const { pipelineId, method } = request.body;
		const webhook = await this.webhookService.createWebhook(pipelineId, request.user.userId, method);
		return { webhook };
	}

	/** GET /webhooks/:id */
	async get(request, reply) {
		const webhook = await this.webhookService.getWebhook(request.params.id, request.user.userId);
		return { webhook };
	}

	/** GET /webhooks/pipeline/:pipelineId */
	async listByPipeline(request, reply) {
		const webhooks = await this.webhookService.listWebhooks(request.params.pipelineId, request.user.userId);
		return { webhooks };
	}

	/** DELETE /webhooks/:id */
	async delete(request, reply) {
		await this.webhookService.deleteWebhook(request.params.id, request.user.userId);
		return { success: true };
	}

	/** POST /wh/:token (public endpoint) */
	async trigger(request, reply) {
		const result = await this.webhookService.triggerWebhook(request.params.token, request.method, {
			body: request.body,
			query: request.query,
			headers: request.headers,
		});
		return result;
	}

	/** GET /webhooks/:id/data */
	async getData(request, reply) {
		const data = await this.webhookService.getWebhookData(request.params.id, request.user.userId);
		return { data };
	}
}
