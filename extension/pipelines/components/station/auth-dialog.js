import { html } from "../../../lib/om.compact.js";
import { ApiClient } from "../../services/api.js";
// @ts-ignore
import authCss from "../../style/auth-dialog.css" with { type: "css" };
document.adoptedStyleSheets.push(authCss)

export class UserAuthDialog extends HTMLDialogElement {
	constructor() {
		super();
		this.id = "user-auth-dialog"
		this.api = new ApiClient();
		this.mode = "signup"; // 'login' or 'signup'
	}

	async handleSubmit(e) {
		e.preventDefault();
		const formData = new FormData(e.target);
		const email = formData.get("email");
		const password = formData.get("password");

		try {
			if (this.mode === "signup") {
				const displayName = formData.get("displayName");
				await this.api.signup(email, password, displayName);
			} else {
				await this.api.login(email, password);
			}

			const response =  await chrome.runtime.sendMessage({ command: "subscribeWebPushMessage" });
			if(response?.errCaused) notify(response.errCaused, "error")
			fireEvent(this, "auth-success");
			this.remove();
			notify("User AUthenticated success")
		} catch (error) {
			notify(error.message, "error");
		}
	}

	toggleMode(evt) {
		evt.preventDefault()
		this.mode = this.mode === "login" ? "signup" : "login";
		this.render();
	}

	render() {
		const isSignup = this.mode === "signup";

		return html`
					<button class="icon-btn close-btn" @click=${this.remove.bind(this)} hidden>×</button>
					<h2>${isSignup ? "Sign Up" : "Log In"}</h2>
					<form @submit=${this.handleSubmit.bind(this)}>
						${
							isSignup
								? html`
										<div class="form-group">
											<label>Display Name</label>
											<input type="text" name="displayName" placeholder="Your name" />
										</div>
								  `
								: ""
						}

						<div class="form-group">
							<label>Email</label>
							<input type="email" name="email" required placeholder="email@example.com" />
						</div>

						<div class="form-group">
							<label>Password</label>
							<input type="password" name="password" required minlength="8" placeholder="••••••••" />
						</div>

						<button type="submit" class="primary-btn">${isSignup ? "🔐 Sign Up" : "🔓 Log In"}</button>
					</form>

					<p class="toggle-mode">
						${isSignup ? "Already have an account?" : "Don't have an account?"}
						<a href="#" @click=${this.toggleMode.bind(this)}>${isSignup ? "Log In" : "Sign Up"}</a>
					</p>
				</div>
			</div>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
		this.showModal();
	}
}

customElements.define("user-auth-dialog", UserAuthDialog, { extends: "dialog" });
