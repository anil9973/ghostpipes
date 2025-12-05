export class PipelineHandlers {
	constructor(pipelineService) {
		this.pipelineService = pipelineService;
	}

	/** GET /pipelines */
	async list(request, reply) {
		const pipelines = await this.pipelineService.listPipelines(request.user.userId);
		return { pipelines };
	}

	/** GET /pipelines/:id */
	async get(request, reply) {
		const pipeline = await this.pipelineService.getPipeline(request.params.id, request.user.userId);
		return { pipeline };
	}

	/** POST /pipelines */
	async create(request, reply) {
		const pipeline = await this.pipelineService.createPipeline(request.user.userId, request.body);
		return { pipeline };
	}

	/** PUT /pipelines/:id */
	async update(request, reply) {
		const pipeline = await this.pipelineService.updatePipeline(request.params.id, request.user.userId, request.body);
		return { pipeline };
	}

	/** DELETE /pipelines/:id */
	async delete(request, reply) {
		await this.pipelineService.deletePipeline(request.params.id, request.user.userId);
		return { success: true };
	}

	/** POST /pipelines/clone/:token */
	async clone(request, reply) {
		const pipeline = await this.pipelineService.clonePipeline(request.params.token, request.user.userId);
		return { pipeline };
	}
}
