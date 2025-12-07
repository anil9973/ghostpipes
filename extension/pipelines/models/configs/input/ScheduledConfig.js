import { BaseConfig } from "../../BaseConfig.js";
import { HttpMethod, HttpHeader, QueryParam } from "./HttpRequestConfig.js";

/** @enum {string} Schedule frequency */
export const ScheduleFrequency = {
	ONCE: "once", // Run once at specific time
	MINUTELY: "minutely", // Every N minutes
	HOURLY: "hourly", // Every N hours
	DAILY: "daily", // Every day at specific time
	WEEKLY: "weekly", // Specific days of week
	MONTHLY: "monthly", // Specific day of month
	CUSTOM: "custom", // Cron expression
};

/** @enum {number} Days of week */
export const DayOfWeek = {
	SUNDAY: 0,
	MONDAY: 1,
	TUESDAY: 2,
	WEDNESDAY: 3,
	THURSDAY: 4,
	FRIDAY: 5,
	SATURDAY: 6,
};

/**
 * Schedule configuration for time-based pipeline triggers
 */
export class ScheduleConfig extends BaseConfig {
	/**
	 * @param {Object} init
	 * @param {ScheduleFrequency} [init.frequency] - Schedule frequency
	 * @param {number} [init.interval] - Interval value (for minutely/hourly)
	 * @param {string} [init.time] - Time of day (HH:MM format)
	 * @param {number[]} [init.daysOfWeek] - Days for weekly schedule
	 * @param {number} [init.dayOfMonth] - Day for monthly schedule
	 * @param {string} [init.cronExpression] - Custom cron expression
	 * @param {Date} [init.startDate] - When to start schedule
	 * @param {Date} [init.endDate] - When to stop schedule
	 * @param {string} [init.timezone] - Timezone for schedule
	 * @param {boolean} [init.enabled] - Whether schedule is active
	 */
	constructor(init = {}) {
		super();

		/** @type {ScheduleFrequency} How often to run */
		this.frequency = init.frequency || ScheduleFrequency.DAILY;

		/** @type {number} Interval for minutely/hourly (e.g., every 5 minutes) */
		this.interval = init.interval || 1;

		/** @type {string} Time of day in HH:MM format (24-hour) */
		this.time = init.time || "09:00";

		/** @type {number[]} Days of week for weekly schedule */
		this.daysOfWeek = init.daysOfWeek || [DayOfWeek.MONDAY];

		/** @type {number} Day of month (1-31) for monthly schedule */
		this.dayOfMonth = init.dayOfMonth || 1;

		/** @type {string} Custom cron expression */
		this.cronExpression = init.cronExpression || "";

		/** @type {string} ISO date string for start */
		this.startDate = init.startDate ? new Date(init.startDate).toISOString() : new Date().toISOString();

		/** @type {string|null} ISO date string for end */
		this.endDate = init.endDate ? new Date(init.endDate).toISOString() : null;

		/** @type {string} Timezone (IANA format) */
		this.timezone = init.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

		/** @type {boolean} Whether schedule is active */
		this.enabled = init.enabled ?? true;
	}

	getSchema() {
		return {
			frequency: {
				type: "string",
				required: true,
				enum: Object.values(ScheduleFrequency),
			},
			interval: {
				type: "number",
				required: false,
				min: 1,
			},
			time: {
				type: "string",
				required: false,
				pattern: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
			},
			daysOfWeek: {
				type: "array",
				required: false,
			},
			dayOfMonth: {
				type: "number",
				required: false,
				min: 1,
				max: 31,
			},
			cronExpression: {
				type: "string",
				required: false,
			},
			enabled: {
				type: "boolean",
				required: false,
			},
		};
	}

	getSummary() {
		if (!this.enabled) return "Schedule disabled";

		switch (this.frequency) {
			case ScheduleFrequency.ONCE:
				return `Run once at ${new Date(this.startDate).toLocaleString()}`;

			case ScheduleFrequency.MINUTELY:
				return this.interval === 1 ? "Every minute" : `Every ${this.interval} minutes`;

			case ScheduleFrequency.HOURLY:
				return this.interval === 1 ? "Every hour" : `Every ${this.interval} hours`;

			case ScheduleFrequency.DAILY:
				return `Daily at ${this.time}`;

			case ScheduleFrequency.WEEKLY:
				const days = this.daysOfWeek
					.map((d) => Object.keys(DayOfWeek).find((k) => DayOfWeek[k] === d))
					.map((d) => d?.slice(0, 3))
					.join(", ");
				return `Weekly on ${days} at ${this.time}`;

			case ScheduleFrequency.MONTHLY:
				return `Monthly on day ${this.dayOfMonth} at ${this.time}`;

			case ScheduleFrequency.CUSTOM:
				return `Cron: ${this.cronExpression}`;

			default:
				return "Schedule configured";
		}
	}

