export const createWebhookSchema = {
	body: {
		type: "object",
		required: ["pipelineId"],
		properties: {
			pipelineId: { type: "string", format: "uuid" },
			method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE", "PATCH"] },
		},
	},
};
