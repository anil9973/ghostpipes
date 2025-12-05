Find `pipeline-builder-canvas` in `.kiro/reference/pipeline-builder.html`.
Get all elements endsWith `-node-card`
Convert all elements static to web-component. set this.popover =""; this.className = "node-config-popup";
find all input, select,textarea element field, build NodeData class and set configuration, id, posX, posY, summary. pass NodeData on constructor and make reactive. set .value=${()=> this.nodeData.config.propName}
Why are using insline style. I already told comment not allowed in string template html``. on constructor params, nodeData always pass, it is guarantee avilable. Fix your mistake

Under construction function, write this.popover= ""; this.className = ""
Create Rule class {
id: Date.now(),
enabled: true,
field: "",
operator: "equals",
value: "",
}. Don't use this state; use this.props. why you const { config, properties } = this.state;
It remove reactivity. simply use .value=${() => this.props.config.mode}
Move connectedCallback at last of class after render method.

comment not allowed inside template, Why you make @click=${() => this.handleRemoveRule(index)} It is clearly not allow in om.js framwork. Read docs (.kiro/specs/ui-framework.md). Correct syntax: @click=${this.handleAddRule.bind(this)}.
In datalist element, filter-properties, set dynamic properties.properties pass on FilterNode, loop tableBody row by configuration rules

om.js support dual binding, input value update, i will update FilterNode prperties values. don't need to use @input=${this.handleUpdateField.bind(this, rule, 'value')}
There is no plus rule button.
If no rules available, show table thead and one empty rows in tBody. If some rules avialble, add empty row in tbody. Remove when user click on done icon button click. handleUpdateField
handleToggleRule are redulctant, remove it. replace globalThis.fireEvent to fireEvent

const { config } = this.props; // Dont do this. It break reactivity

Loop all ull, datalist elements.

your need to create 3 web-components `manual-upload-node-card, file-watch-node-card, and http-fetch-node-card` (pipelines/components/editor/nodes/input) in like this following example.

