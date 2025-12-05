import "./reset.js";
import "../components/utils/atom-icon.js";
import "../components/utils/alert-toast.js";
// @ts-ignore
import baseCss from "../style/base.css" with { type: "css" };
document.adoptedStyleSheets.push(baseCss);

import { PipelineFactoryHouse } from "../pages/factory-house.js";
import { PumpStation } from "../pages/pump-station.js";

function onNavigate(url) {
	const urlParams = new URLSearchParams(location.search);
	const pipelineId = urlParams.get("p");
	const main = document.body.firstElementChild;
	if (pipelineId) {
		if (globalThis.pipelineId === pipelineId) return;
		main.replaceChildren(new PipelineFactoryHouse(pipelineId));
	} else main.replaceChildren(new PumpStation());
}
onNavigate();
// @ts-ignore
navigation.addEventListener("navigate", (event) => {
	event.intercept({
		async handler() {
			onNavigate(event.destination.url);
		},
	});
});
