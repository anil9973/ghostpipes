import { ScheduledHttpConfig, ScheduleFrequency } from "../../../../models/configs/input/ScheduledConfig.js";
import { html, react, map } from "../../../../../lib/om.compact.js";
import { NodeConfigHeader } from "../config-node-header.js";
import { pipedb } from "../../../../db/pipeline-db.js";
import { PipeNode } from "../../../../models/PipeNode.js";
import { ConfigErrorBox } from "../config-error-box.js";
import { KeyValueRow } from "./http-fetch-node.js";

export class ScheduledHttpNodePopup extends HTMLElement {
	/** @param {PipeNode} pipeNode */
	constructor(pipeNode) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.pipeNode = pipeNode;
		/** @type {ScheduledHttpConfig}  */
		this.config = pipeNode.config;
		this.errors = react([]);
		this.ensureEmptyRows();
	}

	ensureEmptyRows() {
		this.ensureEmptyRow(this.config.headers);
		this.ensureEmptyRow(this.config.queryParams);
	}

	ensureEmptyRow(list) {
		const last = list[list.length - 1];
		if (!last || last.key !== "" || last.value !== "") list.push({ key: "", value: "" });
	}

	handleRowInput(list, index) {
		if (index === list.length - 1) this.ensureEmptyRow(list);
	}

	handleRemoveRow(list, index) {
		list.splice(index, 1);
		this.ensureEmptyRow(list);
	}

	async handleSave() {
		this.errors.splice(0, this.errors.length, ...this.config.validate());
		if (this.errors.length !== 0) return;
		try {
			this.config.headers = this.config.headers.filter((h) => h.key.trim() !== "");
			this.config.queryParams = this.config.queryParams.filter((q) => q.key.trim() !== "");
			this.pipeNode.summary = this.config.getSummary();

			const config = Object.assign({}, this.config);
			//prettier-ignore
			config.headers = Object.assign([], this.config.headers.map((h) => Object.assign({}, h)));
			//prettier-ignore
			config.queryParams = Object.assign([], this.config.queryParams.map((q) => Object.assign({}, q)));
			await pipedb.updateNodeConfig(this.pipeNode.id, config, this.pipeNode.summary);

			fireEvent(this, "savenodeconfig", this.pipeNode);
			this.ensureEmptyRows();
			this.hidePopover();
		} catch (error) {
			console.error(error);
		}
	}

	onClosedPopover() {
		// TODO validate
	}

	render() {
		return html`<section>
			<ul class="config-field-list">
				<label>
					<div>Schedule</div>
					<div class="select-input">
						<select .value=${() => this.config.method}>
							<option value="${ScheduleFrequency.ONCE}">Once</option>
							<option value="${ScheduleFrequency.MINUTELY}">Minutely</option>
							<option value="${ScheduleFrequency.HOURLY}">Hourly</option>
							<option value="${ScheduleFrequency.DAILY}">Daily</option>
							<option value="${ScheduleFrequency.WEEKLY}">Weekly</option>
							<option value="${ScheduleFrequency.MONTHLY}">Monthly</option>
							<option value="${ScheduleFrequency.CUSTOM}">Custom</option>
						</select>
						<input type="text" />
					</div>
				</label>

				<label>
					<div>Request URL</div>
					<div class="select-input">
						<select .value=${() => this.config.method}>
							<option value="GET">GET</option>
							<option value="POST">POST</option>
							<option value="PUT">PUT</option>
							<option value="DELETE">DELETE</option>
						</select>
						<input type="url" .value=${() => this.config.url} placeholder="https://api.example.com/data" />
					</div>
				</label>

				<tabular-carousel>
					<tab-strip-row>
						<div class="active">Headers</div>
						<div>Query</div>
					</tab-strip-row>

					<carousel-body>
						<table class="headers">
							<thead>
								<tr>
									<th>Key</th>
									<th>Value</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								${map(
									this.config.headers,
									(row, i) =>
										new KeyValueRow(row, this.handleRemoveRow.bind(this, this.config.headers, i), "Header", "Value")
								)}
							</tbody>
						</table>
						<table class="query-params">
							<thead>
								<tr>
									<th>Param</th>
									<th>Value</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								${map(
									this.config.queryParams,
									(row, i) =>
										new KeyValueRow(
											row,
											this.handleRemoveRow.bind(this, this.config.queryParams, i),
											"q", // keyPlaceholder
											"search" // valuePlaceholder
										)
								)}
							</tbody>
						</table>
					</carousel-body>
				</tabular-carousel>
			</ul>
		</section> `;
	}

	connectedCallback() {
		const header = new NodeConfigHeader({ icon: "schedule-http", title: "Schedule HTTP" });
		header.addEventListener("update", this.handleSave.bind(this));
		this.replaceChildren(header, this.render(), new ConfigErrorBox(this.errors));
		this.showPopover();
		$on(this, "toggle", (evt) => evt.newState === "closed" && this.onClosedPopover());
	}
}

customElements.define("schedule-http-node-card", ScheduledHttpNodePopup);
