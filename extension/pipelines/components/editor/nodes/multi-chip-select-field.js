import { html, map } from "../../../../lib/om.compact.js";

export class MultiChipSelectField extends HTMLElement {
	/** @param {string[]} dataList @param {string[]} selected  */
	constructor(dataList, selected, label = "Items") {
		super();
		this.tabIndex = 0;
		this.dataList = dataList;
		this.selected = selected;
		this.label = label;
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
		const dataItem = (item) =>
			html`<li>
				<input type="checkbox" value="${item}" ?checked="${this.selected.includes(item)}" />
				<span>${item}</span>
			</li>`;

		return html`<span>
				<span>${this.label}</span>
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