	/** Convert to cron expression */
	toCronExpression() {
		if (this.frequency === ScheduleFrequency.CUSTOM) return this.cronExpression;

		const [hour, minute] = this.time.split(":").map(Number);

		switch (this.frequency) {
			case ScheduleFrequency.MINUTELY:
				return `*/${this.interval} * * * *`;

			case ScheduleFrequency.HOURLY:
				return `${minute} */${this.interval} * * *`;

			case ScheduleFrequency.DAILY:
				return `${minute} ${hour} * * *`;

			case ScheduleFrequency.WEEKLY:
				const days = this.daysOfWeek.join(",");
				return `${minute} ${hour} * * ${days}`;

			case ScheduleFrequency.MONTHLY:
				return `${minute} ${hour} ${this.dayOfMonth} * *`;

			default:
				return "";
		}
	}
}

/**
 * Configuration for scheduled HTTP request node
 * Fetches data from URLs on a time-based schedule
 */
export class ScheduledHttpConfig extends BaseConfig {
	/**
	 * @param {Object} init
	 * @param {HttpMethod} [init.method] - HTTP method (GET recommended)
	 * @param {string} [init.url] - Target URL to fetch
	 * @param {Array<Object>} [init.headers] - HTTP headers
	 * @param {Array<Object>} [init.queryParams] - URL query parameters
	 * @param {string} [init.body] - Request body (for POST/PUT)
	 * @param {number} [init.timeout] - Request timeout in ms
	 * @param {Object} [init.schedule] - Schedule configuration
	 * @param {boolean} [init.enabled] - Whether schedule is active
	 * @param {number} [init.maxRetries] - Max retry attempts on failure
	 * @param {number} [init.retryDelay] - Delay between retries in ms
	 */
	constructor(init = {}) {
		super();

		/** @type {HttpMethod} HTTP request method */
		this.method = init.method || HttpMethod.GET;

		/** @type {string} Target URL to fetch */
		this.url = init.url || "";

		/** @type {HttpHeader[]} Request headers */
		this.headers = (init.headers || []).map((h) => new HttpHeader(h));

		/** @type {QueryParam[]} Query parameters */
		this.queryParams = (init.queryParams || []).map((q) => new QueryParam(q));

		/** @type {string} Request body */
		this.body = init.body || "";

		/** @type {number} Request timeout in milliseconds */
		this.timeout = init.timeout || 10000;

		/** @type {ScheduleConfig} Schedule configuration */
		this.schedule = init.schedule ? new ScheduleConfig(init.schedule) : new ScheduleConfig();

		/** @type {boolean} Whether schedule is active */
		this.enabled = init.enabled ?? true;

		/** @type {number} Maximum retry attempts on failure */
		this.maxRetries = init.maxRetries || 3;

		/** @type {number} Delay between retries in milliseconds */
		this.retryDelay = init.retryDelay || 5000;
	}

	getSchema() {
		return {
			method: {
				type: "string",
				required: true,
				enum: Object.values(HttpMethod),
			},
			url: {
				type: "string",
				required: true,
				format: "url",
			},
			headers: {
				type: "array",
				required: false,
			},
			queryParams: {
				type: "array",
				required: false,
			},
			body: {
				type: "string",
				required: false,
			},
			timeout: {
				type: "number",
				required: false,
				min: 1000,
				max: 300000,
			},
			schedule: {
				type: "object",
				required: true,
			},
			enabled: {
				type: "boolean",
				required: false,
			},
			maxRetries: {
				type: "number",
				required: false,
				min: 0,
				max: 10,
			},
			retryDelay: {
				type: "number",
				required: false,
				min: 1000,
			},
		};
	}

	getSummary() {
		if (!this.url) return "No URL configured";
		if (!this.enabled) return "Schedule disabled";

		const url = this.url.length > 40 ? this.url.slice(0, 37) + "..." : this.url;
		const scheduleText = this.schedule.getSummary();
		return `${this.method} ${url} (${scheduleText})`.slice(0, 120);
	}

	/** Get next scheduled run time */
	getNextRun() {
		if (!this.enabled || !this.schedule.enabled) return null;

		// This would use a cron parser in production
		// For now, return placeholder
		return new Date(Date.now() + 3600000); // 1 hour from now
	}
}
