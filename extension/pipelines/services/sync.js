import { StorageManager } from "./storage.js";
import { ApiClient } from "./api.js";

export class SyncService {
	constructor() {
		this.storage = new StorageManager();
		this.api = new ApiClient();
		this.syncTimer = null;
		this.pendingChanges = new Set();
	}

	/** Mark pipeline for sync */
	markForSync(pipelineId) {
		this.pendingChanges.add(pipelineId);
		this.scheduleSyncCheck();
	}

	/** Schedule sync check with debounce */
	scheduleSyncCheck() {
		if (this.syncTimer) clearTimeout(this.syncTimer);

		this.syncTimer = setTimeout(() => {
			this.performSync();
		}, 15000); // 15 second delay
	}

	/** Perform actual sync */
	async performSync() {
		const token = await this.storage.getAuthToken();
		if (!token) {
			console.log("Sync skipped - user not logged in");
			this.pendingChanges.clear();
			return;
		}

		const changedIds = Array.from(this.pendingChanges);
		this.pendingChanges.clear();

		for (const pipelineId of changedIds) {
			try {
				const pipeline = await this.storage.getPipeline(pipelineId);
				if (!pipeline) continue;

				const syncData = {
					title: pipeline.title,
					summary: pipeline.summary,
					trigger: pipeline.trigger,
					nodes: pipeline.nodes,
					pipes: pipeline.pipes,
					isPublic: false,
				};

				if (pipeline.serverId) {
					await this.api.updatePipeline(pipeline.serverId, syncData);
				} else {
					const created = await this.api.createPipeline(syncData);
					await this.storage.updatePipelineServerId(pipelineId, created.id);
				}

				console.log(`Synced pipeline: ${pipelineId}`);
			} catch (error) {
				console.error(`Failed to sync pipeline ${pipelineId}:`, error);
				this.pendingChanges.add(pipelineId);
			}
		}
	}

	/** Full sync from server */
	async fullSync() {
		const token = await this.storage.getAuthToken();
		if (!token) return;

		try {
			const { pipelines } = await this.api.listPipelines();

			for (const serverPipeline of pipelines) {
				const localPipeline = await this.storage.getPipelineByServerId(serverPipeline.id);

				if (!localPipeline) {
					// Server has pipeline we don't - download it
					const full = await this.api.getPipeline(serverPipeline.id);
					await this.storage.savePipeline({
						id: crypto.randomUUID(), // New local ID
						serverId: full.id,
						title: full.title,
						summary: full.summary,
						trigger: full.trigger,
						nodes: full.nodes,
						pipes: full.pipes,
						createdAt: full.createdAt,
						updatedAt: full.updatedAt,
					});
				} else if (serverPipeline.updatedAt > localPipeline.updatedAt) {
					// Server version is newer - update local
					const full = await this.api.getPipeline(serverPipeline.id);
					await this.storage.updatePipeline(localPipeline.id, {
						title: full.title,
						summary: full.summary,
						trigger: full.trigger,
						nodes: full.nodes,
						pipes: full.pipes,
						updatedAt: full.updatedAt,
					});
				}
			}

			console.log("Full sync completed");
		} catch (error) {
			console.error("Full sync failed:", error);
		}
	}
}
