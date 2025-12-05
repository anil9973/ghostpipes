## /specs/pipeline-recommendation.md

# Pipeline Recommendation System Specification

## Overview

Intelligent pipeline matching system that analyzes user input (files, text, URLs) and suggests the most relevant pipelines from the user's existing collection. Uses pattern matching and heuristics to rank pipelines by relevance.

## Problem Statement

Users have multiple pipelines saved, but manually selecting the right one for their current task is tedious. The system should automatically suggest pipelines based on:

- Input type (file MIME type, text, URL)
- Pipeline trigger configuration
- Historical usage patterns
- Data format compatibility

## Input Types

### 1. URL/Link Input

**Detection**: Regex pattern matching for URLs
**Patterns**:

- `https?://` protocol prefix
- Domain patterns (api.example.com, example.com/endpoint)
- Query parameters present
- Common API endpoints (/api/, /v1/, /graphql)

**Pipeline Matching Criteria**:

- Trigger type: `http_request`
- URL domain matching (exact or partial)
- HTTP method compatibility
- Query parameter patterns
- Schedule preference (one-time vs recurring)

**Ranking Factors**:

- Exact domain match: +10 points
- Partial domain match: +5 points
- Same API path structure: +7 points
- Has schedule configured: +3 points (user likely wants recurring)
- No schedule configured: +3 points (user likely wants one-time)

### 2. File Upload Input

**Detection**: File object with MIME type
**Common MIME Types**:

- `text/csv` - Tabular data
- `text/plain` - Plain text
- `text/html` - Web pages
- `application/json` - JSON data
- `application/xml` - XML data
- `text/markdown` - Markdown documents
- `application/pdf` - PDF documents
- `image/*` - Images (jpg, png, etc.)

**Pipeline Matching Criteria**:

- Trigger type: `manual_input` or `file_watch`
- Allowed MIME types match uploaded file
- Parse node configured for file format
- Transform operations suitable for data type

**Ranking Factors**:

- Exact MIME type match: +10 points
- MIME type category match (text/_, application/_): +5 points
- Parser configured for this format: +8 points
- File watch trigger (suggests batch processing): +4 points
- Recent usage with this file type: +6 points

### 3. Text Paste Input

**Detection**: String input without URL pattern or file object
**Sub-types**:

- Structured data (JSON, CSV-like, XML-like)
- Plain text paragraphs
- Code snippets
- Mixed content

**Pipeline Matching Criteria**:

- Trigger type: `manual_input`
- Allowed MIME types include `text/plain`
- Text processing nodes (regex, parse, AI processor)
- Transform operations

**Ranking Factors**:

- Manual input trigger: +10 points
- Has parse node: +6 points
- Has AI processor: +5 points
- Has regex patterns: +4 points
- Recent usage: +3 points

## Recommendation Algorithm

### Phase 1: Input Classification

```javascript
function classifyInput(input) {
	if (input instanceof File) {
		return {
			type: "file",
			mimeType: input.type,
			name: input.name,
			size: input.size,
		};
	}

	if (typeof input === "string") {
		const urlPattern = /^https?:\/\/.+/i;
		if (urlPattern.test(input.trim())) {
			return {
				type: "url",
				url: input.trim(),
				domain: extractDomain(input),
				path: extractPath(input),
				hasQuery: input.includes("?"),
			};
		}

		return {
			type: "text",
			content: input,
			structure: detectStructure(input), // json, csv, plain
		};
	}

	return { type: "unknown" };
}
```

### Phase 2: Pipeline Filtering

```javascript
function filterCompatiblePipelines(input, allPipelines) {
	return allPipelines.filter((pipeline) => {
		const trigger = pipeline.nodes.find((n) => n.isInputNode);
		if (!trigger) return false;

		switch (input.type) {
			case "url":
				return trigger.type === "http_request";

			case "file":
				return (
					(trigger.type === "manual_input" || trigger.type === "file_watch") &&
					trigger.config.allowedMimeTypes?.includes(input.mimeType)
				);

			case "text":
				return trigger.type === "manual_input" && trigger.config.allowedMimeTypes?.includes("text/plain");

			default:
				return false;
		}
	});
}
```

