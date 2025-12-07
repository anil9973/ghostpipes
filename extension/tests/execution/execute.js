import { TurbineEngine } from "../../background/execution/TurbineEngine.js";
import { db, Store } from "../../pipelines/db/db.js";

// Load smaple json data
import { TODO_TRANSFORM_PIPELINE } from "./samples/todo-http-get-csv.js";
import { SAMPLE_PIPELINES } from "./samples/seed-data.js";

// chrome.runtime.reload(); // Paste in server-worker console

(async function () {
	const turbineEngine = new TurbineEngine();
	// Test scraper.js
	const scrapperId =
		(await db.get(Store.Pipelines, TODO_TRANSFORM_PIPELINE.id))?.id ??
		(await db.put(Store.Pipelines, TODO_TRANSFORM_PIPELINE));

	const sampleId2 =
		(await db.get(Store.Pipelines, SAMPLE_PIPELINES[1].id))?.id ??
		(await db.put(Store.Pipelines, SAMPLE_PIPELINES[1]));

	console.log(sampleId2);
	// debugger;
	// turbineEngine.executePipeline(sampleId2);
})();
