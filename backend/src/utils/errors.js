export class AppError extends Error {
	constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
		super(message);
		this.statusCode = statusCode;
		this.code = code;
		this.name = this.constructor.name;
	}
}

export class ValidationError extends AppError {
	constructor(message) {
		super(message, 400, "VALIDATION_ERROR");
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = "Unauthorized") {
		super(message, 401, "UNAUTHORIZED");
	}
}

export class ForbiddenError extends AppError {
	constructor(message = "Forbidden") {
		super(message, 403, "FORBIDDEN");
	}
}

export class NotFoundError extends AppError {
	constructor(message = "Resource not found") {
		super(message, 404, "NOT_FOUND");
	}
}
