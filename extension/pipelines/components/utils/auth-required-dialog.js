import { html } from "../../../lib/om.compact.js";
import { UserAuthDialog } from "../station/auth-dialog.js";

export class AuthRequiredDialog extends HTMLDialogElement {
	constructor(pipeNodeName) {
		super();
		this.pipeNodeName = pipeNodeName;
	}

	async checkAuthentication() {
		/* try {
			const token = await this.api.getToken();
			this.state.isAuthenticated = !!token;
			if (this.state.isAuthenticated) {
				
			}
		} catch (error) {
			console.error("Auth check failed:", error);
			this.state.isAuthenticated = false;
		} finally {
			this.state.isLoading = false;
		} */
	}

	handleShowAuthDialog() {
		const authDialog = new UserAuthDialog();
		document.body.appendChild(authDialog);
		this.remove();
	}

	render() {
		return html`<h3>
				<svg class="icon lock-icon">
					<use href="/assets/icons.svg#lock"></use>
				</svg>
				Login Required
			</h3>
			<p>${this.pipeNodeName} require authentication to create and manage</p>
			<button class="primary-btn" @click=${this.handleShowAuthDialog.bind(this)}>🔓 Log In / Sign Up</button>`;
	}

	async connectedCallback() {
		await this.checkAuthentication();
		this.replaceChildren(this.render());
		this.showModal();
	}
}

customElements.define("auth-required-dialog", AuthRequiredDialog, { extends: "dialog" });
