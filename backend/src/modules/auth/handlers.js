export class AuthHandlers {
	constructor(authService) {
		this.authService = authService;
	}

	/** POST /auth/signup */
	async signup(request, reply) {
		const { email, password, displayName } = request.body;
		const user = await this.authService.signup(email, password, displayName);
		const token = await reply.jwtSign({ userId: user.id });

		return { user, token };
	}

	/** POST /auth/login */
	async login(request, reply) {
		const { email, password } = request.body;
		const user = await this.authService.login(email, password);
		const token = await reply.jwtSign({ userId: user.id });

		return { user, token };
	}

	/** GET /auth/me */
	async getMe(request, reply) {
		const user = await this.authService.getUserById(request.user.userId);
		return { user };
	}
}
