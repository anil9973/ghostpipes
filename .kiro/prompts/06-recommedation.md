# Initialization Prompt for Kiro

I need you to implement an intelligent pipeline recommendation system for the GhostPipes Chrome extension. This feature will analyze user input (files, text, URLs) and automatically suggest the most relevant pipelines from their saved collection.

## Project Context

**Product**: GhostPipes - Visual pipeline automation Chrome extension
**Feature**: Smart pipeline recommendations based on input analysis
**Goal**: Reduce friction by auto-suggesting pipelines instead of manual selection
**User Flow**: User pastes/uploads data → System suggests 3-5 best-matching pipelines → User clicks "Run"

## What I'm Providing

Complete specifications and implementation guides:

1. **Recommendation Specification** (`/specs/pipeline-recommendation.md`)

   - Input types: URLs, files (MIME types), text
   - Pattern matching algorithms
   - Scoring system (0-100 points)
   - Ranking factors and weights
   - UI presentation guidelines
   - Learning from usage patterns

2. **Implementation Guide** (`/specs/10-recommedation-implementation`)

   - Class structure (5 main classes)
   - Algorithm implementation details
   - Data flow diagrams
   - Testing strategy
   - Edge case handling

3. **UI Design Integration** (`/specs/09-recommendation-design`)
   - Layout positioning on home page
   - Component states (loading, empty, results)
   - Spooky theme CSS styling
   - Animation timing
   - Accessibility (ARIA, keyboard nav)
   - Responsive behavior

## Core Requirements

### Input Classification

Classify user input into three types with metadata extraction:

**1. URL Input**

- Detect: `https?://` pattern
- Extract: domain, path, query params
- Match: Pipelines with `http_request` trigger
- Score: Domain match (+10), path match (+7), has schedule (+3)

**2. File Input**

- Detect: File object with MIME type
- Extract: MIME type, filename, size
- Match: Pipelines with `manual_input` or `file_watch` trigger + compatible MIME
- Score: Exact MIME (+10), category MIME (+5), has parser (+8)

**3. Text Input**

- Detect: String without URL pattern
- Extract: Structure (JSON, CSV, plain)
- Match: Pipelines with `manual_input` trigger + text/plain support
- Score: Has parse node (+6), AI processor (+5), regex (+4)

### Scoring Algorithm

```

Base Score (passed filtering): 10 points

Input-Specific Scoring:
URL: domain match, path match, schedule preference
File: MIME match, parser availability, trigger type
Text: processing nodes, structure detection

Usage History Boost:
+3 points per recent use (max +15)

Complexity Penalty:
Simple (<5 nodes): +2
Complex (>15 nodes): -3

Final Score Range: 0-100
Confidence Levels: 80+=High, 60+=Good, 40+=Possible, <40=Low

```

### Learning System

Track successful pipeline executions in IndexedDB:

```javascript
{
  pipelineId: 'uuid',
  inputType: 'url' | 'file' | 'text',
  metadata: {
    domain/mimeType/structure,
    fileName,
    ...
  },
  success: true,
  timestamp: Date.now(),
  executionTime: 1500
}
```

Boost scores for pipelines with recent successful runs on similar input types.

### UI Requirements

**Recommendation Section** (between input field and pipeline list):

```
🔮 Suggested Pipelines

[Recommendation Card 1] - 85% confidence
[Recommendation Card 2] - 72% confidence
[Recommendation Card 3] - 68% confidence
```

**Each Card Shows**:

- Pipeline name with confidence percentage
- Description of what it does
- Reason for recommendation (bullet points)
- Actions: [Run Pipeline] [Edit] [Preview]

**States**:

- Loading: "Finding best pipelines..." with spinner
- Empty: "No matching pipelines found" with "Create new" CTA
- Results: Up to 5 ranked recommendations

**Styling**:

- Spooky dark theme (matches existing GhostPipes design)
- Border-left color-coded by confidence (green=high, purple=good, yellow=possible)
- Smooth animations (fade in, stagger cards by 100ms)
- Hover effects with glowing border

## Implementation Structure

### Files to Create

```
extension/src/services/recommendation/
├── classifier.js       - InputClassifier class
├── scorer.js          - PipelineScorer class
├── matcher.js         - PatternMatcher utility class
├── learner.js         - RecommendationLearner class
└── index.js           - RecommendationService (main coordinator)

extension/src/utils/
├── mime-types.js      - MIME type utilities & hierarchies
├── url-parser.js      - URL parsing (domain, path extraction)
└── text-analyzer.js   - Text structure detection (JSON, CSV, plain)

extension/src/station/components/
├── recommendation-card.js  - Web component for card UI
└── recommendation-section.js - Container component

extension/src/styles/
└── recommendation.css - Styling for all recommendation UI
```

### Key Classes

**InputClassifier**

```javascript
export class InputClassifier {
	classify(input) {
		// Returns { type, metadata }
	}

	classifyUrl(url) {
		// Extract domain, path, query
	}

	classifyFile(file) {
		// Extract MIME, name, size
	}

	classifyText(text) {
		// Detect structure (json, csv, plain)
	}
}
```

**PipelineScorer**

```javascript
export class PipelineScorer {
	score(pipeline, input, history) {
		// Returns 0-100 score
	}

	scoreUrlMatch(pipeline, input) {
		// Domain/path matching logic
	}

	scoreFileMatch(pipeline, input) {
		// MIME type matching with hierarchy
	}

	scoreTextMatch(pipeline, input) {
		// Node type checking (parse, AI, regex)
	}

	applyUsageBoost(baseScore, history) {
		// +3 per recent use
	}
}
```

