/**
 * @fileoverview Seed data for testing pipeline execution logic
 * Includes 6 scenarios: API Monitoring, Data Cleaning, AI Routing, Log Analysis, Joining, and Looping.
 */

export const SAMPLE_PIPELINES = [
	// =========================================================================
	// 1. Bitcoin Price Monitor
	// Tests: HTTP Request -> Transform -> Condition -> Email
	// =========================================================================
	{
		id: "pipe_btc_monitor",
		title: "Bitcoin Price Alert",
		summary: "Checks CoinGecko API and emails if BTC > $50k",
		trigger: { type: "manual", config: {} },
		nodes: [
			{
				id: "get_price",
				type: "http_request",
				title: "Get BTC Price",
				position: { x: 100, y: 100 },
				config: {
					method: "GET",
					url: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
					timeout: 5000,
				},
				inputs: [],
				outputs: [{ nodeId: "extract_price" }],
			},
			{
				id: "extract_price",
				type: "transform",
				title: "Extract Price",
				position: { x: 100, y: 300 },
				config: {
					transformations: [
						{
							targetField: "usd_price",
							sourceField: "bitcoin.usd",
							operation: "copy",
						},
					],
				},
				inputs: [{ nodeId: "get_price" }],
				outputs: [{ nodeId: "check_threshold" }],
			},
			{
				id: "check_threshold",
				type: "condition",
				title: "Is > $50,000?",
				position: { x: 100, y: 500 },
				config: {
					logic: "AND",
					rules: [
						{
							field: "usd_price",
							operator: ">",
							value: 50000,
						},
					],
				},
				inputs: [{ nodeId: "extract_price" }],
				outputs: [{ nodeId: "send_alert" }],
			},
			{
				id: "send_alert",
				type: "send_email",
				title: "Email Alert",
				position: { x: 100, y: 700 },
				config: {
					recipients: ["trader@example.com"],
					subject: "BTC Alert: ${{usd_price}}",
					bodyTemplate: "Bitcoin has crossed the threshold! Current price: ${{usd_price}}",
				},
				inputs: [{ nodeId: "check_threshold" }],
				outputs: [],
			},
		],
		pipes: [
			{ id: "p1", source: "get_price", target: "extract_price" },
			{ id: "p2", source: "extract_price", target: "check_threshold" },
			{ id: "p3", source: "check_threshold", target: "send_alert" },
		],
	},

	// =========================================================================
	// 2. CSV Customer Data Cleaner
	// Tests: Manual Input -> Parse -> Filter -> Sort -> Format -> Download
	// =========================================================================
	{
		id: "pipe_csv_cleaner",
		title: "Clean Customer CSV",
		summary: "Parses CSV, filters active users, sorts by name, downloads JSON",
		trigger: { type: "manual", config: {} },
		nodes: [
			{
				id: "raw_csv",
				type: "manual_input",
				title: "Upload CSV",
				summary: "Provide a raw CSV dataset to start the pipeline.",
				position: { x: 400, y: 100 },
				config: {
					data: "id,name,status,age\n1,Alice,active,30\n2,Bob,inactive,25\n3,Charlie,active,35",
					allowedMimeTypes: ["text/csv"],
				},
				inputs: [],
				outputs: [{ nodeId: "parse_csv" }],
			},
			{
				id: "parse_csv",
				type: "parse",
				title: "Parse CSV",
				summary: "Convert the uploaded CSV into structured rows using headers.",
				position: { x: 400, y: 250 },
				config: {
					format: "csv",
					csvHasHeaders: true,
				},
				inputs: [{ nodeId: "raw_csv" }],
				outputs: [{ nodeId: "filter_active" }],
			},
			{
				id: "filter_active",
				type: "filter",
				title: "Filter Active",
				summary: "Keep only records where status is 'active'.",
				position: { x: 400, y: 400 },
				config: {
					mode: "permit",
					matchType: "all",
					rules: [{ field: "status", operator: "==", value: "active" }],
				},
				inputs: [{ nodeId: "parse_csv" }],
				outputs: [{ nodeId: "sort_name" }],
			},
			{
				id: "sort_name",
				type: "sort",
				title: "Sort by Name",
				summary: "Sort the filtered users alphabetically by their name.",
				position: { x: 400, y: 550 },
				config: {
					criteria: [{ field: "name", order: "asc" }],
				},
				inputs: [{ nodeId: "filter_active" }],
				outputs: [{ nodeId: "format_json" }],
			},
			{
				id: "format_json",
				type: "format",
				title: "Format JSON",
				summary: "Transform the sorted list into clean, pretty-printed JSON.",
				position: { x: 400, y: 700 },
				config: {
					format: "application/json",
					jsonPretty: true,
				},
				inputs: [{ nodeId: "sort_name" }],
				outputs: [{ nodeId: "download_file" }],
			},
			{
				id: "download_file",
				type: "download",
				title: "Download",
				summary: "Download the final active users list as a JSON file.",
				position: { x: 400, y: 850 },
				config: {
					filename: "active_users.json",
					format: "application/json",
				},
				inputs: [{ nodeId: "format_json" }],
				outputs: [],
			},
		],
		pipes: [
			{ id: "p4", source: "raw_csv", target: "parse_csv" },
			{ id: "p5", source: "parse_csv", target: "filter_active" },
			{ id: "p6", source: "filter_active", target: "sort_name" },
			{ id: "p7", source: "sort_name", target: "format_json" },
			{ id: "p8", source: "format_json", target: "download_file" },
		],
	},

	// =========================================================================
	// 3. AI Support Router
	// Tests: AI Processor -> Switch -> Multiple Outputs (Union logic implicit in UI flow)
	// =========================================================================
	{
		id: "pipe_ai_router",
		title: "AI Support Ticket Router",
		summary: "Classifies ticket text and routes to Engineering or Sales",
		trigger: { type: "manual", config: {} },
		nodes: [
			{
				id: "ticket_input",
				type: "manual_input",
				title: "Ticket Input",
				position: { x: 800, y: 100 },
				config: {
					data: JSON.stringify({
						id: "T-101",
						message: "I cannot login to my account, getting 500 error",
					}),
				},
				inputs: [],
				outputs: [{ nodeId: "analyze_intent" }],
			},
			{
				id: "analyze_intent",
				type: "ai_processor",
				title: "Classify Intent",
				position: { x: 800, y: 250 },
				config: {
					model: "gemini-pro",
					prompt: "Classify the following message as either 'bug' or 'sales'. Message: {{message}}",
					outputFormat: "text", // Expecting raw string "bug" or "sales"
				},
				inputs: [{ nodeId: "ticket_input" }],
				outputs: [{ nodeId: "route_ticket" }],
			},
			{
				id: "route_ticket",
				type: "switch",
				title: "Route Team",
				position: { x: 800, y: 450 },
				config: {
					switchField: "_raw", // AI raw output
					cases: {
						bug: "log_jira",
						sales: "email_sales",
					},
					defaultCase: "log_jira",
				},
				inputs: [{ nodeId: "analyze_intent" }],
				outputs: [{ nodeId: "log_jira" }, { nodeId: "email_sales" }],
			},
			{
				id: "log_jira",
				type: "http_post",
				title: "Create Jira Issue",
				position: { x: 650, y: 650 },
				config: {
					url: "https://api.jira.com/issue",
					method: "POST",
					contentType: "json",
					rawBody: '{"summary": "Bug Report", "description": "{{message}}"}',
				},
				inputs: [{ nodeId: "route_ticket" }],
				outputs: [],
			},
			{
				id: "email_sales",
				type: "send_email",
				title: "Email Sales Team",
				position: { x: 950, y: 650 },
				config: {
					recipients: ["sales@company.com"],
					subject: "New Lead",
					bodyTemplate: "Potential customer message: {{message}}",
				},
				inputs: [{ nodeId: "route_ticket" }],
				outputs: [],
			},
		],
		pipes: [
			{ id: "p9", source: "ticket_input", target: "analyze_intent" },
			{ id: "p10", source: "analyze_intent", target: "route_ticket" },
			{ id: "p11", source: "route_ticket", target: "log_jira" }, // Engine handles conditional routing
			{ id: "p12", source: "route_ticket", target: "email_sales" },
		],
	},

	// =========================================================================
	// 4. Log Analyzer
	// Tests: Regex -> Validate -> Deduplicate -> Aggregate
	// =========================================================================
	{
		id: "pipe_log_analyzer",
		title: "Server Log Analyzer",
		summary: "Extracts IPs from logs, deduplicates, and counts occurrences",
		trigger: { type: "manual", config: {} },
		nodes: [
			{
				id: "log_input",
				type: "manual_input",
				title: "Raw Logs",
				position: { x: 1200, y: 100 },
				config: {
					data: "[INFO] 192.168.1.1 - Login\n[ERROR] 10.0.0.5 - Timeout\n[ERROR] 10.0.0.5 - Retry",
				},
				inputs: [],
				outputs: [{ nodeId: "extract_ip" }],
			},
			{
				id: "extract_ip",
				type: "regex_pattern",
				title: "Extract IP & Level",
				position: { x: 1200, y: 250 },
				config: {
					patterns: [
						{
							field: "raw", // applied to input string directly if configured in engine
							pattern: "\\[(INFO|ERROR)\\]\\s(\\d+\\.\\d+\\.\\d+\\.\\d+)",
							extract: true,
						},
					],
				},
				inputs: [{ nodeId: "log_input" }],
				outputs: [{ nodeId: "filter_errors" }],
			},
			// Note: The previous node returns { raw_extracted: ["full match", "ERROR", "10.0.0.5"] }
			// We need a transform to map array indices to fields, but for brevity assuming Regex node maps intelligently or we use Custom Code
			{
				id: "map_fields",
				type: "custom_code",
				title: "Map Regex Fields",
				position: { x: 1200, y: 350 },
				config: {
					mode: "map",
					code: "return { level: input.raw_extracted[1], ip: input.raw_extracted[2] }",
				},
				inputs: [{ nodeId: "extract_ip" }],
				outputs: [{ nodeId: "dedup_ip" }],
			},
			{
				id: "dedup_ip",
				type: "deduplicate",
				title: "Unique IPs",
				position: { x: 1200, y: 500 },
				config: {
					scope: "field",
					fields: ["ip"],
					keep: "first",
				},
				inputs: [{ nodeId: "map_fields" }],
				outputs: [{ nodeId: "count_ips" }],
			},
			{
				id: "count_ips",
				type: "aggregate",
				title: "Count Unique",
				position: { x: 1200, y: 650 },
				config: {
					groupByKey: false,
					aggregations: [{ field: "ip", operation: "count", alias: "total_unique_offenders" }],
				},
				inputs: [{ nodeId: "dedup_ip" }],
				outputs: [{ nodeId: "save_report" }],
			},
			{
				id: "save_report",
				type: "file_append",
				title: "Save Report",
				position: { x: 1200, y: 800 },
				config: {
					path: "security_report.json",
					format: "application/json",
				},
				inputs: [{ nodeId: "count_ips" }],
				outputs: [],
			},
		],
		pipes: [
			{ id: "p13", source: "log_input", target: "extract_ip" },
			{ id: "p14", source: "extract_ip", target: "map_fields" },
			{ id: "p15", source: "map_fields", target: "dedup_ip" },
			{ id: "p16", source: "dedup_ip", target: "count_ips" },
			{ id: "p17", source: "count_ips", target: "save_report" },
		],
	},

	// =========================================================================
	// 5. User Data Merger
	// Tests: Join (Multi-input) -> Transform
	// =========================================================================
	{
		id: "pipe_join_data",
		title: "Merge User Data",
		summary: "Joins user profile data with transaction history",
		trigger: { type: "manual", config: {} },
		nodes: [
			{
				id: "input_profiles",
				type: "manual_input",
				title: "Profiles",
				position: { x: 100, y: 100 },
				config: {
					data: JSON.stringify([
						{ id: 1, name: "Alice" },
						{ id: 2, name: "Bob" },
					]),
				},
				inputs: [],
				outputs: [{ nodeId: "join_tables" }],
			},
			{
				id: "input_txns",
				type: "manual_input",
				title: "Transactions",
				position: { x: 300, y: 100 },
				config: {
					data: JSON.stringify([
						{ user_id: 1, amount: 50 },
						{ user_id: 1, amount: 20 },
						{ user_id: 2, amount: 100 },
					]),
				},
				inputs: [],
				outputs: [{ nodeId: "join_tables" }],
			},
			{
				id: "join_tables",
				type: "join",
				title: "Join Data",
				position: { x: 200, y: 300 },
				config: {
					type: "left",
					leftKey: "id",
					rightKey: "user_id",
				},
				inputs: [
					{ nodeId: "input_profiles" }, // Left
					{ nodeId: "input_txns" }, // Right
				],
				outputs: [{ nodeId: "format_output" }],
			},
			{
				id: "format_output",
				type: "transform",
				title: "Format",
				position: { x: 200, y: 500 },
				config: {
					transformations: [
						{ targetField: "Customer", sourceField: "name", operation: "copy" },
						{ targetField: "Spent", sourceField: "amount", operation: "copy" },
					],
				},
				inputs: [{ nodeId: "join_tables" }],
				outputs: [],
			},
		],
		pipes: [
			{ id: "p18", source: "input_profiles", target: "join_tables" },
			{ id: "p19", source: "input_txns", target: "join_tables" },
			{ id: "p20", source: "join_tables", target: "format_output" },
		],
	},

	// =========================================================================
	// 6. Broken Link Checker
	// Tests: Loop -> HTTP -> Filter
	// =========================================================================
	{
		id: "pipe_link_check",
		title: "Broken Link Checker",
		summary: "Iterates a list of URLs and flags 404s",
		trigger: { type: "manual", config: {} },
		nodes: [
			{
				id: "url_list",
				type: "manual_input",
				title: "URL List",
				position: { x: 1500, y: 100 },
				config: {
					data: JSON.stringify({
						urls: ["https://google.com", "https://httpstat.us/404", "https://example.com"],
					}),
				},
				inputs: [],
				outputs: [{ nodeId: "loop_urls" }],
			},
			{
				id: "loop_urls",
				type: "loop",
				title: "Loop URLs",
				position: { x: 1500, y: 250 },
				config: {
					loopOver: "urls",
					flatten: true,
				},
				inputs: [{ nodeId: "url_list" }],
				outputs: [{ nodeId: "check_status" }],
			},
			{
				id: "check_status",
				type: "http_request",
				title: "Head Request",
				position: { x: 1500, y: 400 },
				config: {
					method: "GET", // Using GET as HEAD often blocked by CORS in extension
					url: "{{_loopItem}}", // Assuming loop node puts item in _loopItem or passes string directly
					timeout: 3000,
				},
				inputs: [{ nodeId: "loop_urls" }],
				outputs: [{ nodeId: "filter_broken" }],
			},
			{
				id: "filter_broken",
				type: "custom_code",
				title: "Check 404",
				position: { x: 1500, y: 550 },
				config: {
					mode: "filter",
					code: "return context.lastNodeOutput && context.lastNodeOutput.status >= 400", // Pseudo-code logic
				},
				inputs: [{ nodeId: "check_status" }],
				outputs: [{ nodeId: "report_broken" }],
			},
			{
				id: "report_broken",
				type: "download",
				title: "Download Report",
				position: { x: 1500, y: 700 },
				config: {
					filename: "broken_links.json",
				},
				inputs: [{ nodeId: "filter_broken" }],
				outputs: [],
			},
		],
		pipes: [
			{ id: "p21", source: "url_list", target: "loop_urls" },
			{ id: "p22", source: "loop_urls", target: "check_status" },
			{ id: "p23", source: "check_status", target: "filter_broken" },
			{ id: "p24", source: "filter_broken", target: "report_broken" },
		],
	},
];
