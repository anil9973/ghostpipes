import bcrypt from "bcrypt";
import { ValidationError, UnauthorizedError } from "../../utils/errors.js";

export class AuthService {
	constructor(db) {
		this.db = db;
	}

	/** Create new user account */
	async signup(email, password, displayName) {
		const existing = await this.db("users").where({ email }).first();
		if (existing) throw new ValidationError("Email already registered");

		const passwordHash = await bcrypt.hash(password, 10);

		const [user] = await this.db("users")
			.insert({
				email,
				password_hash: passwordHash,
				display_name: displayName || null,
			})
			.returning(["id", "email", "display_name", "created_at"]);

		return user;
	}

	/** Authenticate user and return token */
	async login(email, password) {
		const user = await this.db("users").where({ email }).first();
		if (!user) throw new UnauthorizedError("Invalid credentials");

		const valid = await bcrypt.compare(password, user.password_hash);
		if (!valid) throw new UnauthorizedError("Invalid credentials");

		return {
			id: user.id,
			email: user.email,
			displayName: user.display_name,
		};
	}

	/** Get user by ID */
	async getUserById(userId) {
		const user = await this.db("users").where({ id: userId }).first("id", "email", "display_name", "created_at");
		return user;
	}
}
