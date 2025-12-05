export const createPipelineSchema = {
	body: {
		type: "object",
		required: ["title", "trigger", "nodes", "pipes"],
		properties: {
			title: { type: "string", minLength: 1, maxLength: 255 },
			summary: { type: "string", maxLength: 1000 },
			trigger: {
				type: "object",
				required: ["type", "config"],
				properties: {
					type: { type: "string" },
					config: { type: "object" },
				},
			},
			nodes: {
				type: "array",
				items: {
					type: "object",
					required: ["id", "type"],
					properties: {
						id: { type: "string" },
						type: { type: "string" },
						title: { type: "string" },
						summary: { type: ["string", "null"] },
						position: {
							type: "object",
							properties: {
								x: { type: "number" },
								y: { type: "number" },
							},
						},
						inputs: { type: "array" },
						outputs: { type: "array" },
						config: { type: "object" },
					},
				},
			},
			pipes: {
				type: "array",
				items: {
					type: "object",
					required: ["id", "sourceId", "targetId"],
					properties: {
						id: { type: "string" },
						sourceId: { type: "string" },
						sourceSide: { type: "string" },
						targetId: { type: "string" },
						targetSide: { type: "string" },
					},
				},
			},
			isPublic: { type: "boolean" },
		},
	},
};

export const updatePipelineSchema = {
	params: {
		type: "object",
		required: ["id"],
		properties: {
			id: { type: "string", format: "uuid" },
		},
	},
	body: {
		type: "object",
		properties: {
			title: { type: "string", minLength: 1, maxLength: 255 },
			summary: { type: "string", maxLength: 1000 },
			trigger: {
				type: "object",
				properties: {
					type: { type: "string" },
					config: { type: "object" },
				},
			},
			nodes: { type: "array" },
			pipes: { type: "array" },
			isPublic: { type: "boolean" },
		},
	},
};

export const clonePipelineSchema = {
	params: {
		type: "object",
		required: ["token"],
		properties: {
			token: { type: "string" },
		},
	},
};