```js
import { html, react, map } from "../../../../lib/om.compact.js";

export class Rule {
	constructor() {
		this.id = Date.now();
		this.enabled = true;
		this.field = "";
		this.operator = "equals";
		this.value = "";
	}
}

export class NodeConfigHeader extends HTMLElement {
	/**@param {{icon:string, title:string}} props */
	constructor(props) {
		super();
		this.props = props;
	}

	handleSave() {
		fireEvent(this, "update");
	}

	handleClose() {
		this.parentElement.hidePopover();
	}

	render() {
		return html`
			<svg class="icon"><use href="/assets/icons.svg#${this.props.icon}"></use></svg>
			<span>${this.props.title}</span>
			<div class="action-btns">
				<button class="icon-btn" @click=${this.handleSave.bind(this)} title="Save & Close">
					<svg class="icon"><use href="/assets/icons.svg#check-all"></use></svg>
				</button>
				<button class="icon-btn" @click=${this.handleClose.bind(this)} title="Close">
					<svg class="icon"><use href="/assets/icons.svg#close"></use></svg>
				</button>
			</div>
		`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}
customElements.define("node-card-header", NodeConfigHeader);

export class FilterRuleTabRow extends HTMLTableRowElement {
	constructor(rowData) {
		super();
		this.rowData = rowData;
	}

	render() {
		const firstRow = html`<td>
				<input type="checkbox" ?checked=${() => item.enabled} />
			</td>
			<td>
				<select .value=${() => item.type}>
					<option value="sum">SUM</option>
					<option value="avg">AVG</option>
					<option value="count">COUNT</option>
					<option value="min">MIN</option>
					<option value="max">MAX</option>
				</select>
			</td>`;
		this.insertCell(firstRow);
		//... add more cells
	}

	connectedCallback() {
		this.render();
	}
}

customElements.define("filter-data-node", FilterRuleTabRow, { extends: "tr" });

import { html, map } from "../../../../lib/om.compact.js";

export class MultiChipSelectField extends HTMLElement {
	/** @param {string[]} dataList @param {string[]} selected  */
	constructor(dataList, selected) {
		super();
		this.tabIndex = 0;
		this.dataList = dataList;
		this.selected = selected;
	}

	onSelectChange({ target }) {
		if (target.checked) {
			this.selected.push(target.value);
			//BUG index is not defined in reactive push
			this.children[1].firstElementChild.lastElementChild["dataset"].index = this.selected.length - 1; //TEMP change later
		} else {
			const index = this.selected.indexOf(target.value);
			index === -1 || this.selected.splice(index, 1);
		}
	}

	onInputFieldClick({ target }) {
		if (target.closest("atom-icon")) {
			const index = +target.closest("chip-item").dataset.index;
			this.selected.splice(index, 1);
			this.lastElementChild.children[index].firstElementChild["checked"] = false;
		}
	}

	filterChip({ target }) {
		const query = target.value;
		const domainElements = this.lastElementChild.children;
		if (!query) for (const domainElem of domainElements) domainElem["hidden"] = false;
		else
			for (const domainElem of domainElements)
				domainElem["hidden"] = !domainElem.lastElementChild.textContent.includes(query);
	}

	onKeyDown({ code, target }) {
		if (code !== "Enter") return;
		this.selected.push(target.value);
		target.value = "";
	}

	render() {
		const chipItem = (item, index) =>
			html`<chip-item data-index="${index}"><span>${item}</span> <atom-icon ico="close"></atom-icon></chip-item>`;
		const dataItem = (webpage) =>
			html`<li>
				<input type="checkbox" value="${webpage.domain}" ?checked="${this.selected.includes(webpage)}" />
				<img src="${webpage.favIconUrl}" />
				<span>${webpage.domain}</span>
			</li>`;

		return html`<span>
				<span>Field(s) to compare:</span>
			</span>
			<chip-input-box>
				<ul @click=${this.onInputFieldClick.bind(this)}>
					${map(this.selected, chipItem)}
				</ul>
				<input type="text" @keydown=${this.onKeyDown.bind(this)} @input=${this.filterChip.bind(this)} />
			</chip-input-box>
			<multi-select-popup @click=${this.onSelectChange.bind(this)}>
				${map(this.dataList, dataItem)}
			</multi-select-popup>`;
	}

	async connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("multi-chip-select-field", MultiChipSelectField);

// ${new MultiChipSelectField(properties, config.fields, "Fields")}

export class FilterDataNodeCard extends HTMLElement {
	constructor(nodeData) {
		super();
		this.popover = "";
		this.className = "node-config-popup";
		this.props = react(nodeData);
		this.ensureEmptyRow();
	}

	ensureEmptyRow() {
		const rules = this.props.config.rules;
		const lastRule = rules[rules.length - 1];

		if (!lastRule || lastRule.field !== "" || lastRule.value !== "") {
			rules.push(new Rule());
		}
	}

	handleRemoveRule(index) {
		this.props.config.rules.splice(index, 1);
		this.ensureEmptyRow();
	}

	handleRowInput(index) {
		if (index === this.props.config.rules.length - 1) {
			this.ensureEmptyRow();
		}
	}

	handleSave() {
		const validRules = this.props.config.rules.filter((r) => r.field.trim() !== "");
		this.props.config.rules = validRules;

		fireEvent(this, "save-node-config", this.props);
		this.hidePopover();

		this.ensureEmptyRow();
	}

	handleClose() {
		this.hidePopover();
	}

	render() {
		return html`<section>
			<ul class="config-field-list">
				<div>
					<label>
						<select style="display: inline; width: auto;" .value=${() => this.props.config.mode}>
							<option value="permit">Permit</option>
							<option value="block">Block</option>
						</select>
						items that match
						<select style="display: inline; width: auto;" .value=${() => this.props.config.matchType}>
							<option value="all">all</option>
							<option value="any">any</option>
						</select>
						of the following:
					</label>
				</div>

				<table class="rule-list">
					<thead>
						<tr>
							<th><input type="checkbox" disabled /></th>
							<th>Property</th>
							<th>Condition</th>
							<th>Text</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						${map(this.props.config.rules, FilterRuleTabRow(rule))}
					</tbody>
				</table>

				<datalist id="filter-properties">
					${map(this.props.properties, (prop) => html`<option value=${prop}></option>`)}
				</datalist>
			</ul>
		</section> `;
	}

	connectedCallback() {
		this.replaceChildren(new NodeConfigHeader(this.props.type, this.props.title), this.render());
	}
}

customElements.define("filter-data-node-card", FilterDataNodeCard);
```
