import { nanoid } from "nanoid";
import { NotFoundError, ForbiddenError } from "../../utils/errors.js";

export class PipelineService {
	constructor(db) {
		this.db = db;
	}

	/** Get all pipelines for user */
	async listPipelines(userId) {
		const pipelines = await this.db("pipelines")
			.where({ user_id: userId })
			.select("id", "title", "summary", "is_public", "share_token", "clone_count", "created_at", "updated_at")
			.orderBy("updated_at", "desc");

		return pipelines.map((p) => ({
			id: p.id,
			title: p.title,
			summary: p.summary,
			isPublic: p.is_public,
			shareToken: p.share_token,
			cloneCount: p.clone_count,
			createdAt: p.created_at,
			updatedAt: p.updated_at,
		}));
	}

	/** Get pipeline by ID */
	async getPipeline(pipelineId, userId) {
		const pipeline = await this.db("pipelines").where({ id: pipelineId }).first();
		if (!pipeline) throw new NotFoundError("Pipeline not found");
		if (pipeline.user_id !== userId) throw new ForbiddenError("Access denied");

		return this.formatPipeline(pipeline);
	}

	/** Create new pipeline */
	async createPipeline(userId, data) {
		const now = Date.now();

		const [pipeline] = await this.db("pipelines")
			.insert({
				user_id: userId,
				title: data.title,
				summary: data.summary || null,
				definition: JSON.stringify({
					trigger: data.trigger,
					nodes: data.nodes,
					pipes: data.pipes,
				}),
				is_public: data.isPublic || false,
				share_token: data.isPublic ? nanoid(10) : null,
				created_at: now,
				updated_at: now,
			})
			.returning("*");

		return this.formatPipeline(pipeline);
	}

	/** Update pipeline */
	async updatePipeline(pipelineId, userId, data) {
		const pipeline = await this.getPipeline(pipelineId, userId);

		const updates = {
			updated_at: Date.now(),
		};

		if (data.title !== undefined) updates.title = data.title;
		if (data.summary !== undefined) updates.summary = data.summary;

		if (data.trigger !== undefined || data.nodes !== undefined || data.pipes !== undefined) {
			const definition = pipeline.definition || {};
			updates.definition = JSON.stringify({
				trigger: data.trigger !== undefined ? data.trigger : definition.trigger,
				nodes: data.nodes !== undefined ? data.nodes : definition.nodes,
				pipes: data.pipes !== undefined ? data.pipes : definition.pipes,
			});
		}

		if (data.isPublic !== undefined) {
			updates.is_public = data.isPublic;
			if (data.isPublic && !pipeline.shareToken) {
				updates.share_token = nanoid(10);
			}
		}

		const [updated] = await this.db("pipelines").where({ id: pipelineId }).update(updates).returning("*");

		return this.formatPipeline(updated);
	}

	/** Delete pipeline */
	async deletePipeline(pipelineId, userId) {
		await this.getPipeline(pipelineId, userId);
		await this.db("pipelines").where({ id: pipelineId }).delete();
	}

	/** Clone public pipeline */
	async clonePipeline(shareToken, userId) {
		const source = await this.db("pipelines").where({ share_token: shareToken, is_public: true }).first();

		if (!source) throw new NotFoundError("Pipeline not found or not public");

		const definition = typeof source.definition === "string" ? JSON.parse(source.definition) : source.definition;

		const now = Date.now();

		const [cloned] = await this.db("pipelines")
			.insert({
				user_id: userId,
				title: `${source.title} (Clone)`,
				summary: source.summary,
				definition: JSON.stringify(definition),
				is_public: false,
				cloned_from: source.id,
				created_at: now,
				updated_at: now,
			})
			.returning("*");

		await this.db("pipelines").where({ id: source.id }).increment("clone_count", 1);

		return this.formatPipeline(cloned);
	}

	/** Format database row to API response */
	formatPipeline(row) {
		const definition = typeof row.definition === "string" ? JSON.parse(row.definition) : row.definition;

		return {
			id: row.id,
			userId: row.user_id,
			title: row.title,
			summary: row.summary,
			trigger: definition.trigger,
			nodes: definition.nodes,
			pipes: definition.pipes,
			isPublic: row.is_public,
			shareToken: row.share_token,
			clonedFrom: row.cloned_from,
			cloneCount: row.clone_count,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		};
	}
}