### Phase 3: Relevance Scoring

```javascript
function scorePipeline(pipeline, input, usageHistory) {
	let score = 0;
	const trigger = pipeline.nodes.find((n) => n.isInputNode);

	// Base compatibility score
	score += 10; // Made it through filtering

	// Input-specific scoring
	if (input.type === "url") {
		if (trigger.config.url?.includes(input.domain)) score += 10;
		if (extractPath(trigger.config.url) === input.path) score += 7;
		if (trigger.config.schedule) score += 3;
	}

	if (input.type === "file") {
		if (trigger.config.allowedMimeTypes?.[0] === input.mimeType) score += 10;
		if (hasParserForFormat(pipeline, input.mimeType)) score += 8;
		if (trigger.type === "file_watch") score += 4;
	}

	if (input.type === "text") {
		if (hasPipelineNode(pipeline, "parse")) score += 6;
		if (hasPipelineNode(pipeline, "ai_processor")) score += 5;
		if (hasPipelineNode(pipeline, "regex")) score += 4;
	}

	// Usage history boost
	const recentUses = usageHistory.filter((h) => h.pipelineId === pipeline.id && h.inputType === input.type);
	score += recentUses.length * 3;

	// Pipeline complexity (simpler is better for common tasks)
	const nodeCount = pipeline.nodes.length;
	if (nodeCount <= 5) score += 2;
	if (nodeCount > 15) score -= 3;

	return score;
}
```

### Phase 4: Ranking & Presentation

```javascript
function recommendPipelines(input, allPipelines, usageHistory, maxResults = 5) {
	const compatible = filterCompatiblePipelines(input, allPipelines);

	const scored = compatible.map((pipeline) => ({
		pipeline,
		score: scorePipeline(pipeline, input, usageHistory),
		reason: generateRecommendationReason(pipeline, input),
	}));

	scored.sort((a, b) => b.score - a.score);

	return scored.slice(0, maxResults);
}
```

## UI Presentation

### Recommendation Card

```
┌─────────────────────────────────────────────┐
│ 🔮 Suggested Pipelines                      │
├─────────────────────────────────────────────┤
│ ⭐ CSV Data Processor                 85%   │
│    Processes CSV files with aggregation     │
│    Used 3 times with CSV files              │
│    [Run] [Edit]                              │
├─────────────────────────────────────────────┤
│    Product Price Tracker              72%   │
│    Extracts price data from CSV             │
│    [Run] [Edit]                              │
├─────────────────────────────────────────────┤
│    Generic CSV Parser                 68%   │
│    Basic CSV to JSON conversion             │
│    [Run] [Edit]                              │
└─────────────────────────────────────────────┘
```

### Confidence Levels

- 80-100%: ⭐ High confidence - Exact match
- 60-79%: Good match - Compatible
- 40-59%: Possible match - May work
- <40%: Low confidence - Not recommended

### Recommendation Reasons

Examples:

- "Exact domain match for api.example.com"
- "Previously used with CSV files"
- "Configured to parse HTML content"
- "Has AI processor for text analysis"
- "Scheduled to run hourly"

## Advanced Features

### Pattern Learning

Track successful pipeline executions to improve recommendations:

```javascript
class RecommendationLearner {
  recordSuccess(pipelineId, inputType, inputMetadata) {
    // Store in IndexedDB
    const entry = {
      pipelineId,
      inputType,
      metadata: inputMetadata,
      timestamp: Date.now()
    };
    await this.storage.add('usage_history', entry);
  }

  async getRecentPatterns(inputType, limit = 10) {
    return await this.storage
      .query('usage_history')
      .where('inputType', inputType)
      .orderBy('timestamp', 'desc')
      .limit(limit);
  }
}
```

### URL Domain Patterns

Recognize common API providers:

