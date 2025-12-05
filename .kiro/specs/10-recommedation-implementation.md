# Pipeline Recommendation Implementation Guide

## Code Organization

```

extension/src/
├── services/
│ ├── recommendation/
│ │ ├── classifier.js # Input classification
│ │ ├── scorer.js # Pipeline scoring logic
│ │ ├── matcher.js # Pattern matching utilities
│ │ ├── learner.js # Usage tracking & learning
│ │ └── index.js # Main RecommendationService
│ └── storage.js # Extended with usage history
├── utils/
│ ├── mime-types.js # MIME type utilities
│ ├── url-parser.js # URL parsing & domain extraction
│ └── text-analyzer.js # Text structure detection
└── components/
└── recommendation-card.js # UI component for suggestions

```

## Class Structure

### InputClassifier

```javascript
/**
 * Classifies user input into type and extracts metadata
 */
export class InputClassifier {
	/**
	 * @param {File|string} input - User input
	 * @returns {InputType} Classified input with metadata
	 */
	classify(input) {}

	/** @private */
	classifyUrl(url) {}

	/** @private */
	classifyFile(file) {}

	/** @private */
	classifyText(text) {}
}
```

### PipelineScorer

```javascript
/**
 * Scores pipelines based on input compatibility
 */
export class PipelineScorer {
	/**
	 * @param {Pipeline} pipeline
	 * @param {InputType} input
	 * @param {UsageHistory[]} history
	 * @returns {number} Relevance score (0-100)
	 */
	score(pipeline, input, history) {}

	/** @private */
	scoreUrlMatch(pipeline, input) {}

	/** @private */
	scoreFileMatch(pipeline, input) {}

	/** @private */
	scoreTextMatch(pipeline, input) {}

	/** @private */
	applyUsageBoost(baseScore, history) {}
}
```

### PatternMatcher

```javascript
/**
 * Utility for pattern matching and extraction
 */
export class PatternMatcher {
	/** Extract domain from URL */
	extractDomain(url) {}

	/** Extract path without query string */
	extractPath(url) {}

	/** Check if pipeline has specific node type */
	hasPipelineNode(pipeline, nodeType) {}

	/** Get parser node for MIME type */
	getParserForMime(pipeline, mimeType) {}

	/** Match MIME type with hierarchy */
	matchMimeType(pipelineMime, inputMime) {}
}
```

### RecommendationLearner

```javascript
/**
 * Tracks usage patterns and improves recommendations
 */
export class RecommendationLearner {
	constructor(storage) {}

	/**
	 * Record successful pipeline execution
	 * @param {string} pipelineId
	 * @param {InputType} input
	 * @param {number} executionTime
	 */
	async recordSuccess(pipelineId, input, executionTime) {}

	/**
	 * Get recent usage history for input type
	 * @param {string} inputType
	 * @param {number} limit
	 * @returns {Promise<UsageHistory[]>}
	 */
	async getHistory(inputType, limit = 10) {}

	/**
	 * Clear old history (>90 days)
	 */
	async cleanup() {}
}
```

### RecommendationService (Main)

```javascript
/**
 * Main service coordinating recommendation system
 */
export class RecommendationService {
	constructor() {
		this.classifier = new InputClassifier();
		this.scorer = new PipelineScorer();
		this.matcher = new PatternMatcher();
		this.learner = new RecommendationLearner(storage);
	}

	/**
	 * Get recommended pipelines for input
	 * @param {File|string} input - User input
	 * @param {Pipeline[]} allPipelines - User's pipelines
	 * @param {number} maxResults - Max recommendations
	 * @returns {Promise<Recommendation[]>}
	 */
	async recommend(input, allPipelines, maxResults = 5) {
		const classified = this.classifier.classify(input);
		const compatible = this.filterCompatible(classified, allPipelines);
		const history = await this.learner.getHistory(classified.type);

		const scored = compatible.map((pipeline) => ({
			pipeline,
			score: this.scorer.score(pipeline, classified, history),
			confidence: this.calculateConfidence(score),
			reason: this.generateReason(pipeline, classified),
		}));

		return scored.sort((a, b) => b.score - a.score).slice(0, maxResults);
	}

	/** @private */
	filterCompatible(input, pipelines) {}

	/** @private */
	calculateConfidence(score) {}

	/** @private */
	generateReason(pipeline, input) {}
}
```

