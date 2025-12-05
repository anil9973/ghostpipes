export const signupSchema = {
	body: {
		type: "object",
		required: ["email", "password"],
		properties: {
			email: { type: "string", format: "email" },
			password: { type: "string", minLength: 8 },
			displayName: { type: "string", maxLength: 100 },
		},
	},
};

export const loginSchema = {
	body: {
		type: "object",
		required: ["email", "password"],
		properties: {
			email: { type: "string", format: "email" },
			password: { type: "string" },
		},
	},
};