```javascript
const knownPatterns = {
	"api.github.com": { category: "dev-tools", schedule: "hourly" },
	"api.shopify.com": { category: "ecommerce", schedule: "daily" },
	"api.twitter.com": { category: "social", schedule: "realtime" },
	"api.stripe.com": { category: "payments", schedule: "daily" },
};

function enhanceUrlMatching(url, pipeline) {
	const domain = extractDomain(url);
	const pattern = knownPatterns[domain];

	if (pattern && pipeline.tags?.includes(pattern.category)) {
		return 5; // Bonus points
	}

	return 0;
}
```

### MIME Type Hierarchies

Match broader categories when exact match not found:

```javascript
const mimeHierarchy = {
	"text/csv": ["text/*", "application/vnd.ms-excel"],
	"text/html": ["text/*", "application/xhtml+xml"],
	"application/json": ["application/*", "text/plain"],
	"image/jpeg": ["image/*"],
	"image/png": ["image/*"],
};

function scoreMimeMatch(pipelineMime, inputMime) {
	if (pipelineMime === inputMime) return 10;

	const hierarchy = mimeHierarchy[inputMime] || [];
	if (hierarchy.includes(pipelineMime)) return 5;

	const [inputCategory] = inputMime.split("/");
	const [pipelineCategory] = pipelineMime.split("/");
	if (inputCategory === pipelineCategory) return 3;

	return 0;
}
```

### Text Content Analysis

Detect structured data in text input:

```javascript
function detectStructure(text) {
	// JSON detection
	if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
		try {
			JSON.parse(text);
			return "json";
		} catch {}
	}

	// CSV detection (commas, consistent column count)
	const lines = text.split("\n").filter((l) => l.trim());
	if (lines.length > 1) {
		const commaCounts = lines.map((l) => (l.match(/,/g) || []).length);
		const consistent = commaCounts.every((c) => c === commaCounts[0]);
		if (consistent && commaCounts[0] > 0) return "csv";
	}

	// XML/HTML detection
	if (text.trim().startsWith("<")) return "xml";

	return "plain";
}
```

## Error Handling

### No Recommendations

When no pipelines match:

```
┌─────────────────────────────────────────────┐
│ 💡 No matching pipelines found              │
│                                              │
│ Would you like to:                           │
│ • [Create new pipeline for CSV files]       │
│ • [Browse all pipelines]                     │
│ • [See pipeline templates]                   │
└─────────────────────────────────────────────┘
```

### Ambiguous Input

When input could match multiple types:

```
┌─────────────────────────────────────────────┐
│ 🤔 What type of data is this?               │
│                                              │
│ • JSON data                                  │
│ • CSV data                                   │
│ • Plain text                                 │
│                                              │
│ Selecting helps find better matches          │
└─────────────────────────────────────────────┘
```

## Storage Schema

### Usage History (IndexedDB)

```javascript
{
  id: 'uuid',
  pipelineId: 'uuid',
  inputType: 'url' | 'file' | 'text',
  metadata: {
    // For URL
    domain: 'api.example.com',
    path: '/v1/users',

    // For File
    mimeType: 'text/csv',
    fileName: 'data.csv',

    // For Text
    structure: 'json',
    length: 1024
  },
  success: true,
  timestamp: 1642089600000,
  executionTime: 1500 // ms
}
```

### Pipeline Metadata Cache

```javascript
{
  pipelineId: 'uuid',
  triggerType: 'http_request',
  supportedInputs: ['url'],
  parsers: ['csv', 'json'],
  tags: ['ecommerce', 'data-processing'],
  nodeCount: 8,
  avgExecutionTime: 2000,
  lastUsed: 1642089600000
}
```

## Performance Considerations

### Indexing

- Index pipelines by trigger type for O(1) filtering
- Cache parsed pipeline metadata to avoid full JSON parsing
- Limit recommendations to top 5 to reduce computation

### Lazy Loading

- Load full pipeline config only when user selects recommendation
- Compute scores on-demand for visible recommendations
- Paginate if user has 100+ pipelines

### Debouncing

- Wait 500ms after input change before triggering recommendations
- Cancel in-flight computations on new input
- Show loading state during computation (>200ms)