**RecommendationService**

```javascript
export class RecommendationService {
	async recommend(input, allPipelines, maxResults = 5) {
		// 1. Classify input
		// 2. Filter compatible pipelines
		// 3. Load usage history
		// 4. Score each pipeline
		// 5. Sort and return top N
	}

	filterCompatible(input, pipelines) {
		// Filter by trigger type and config
	}

	generateReason(pipeline, input) {
		// Create bullet points explaining recommendation
	}
}
```

**RecommendationCard** (Web Component)

```javascript
export class RecommendationCard extends HTMLElement {
	set data(recommendation) {
		// Update card with pipeline info
	}

	handleRun() {
		// Execute pipeline with input
		// Record success in learner
	}

	handleEdit() {
		// Open pipeline builder with input pre-filled
	}

	render() {
		// Generate card HTML
	}
}
```

## Pattern Matching Details

### URL Domain Matching

```javascript
// Exact match: "api.github.com" === "api.github.com" → +10 points
// Subdomain match: "api.github.com" in "api.github.com/v1/repos" → +5 points
// Path match: "/v1/users" === "/v1/users" → +7 points
```

### MIME Type Hierarchy

```javascript
const mimeHierarchy = {
	"text/csv": ["text/*", "application/vnd.ms-excel"],
	"text/html": ["text/*"],
	"application/json": ["application/*", "text/plain"],
	"image/jpeg": ["image/*"],
	"image/png": ["image/*"],
};

// Exact: text/csv === text/csv → +10
// Hierarchy: text/csv matches text/* → +5
// Category: text/csv matches text/plain → +3
```

### Text Structure Detection

```javascript
// JSON: Starts with { or [, parses successfully
// CSV: Multiple lines with consistent comma count
// XML/HTML: Starts with
// Plain: Everything else
```

## Integration Points

### Home Page (index.html)

Add recommendation section between input field and pipeline list:

```html
<div class="input-section">
	<!-- Existing input field -->
</div>

<!-- NEW -->
<recommendation-section id="recommendations"></recommendation-section>

<div class="pipelines-list">
	<!-- Existing pipeline list -->
</div>
```

### Input Event Handler

```javascript
inputField.addEventListener(
	"input",
	debounce(async (e) => {
		const input = e.target.value || e.target.files?.[0];
		if (!input) return;

		const recommendations = await recommendationService.recommend(input, await storage.getAllPipelines());

		document.querySelector("#recommendations").display(recommendations);
	}, 500)
);
```

### Pipeline Execution

When user clicks "Run Pipeline":

```javascript
async function runRecommendedPipeline(pipeline, input) {
	const startTime = Date.now();

	try {
		const result = await pipelineRunner.execute(pipeline, input);

		// Record success for learning
		await recommendationLearner.recordSuccess(pipeline.id, classifiedInput, Date.now() - startTime);

		showSuccess(result);
	} catch (error) {
		showError(error);
	}
}
```

## Testing Scenarios

Verify these work correctly:

**URL Input**:

- [ ] Paste "https://api.github.com/users" → Shows GitHub API pipelines
- [ ] Exact domain match scores highest
- [ ] Scheduled pipelines get +3 boost

**File Input**:

- [ ] Upload data.csv → Shows CSV processing pipelines
- [ ] Exact MIME match (text/csv) scores +10
- [ ] Pipelines with CSV parser score +8

**Text Input**:

- [ ] Paste JSON → Detects structure, suggests JSON parsers
- [ ] Paste plain text → Suggests text processors with AI
- [ ] Paste CSV-like text → Detects comma pattern

**Learning**:

- [ ] Run pipeline successfully → Records in history
- [ ] Use same pipeline again with similar input → Scores higher
- [ ] History older than 90 days → Gets cleaned up

**UI**:

- [ ] Loading state shows while computing
- [ ] Cards fade in with stagger animation
- [ ] High confidence (80%+) shows green border
- [ ] No matches shows "Create new" option
- [ ] Clicking "Run" executes pipeline with input
- [ ] Clicking "Edit" opens builder with input

## Performance Requirements

- Classification: <50ms
- Scoring all pipelines: <200ms (use setTimeout if >100 pipelines)
- UI rendering: <100ms for 5 cards
- Debounce input: 500ms
- Show loading if computation >200ms

## Edge Cases

- [ ] Empty input → Hide recommendations
- [ ] Invalid URL format → Treat as text
- [ ] Unknown MIME type → Fall back to category match
- [ ] No pipelines in library → Show "Create your first pipeline"
- [ ] All pipelines incompatible → Suggest creating new
- [ ] File >10MB → Warn about size
- [ ] Multiple URLs in text → Use first one
- [ ] Malformed JSON in text → Detect as plain text

## Success Criteria

Implementation is complete when:

- ✅ All three input types classify correctly
- ✅ Scoring algorithm applies all factors
- ✅ Recommendations appear within 500ms of input
- ✅ UI matches spooky theme design
- ✅ Cards display confidence and reasons
- ✅ Running pipeline records success in history
- ✅ Second run with similar input scores higher
- ✅ Loading and empty states display correctly
- ✅ Keyboard navigation works (Tab, Enter)
- ✅ Responsive on mobile (<768px)
- ✅ No console errors or warnings

## Code Quality Standards

Follow GhostPipes coding guidelines:

- Classes for all services (not functions)
- Concise syntax (ternary, single-line if)
- JSDoc with minimal verbosity
- camelCase naming
- CSS nesting for styles
- Web components for UI
- Async/await (no raw Promises)
- Handle all errors gracefully

Let's build an intelligent recommendation system that makes GhostPipes feel magical! 🔮
