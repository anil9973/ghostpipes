import { AppTopHeader } from "../components/station/app-top-header.js";
import { PromptInputField } from "../components/station/prompt-input-field.js";
// @ts-ignore
import stationCss from "../style/station.css" with { type: "css" };
document.adoptedStyleSheets.push(stationCss)

/**PumpStation - Main homepage component */
export class PumpStation extends HTMLElement {
	
	render() {
		const main = document.createElement("input-field-container");
		main.append(new PromptInputField());
		return [new AppTopHeader(), main];
		
	}

	connectedCallback() {
		this.replaceChildren(...this.render());
	}
}

customElements.define("pump-station", PumpStation);