## Algorithm Implementation

### Input Classification Priority

```javascript
function classify(input) {
	// 1. File object (highest priority - explicit type)
	if (input instanceof File) return classifyFile(input);

	// 2. URL pattern (before text - more specific)
	if (typeof input === "string" && isUrl(input)) {
		return classifyUrl(input);
	}

	// 3. Text with structure detection
	if (typeof input === "string") {
		return classifyText(input);
	}

	return { type: "unknown" };
}
```

### Scoring Weight Distribution

```
Base Compatibility: 10 points (passed filtering)

URL Matching:
  - Exact domain: +10
  - Partial domain: +5
  - Path match: +7
  - Has schedule: +3
  - Query params: +2

File Matching:
  - Exact MIME: +10
  - Category MIME: +5
  - Has parser: +8
  - File watch trigger: +4
  - Recent usage: +6

Text Matching:
  - Manual input: +10
  - Has parse node: +6
  - Has AI processor: +5
  - Has regex: +4
  - Structure match: +3

Universal Boosts:
  - Recent usage: +3 per use (max +15)
  - Simple pipeline (<5 nodes): +2
  - Complex pipeline (>15 nodes): -3
```

### Confidence Calculation

```javascript
function calculateConfidence(score) {
	// Normalize to percentage
	const maxPossible = 50; // Typical high score
	const percentage = Math.min(100, (score / maxPossible) * 100);

	if (percentage >= 80) return "high";
	if (percentage >= 60) return "good";
	if (percentage >= 40) return "possible";
	return "low";
}
```

## UI Integration

### Home Page Input Field

```javascript
// Listen for input changes
inputField.addEventListener(
	"input",
	debounce(async (e) => {
		const input = e.target.value || e.target.files?.[0];
		if (!input) {
			hideRecommendations();
			return;
		}

		showLoadingState();

		const recommendations = await recommendationService.recommend(input, await storage.getAllPipelines(), 5);

		displayRecommendations(recommendations);
	}, 500)
);
```

### Recommendation Card Component

```javascript
export class RecommendationCard extends HTMLElement {
	constructor() {
		super();
		this.recommendation = null;
	}

	set data(recommendation) {
		this.recommendation = recommendation;
		this.render();
	}

	handleRun() {
		// Execute pipeline with input
		// Record success for learning
	}

	handleEdit() {
		// Open pipeline in builder with input pre-filled
	}

	render() {
		// Display pipeline name, confidence, reason, actions
	}
}
```

## Data Flow

```
User Input
    ↓
InputClassifier.classify()
    ↓
RecommendationService.filterCompatible()
    ↓
RecommendationLearner.getHistory()
    ↓
PipelineScorer.score() (for each compatible)
    ↓
Sort by score
    ↓
Generate reasons
    ↓
Return top N recommendations
    ↓
RecommendationCard.render() (for each)
    ↓
User selects pipeline
    ↓
Execute pipeline
    ↓
RecommendationLearner.recordSuccess()
```

## Testing Strategy

### Unit Tests (Manual Verification)

- [ ] URL classification detects https:// correctly
- [ ] File classification extracts MIME type
- [ ] Text classification detects JSON/CSV/plain
- [ ] Domain extraction handles subdomains
- [ ] Path extraction removes query strings
- [ ] MIME hierarchy matching works (text/\* matches text/csv)
- [ ] Scoring prioritizes exact matches
- [ ] Usage history boosts scores
- [ ] Confidence levels calculated correctly

### Integration Tests

- [ ] Paste URL → Shows HTTP request pipelines
- [ ] Upload CSV → Shows CSV processing pipelines
- [ ] Paste JSON → Shows text/JSON pipelines
- [ ] No matches → Shows "create new" option
- [ ] Select recommendation → Pipeline opens with input
- [ ] Execute pipeline → Records in history
- [ ] Second execution → Higher score for same pipeline

### Edge Cases

- [ ] Empty input → No recommendations
- [ ] Invalid URL format → Treated as text
- [ ] Unknown MIME type → Falls back to category match
- [ ] No pipelines exist → Shows templates
- [ ] All pipelines incompatible → Suggests creating new
- [ ] File >10MB → Warns about size
- [ ] Multiple URLs in text → Takes first one
