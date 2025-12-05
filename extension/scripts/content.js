class SelectActionHandler {
	constructor() {
		document.body.addEventListener("pointerup", this.showSelectActionBtn.bind(this));
	}

	timerId;
	showSelectActionBtn({ pageX, pageY, target }) {
		this.timerId && (clearTimeout(this.timerId), (this.timerId = null));
		const selection = getSelection();
		if (selection.isCollapsed) return this.selectActionBtn && (this.selectActionBtn.hidden ||= true);
		if (!this.selectActionBtn) this.createActionBtn();

		this.selectActionBtn.style.left = pageX + "px";
		this.selectActionBtn.style.top = pageY + "px";
		this.selectActionBtn.hidden = false;
		this.timerId = setTimeout(() => (this.selectActionBtn.hidden ||= true), 4000);
	}

	createActionBtn() {
		this.selectActionBtn = document.createElement("pipelogic-floating-btn");
		const image = new Image();
		image.src = chrome.runtime.getURL("/assets/icon.png");
		this.selectActionBtn.appendChild(image);
		this.selectActionBtn.style.cssText = "position:absolute;cursor:pointer;z-index: 5000;";
		document.body.appendChild(this.selectActionBtn);

		this.selectActionBtn.addEventListener("click", this.onFloatingBtnClick.bind(this));
		return this.selectActionBtn;
	}

	async onFloatingBtnClick({ currentTarget }) {
		const selection = getSelection();

		if (!this.selectActionMenu) {
			const { SelectActionMenu } = await import("./action-menu.js");
			this.selectActionMenu = document.createElement("select-action-menu");
			const descriptors = Object.getOwnPropertyDescriptors(SelectActionMenu.prototype);
			Object.defineProperties(this.selectActionMenu, descriptors);
			document.body.appendChild(this.selectActionMenu);
			this.selectActionMenu["connectedCallback"]();
		}
		const range = selection.getRangeAt(0).cloneRange();
		this.selectActionMenu["range"] = range.cloneRange();
		this.selectActionMenu.style.left = currentTarget.style.left;
		this.selectActionMenu.style.top = currentTarget.style.top;
		this.selectActionMenu.showPopover();
		selection.removeAllRanges();
	}
}

new SelectActionHandler();
