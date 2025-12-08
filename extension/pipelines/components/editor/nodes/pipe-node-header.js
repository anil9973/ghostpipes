import { html } from "../../../../lib/om.compact.js";
import { NodeType, PipeNode } from "../../../models/PipeNode.js";
import { AggregateDataNodePopup } from "./processing/aggregate-data-node.js";
import { ConditionalDataNodePopup } from "./processing/conditional-data-node.js";
import { CustomCodeDataNodePopup } from "./processing/custom-code-data-node.js";
import { DeduplicateDataNodePopup } from "./processing/deduplicate-data-node.js";
import { DistinctDataNodePopup } from "./processing/distinct-data-node.js";
import { FilterDataNodePopup } from "./processing/filter-data-node.js";
import { FormatDataNodePopup } from "./processing/format-data-node.js";
import { IntersectDataNodePopup } from "./processing/intersect-data-node.js";
import { JoinDataNodePopup } from "./processing/join-data-node.js";
import { LookupDataNodePopup } from "./processing/lookup-data-node.js";
import { LoopDataNodePopup } from "./processing/loop-data-node.js";
import { ParseDataNodePopup } from "./processing/parse-data-node.js";
import { RegrexPatternDataNodePopup } from "./processing/regrex-pattern-data-node.js";
import { SchemaValidatorDataNodePopup } from "./processing/schema-validator-data-node.js";
import { SortDataNodePopup } from "./processing/sort-data-node.js";
import { SplitDataNodePopup } from "./processing/split-data-node.js";
import { StringBuilderDataNodePopup } from "./processing/string-builder-data-node.js";
import { SwitchDataNodePopup } from "./processing/switch-data-node.js";
import { TransformDataNodePopup } from "./processing/transform-data-node.js";
import { UnionDataNodePopup } from "./processing/union-data-node.js";
import { UntilLoopDataNodePopup } from "./processing/until-loop-data-node.js";
import { UrlBuilderDataNodePopup } from "./processing/url-builder-data-node.js";
import { ValidateDataNodePopup } from "./processing/validate-data-node.js";
import { FileWatchNodePopup } from "./input/file-watch-node.js";
import { HttpFetchNodePopup } from "./input/http-fetch-node.js";
import { ManualUploadNodePopup } from "./input/manual-upload-node.js";
import { FileAppendNodePopup } from "./output/file-append-node.js";
import { HttpPostRequestNodePopup } from "./output/http-post-request-node.js";
import { SendEmailNodePopup } from "./output/send-email-node.js";
import { DownloadNodePopup } from "./output/download-node.js";
import { ScheduledHttpNodePopup } from "./input/scheduled-http-node.js";
import { SpreedsheetExportNodePopup } from "./output/spreedshot-export-node.js";
import { DriveUploadNodePopup } from "./output/drive-upload-node.js";

// Factory map using arrow functions
const NODE_COMPONENT_MAP = Object.freeze({
	manual_input: (node) => new ManualUploadNodePopup(node),
	http_request: (node) => new HttpFetchNodePopup(node),
	scheduled_http: (node) => new ScheduledHttpNodePopup(node),
	file_watch: (node) => new FileWatchNodePopup(node),

	filter: (node) => new FilterDataNodePopup(node),
	transform: (node) => new TransformDataNodePopup(node),
	join: (node) => new JoinDataNodePopup(node),
	split: (node) => new SplitDataNodePopup(node),
	deduplicate: (node) => new DeduplicateDataNodePopup(node),
	validate: (node) => new ValidateDataNodePopup(node),
	aggregate: (node) => new AggregateDataNodePopup(node),
	sort: (node) => new SortDataNodePopup(node),
	regex_pattern: (node) => new RegrexPatternDataNodePopup(node),
	parse: (node) => new ParseDataNodePopup(node),
	format: (node) => new FormatDataNodePopup(node),
	schema_validator: (node) => new SchemaValidatorDataNodePopup(node),

	condition: (node) => new ConditionalDataNodePopup(node),
	switch: (node) => new SwitchDataNodePopup(node),
	loop: (node) => new LoopDataNodePopup(node),
	until_loop: (node) => new UntilLoopDataNodePopup(node),
	custom_code: (node) => new CustomCodeDataNodePopup(node),

	string_builder: (node) => new StringBuilderDataNodePopup(node),
	url_builder: (node) => new UrlBuilderDataNodePopup(node),
	lookup: (node) => new LookupDataNodePopup(node),
	union: (node) => new UnionDataNodePopup(node),
	intersect: (node) => new IntersectDataNodePopup(node),
	distinct: (node) => new DistinctDataNodePopup(node),

	download: (node) => new DownloadNodePopup(node),
	file_append: (node) => new FileAppendNodePopup(node),
	http_post: (node) => new HttpPostRequestNodePopup(node),
	email_send: (node) => new SendEmailNodePopup(node),
	[NodeType.SPREADSHEET_WRITE]: (node) => new SpreedsheetExportNodePopup(node),
	[NodeType.DRIVE_UPLOAD]: (node) => new DriveUploadNodePopup(node),
});

export class PipeNodeHeader extends HTMLElement {
	/** @param {PipeNode} pipeNode  */
	constructor(pipeNode) {
		super();
		this.pipeNode = pipeNode;
	}

	handleEdit(evt) {
		evt.stopPropagation();
		console.log(this.pipeNode.type);
		const configPopupElem = NODE_COMPONENT_MAP[this.pipeNode.type]?.(this.pipeNode);
		if (!configPopupElem) return notify(`No config component found for type: ${this.pipeNode.type}`, "error");

		configPopupElem.addEventListener("savenodeconfig", (event) => {
			const summaryEl = this.querySelector("blockquote");
			if (summaryEl) summaryEl.textContent = this.pipeNode.summary;
			fireEvent(this, "update");
			configPopupElem.remove();
		});

		/* configPopupElem.addEventListener("delete-node", () => {
			this.handleDelete();
			configPopupElem.remove();
		}); */

		const rect = this.parentElement.getBoundingClientRect();
		configPopupElem.style.left = rect.left - 100 + "px";
		configPopupElem.style.top = rect.top + 30 + "px";
		document.body.appendChild(configPopupElem);
	}

	handleDelete(evt) {
		evt.stopPropagation();
		if (confirm(`Delete node "${this.pipeNode.title}"?`)) fireEvent(this, "delete");
	}

	render() {
		return html`<svg class="icon"><use href="/assets/icons.svg#${this.pipeNode.type.replace(/_/, "-")}"></use></svg>
			<span>${this.pipeNode.title}</span>
			<div class="action-btns">
				<button class="icon-btn edit-btn" @click=${this.handleEdit.bind(this)} title="Edit">
					<svg class="icon"><use href="/assets/icons.svg#edit"></use></svg>
				</button>
				<button class="icon-btn delete-btn" @click=${this.handleDelete.bind(this)} title="Delete">
					<svg class="icon"><use href="/assets/icons.svg#delete"></use></svg>
				</button>
			</div> `;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
		$on(this, "openconfigpopup", this.handleEdit.bind(this));
	}
}

customElements.define("pipe-node-header", PipeNodeHeader, { extends: "header" });
