/**
 * @fileoverview Trigger Manager - Handles all pipeline triggers
 * @module background/execution/trigger-manager
 */

import { TurbineEngine } from "./TurbineEngine.js";

/**
 * Manages all pipeline triggers
 * Handles manual, schedule, webhook, and file watch triggers
 */
export class TriggerManager {
	constructor() {
		this.turbineEngine = new TurbineEngine();
	}

	handlers = {
		EXECUTE_PIPELINE: this.handleExecutePipeline.bind(this),
		SCHEDULE_PIPELINE: (message) => this.schedulePipeline(message.pipelineId, message.schedule),
		UNSCHEDULE_PIPELINE: (message) => this.unschedulePipeline(message.pipelineId),
	};

	// EXECUTE
	async handleExecutePipeline(message) {
		console.log(`Manual trigger for pipeline: ${message.pipelineId}`);

		return await this.turbineEngine.executePipeline(message.pipelineId, {
			type: "manual",
			data: message.inputData,
			timestamp: Date.now(),
		});
	}

	/**
	 * Handle alarms (schedule trigger)
	 * @param {Object} alarm - Alarm object
	 */
	async handleAlarm(alarm) {
		const pipelineId = alarm.name.replace("pipeline_", "");
		console.log(`Schedule trigger for pipeline: ${pipelineId}`);

		try {
			await this.turbineEngine.executePipeline(pipelineId, {
				type: "schedule",
				timestamp: Date.now(),
				alarmName: alarm.name,
			});
		} catch (error) {
			console.log(`Schedule trigger failed: ${error.message}`);
		}
	}

	/**
	 * Schedule a pipeline
	 * @param {string} pipelineId - Pipeline identifier
	 * @param {Object} schedule - Schedule configuration
	 */
	async schedulePipeline(pipelineId, schedule) {
		const alarmName = `pipeline_${pipelineId}`;

		// Clear existing alarm
		await chrome.alarms.clear(alarmName);

		// Create new alarm based on schedule type
		if (schedule.type === "once") {
			await chrome.alarms.create(alarmName, {
				when: new Date(schedule.dateTime).getTime(),
			});
		} else {
			// Recurring schedule
			const periodInMinutes = this.getPeriodInMinutes(schedule.frequency);

			await chrome.alarms.create(alarmName, {
				when: Date.now() + periodInMinutes * 60 * 1000,
				periodInMinutes,
			});
		}

		console.log(`Scheduled pipeline ${pipelineId}: ${JSON.stringify(schedule)}`);
	}

	/**
	 * Unschedule a pipeline
	 * @param {string} pipelineId - Pipeline identifier
	 */
	async unschedulePipeline(pipelineId) {
		const alarmName = `pipeline_${pipelineId}`;
		await chrome.alarms.clear(alarmName);
		console.log(`Unscheduled pipeline: ${pipelineId}`);
	}

	/**
	 * Get period in minutes from frequency string
	 * @param {string} frequency - Frequency (every_1_day, every_7_day, etc.)
	 * @returns {number} Period in minutes
	 */
	getPeriodInMinutes(frequency) {
		const periods = {
			every_1_hour: 60,
			every_6_hours: 360,
			every_12_hours: 720,
			every_1_day: 1440,
			every_7_days: 10080,
			every_30_days: 43200,
		};

		return periods[frequency] || 1440; // Default 1 day
	}

	/**
	 * Setup file watcher for pipeline
	 * @param {string} pipelineId - Pipeline identifier
	 * @param {FileSystemDirectoryHandle} directoryHandle - Directory handle
	 */
	/* async setupFileWatcher(pipelineId, directoryHandle) {
		// File System Observer API
		if (typeof FileSystemObserver === "undefined") {
			console.log("File System Observer API not available");
			return;
		}

		try {
			const observer = new FileSystemObserver(async (records) => {
				for (const record of records) {
					console.log(`File change detected: ${record.type}`);

					try {
						const file = await record.root.getFile();
						const content = await file.text();

						await turbineEngine.executePipeline(pipelineId, {
							type: "file_watch",
							filename: file.name,
							data: content,
							changeType: record.type,
							timestamp: Date.now(),
						});
					} catch (error) {
						console.log(`File watch execution failed: ${error.message}`);
					}
				}
			});

			await observer.observe(directoryHandle);

			console.log(`File watcher setup for pipeline: ${pipelineId}`);
		} catch (error) {
			console.log(`Failed to setup file watcher: ${error.message}`);
		}
	} */
}
