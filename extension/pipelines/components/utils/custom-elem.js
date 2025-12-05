export class CustomElem extends HTMLSpanElement {
	constructor(text) {
		super();
		text && (this.text = new Text(text));
	}

	connectedCallback() {
		this.replaceChildren(this.text);
	}
}

customElements.define("custom-elem", CustomElem, { extends: "span" });

export class IconButton extends HTMLButtonElement {
	constructor(icon, text) {
		super();
	}

	connectedCallback() {
		// this.replaceChildren(this.render());
	}
}

customElements.define("custom-elem", IconButton, { extends: "button" });
