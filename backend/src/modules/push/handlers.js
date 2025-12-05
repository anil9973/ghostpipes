export class PushHandlers {
	constructor(pushService) {
		this.pushService = pushService;
	}

	/** POST /push/subscribe */
	async subscribe(request, reply) {
		const subscription = await this.pushService.subscribe(request.user.userId, request.body);
		return { subscription: { id: subscription.id } };
	}

	/** POST /push/unsubscribe */
	async unsubscribe(request, reply) {
		await this.pushService.unsubscribe(request.user.userId, request.body.endpoint);
		return { success: true };
	}

	/** GET /push/vapid */
	async getVapidKey(request, reply) {
		return { publicKey: request.server.config.vapid.publicKey };
	}
}
