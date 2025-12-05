import { SERVER_URL } from "../js/constant.js";

export class ApiClient {
	constructor() {
		this.token = null;
	}

	async setToken(token) {
		this.token = token;
		await chrome.storage.local.set({ authToken: token });
	}

	async getToken() {
		if (!this.token) {
			const { authToken } = await chrome.storage.local.get("authToken");
			this.token = authToken;
		}
		return this.token;
	}

	async request(endpoint, options = {}) {
		const token = await this.getToken();
		const headers = {
			"Content-Type": "application/json",
			...options.headers,
		};

		if (token) headers.Authorization = `Bearer ${token}`;

		const response = await fetch(`${SERVER_URL}${endpoint}`, {
			...options,
			headers,
		});

		if (response.status === 401) {
			await this.setToken(null);
			throw new Error("Unauthorized");
		}

		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: "Request failed" }));
			throw new Error(error.message || "Request failed");
		}

		return await response.json();
	}

	async signup(email, password, displayName) {
		const data = await this.request("/auth/signup", {
			method: "POST",
			body: JSON.stringify({ email, password, displayName }),
		});
		await this.setToken(data.token);
		return data.user;
	}

	async login(email, password) {
		const data = await this.request("/auth/login", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		});
		await this.setToken(data.token);
		return data.user;
	}

	async logout() {
		await this.setToken(null);
	}

	async getMe() {
		return await this.request("/auth/me");
	}

	async listPipelines() {
		return await this.request("/pipelines");
	}

	async createPipeline(pipeline) {
		return await this.request("/pipelines", {
			method: "POST",
			body: JSON.stringify({
				name: pipeline.name,
				description: pipeline.description,
				config: pipeline,
				isPublic: false,
			}),
		});
	}

	async updatePipeline(serverId, pipeline) {
		return await this.request(`/pipelines/${serverId}`, {
			method: "PUT",
			body: JSON.stringify({
				name: pipeline.name,
				description: pipeline.description,
				config: pipeline,
			}),
		});
	}
}
