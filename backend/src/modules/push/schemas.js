export const subscribeSchema = {
	body: {
		type: "object",
		required: ["endpoint", "keys"],
		properties: {
			endpoint: { type: "string" },
			keys: {
				type: "object",
				required: ["p256dh", "auth"],
				properties: {
					p256dh: { type: "string" },
					auth: { type: "string" },
				},
			},
		},
	},
};

export const unsubscribeSchema = {
	body: {
		type: "object",
		required: ["endpoint"],
		properties: {
			endpoint: { type: "string" },
		},
	},
};
