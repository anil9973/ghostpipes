export const TODO_TRANSFORM_PIPELINE = {
	id: "pipe_todo_transform",
	title: "Fetch & Rename Todos",
	summary: "Fetches todos from JSONPlaceholder, renames fields, and downloads",
	trigger: { type: "manual", config: {} },
	nodes: [
		{
			id: "fetch_todos",
			type: "http_request",
			title: "Fetch Todos",
			position: { x: 100, y: 100 },
			config: {
				method: "GET",
				url: "https://jsonplaceholder.typicode.com/todos?_limit=10",
				timeout: 5000,
				headers: [],
				queryParams: [],
			},
			inputs: [],
			outputs: [{ nodeId: "rename_fields" }],
		},
		{
			id: "rename_fields",
			type: "transform",
			title: "Rename Keys",
			position: { x: 100, y: 300 },
			config: {
				preserveOriginal: false, // Set to true if you want to keep old keys too
				transformations: [
					{
						sourceField: "userId",
						targetField: "AuthorID",
						operation: "copy",
					},
					{
						sourceField: "id",
						targetField: "TaskID",
						operation: "copy",
					},
					{
						sourceField: "title",
						targetField: "TaskDescription",
						operation: "copy",
					},
					{
						sourceField: "completed",
						targetField: "IsFinished",
						operation: "copy",
					},
				],
			},
			inputs: [{ nodeId: "fetch_todos" }],
			outputs: [{ nodeId: "download_result" }],
		},
		{
			id: "download_result",
			type: "download",
			title: "Download Data",
			position: { x: 100, y: 500 },
			config: {
				filename: "renamed_todos.json",
				format: "application/json", // or 'text/csv' to see the new headers
			},
			inputs: [{ nodeId: "rename_fields" }],
			outputs: [],
		},
	],
	pipes: [
		{
			id: "p1",
			source: "fetch_todos",
			sourceSide: "bottom",
			target: "rename_fields",
			targetSide: "top",
		},
		{
			id: "p2",
			source: "rename_fields",
			sourceSide: "bottom",
			target: "download_result",
			targetSide: "top",
		},
	],
};
