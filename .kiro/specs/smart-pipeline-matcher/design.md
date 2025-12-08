# Design Document

## Overview

The Smart Pipeline Matcher is an intelligent recommendation system that analyzes user input and suggests relevant pipelines from the user's library. The system uses a sophisticated multi-factor scoring algorithm that considers input type, format compatibility, processing capabilities, usage patterns, and contextual relevance.

The design emphasizes performance (sub-100ms analysis), accuracy (multi-tier confidence scoring), and user experience (clear explanations for matches). The implementation is stateless, synchronous, and fully local—no data leaves the browser.

## Architecture

### Component Hierarchy

```
PipelineMatcher (Main Service)
├── InputAnalyzer
│   ├── UrlAnalyzer
│   ├── FileAnalyzer
│   └── TextAnalyzer
├── PipelineScorer
│   ├── TriggerNodeMatcher
│   ├── ProcessingNodeMatcher
│   ├── UsagePatternAnalyzer
│   └── ContextMatcher
└── MatchExplainer
    └── ReasonGenerator
```

### Data Flow

```
User Input (URL/File/Text)
    ↓
InputAnalyzer
    ├→ UrlAnalyzer (if URL detected)
    ├→ FileAnalyzer (if file provided)
    └→ TextAnalyzer (for text content)
    ↓
Analysis Result
    ↓
PipelineScorer
    ├→ For each pipeline:
    │   ├→ TriggerNodeMatcher (40-60 pts)
    │   ├→ ProcessingNodeMatcher (0-30 pts)
    │   ├→ UsagePatternAnalyzer (0-15 pts)
    │   └→ ContextMatcher (0-10 pts)
    ↓
Scored Pipelines
    ↓
MatchExplainer
    └→ Generate human-readable reasons
    ↓
Categorized Suggestions
    ├→ Perfect (90-100)
    ├→ Good (70-89)
    └→ Possible (40-69)
```

## Components and Interfaces

### 1. PipelineMatcher (Main Service)

The primary interface for pipeline matching.

```javascript
class PipelineMatcher {
  /** @param {Pipeline[]} pipelines - User's pipeline library */
  constructor(pipelines);

  /**
   * Match pipelines to input
   * @param {{text?: string, file?: File, url?: string}} input
   * @returns {MatchResult}
   */
  match(input);
}
```

### 2. InputAnalyzer

Analyzes user input and extracts relevant features.

```javascript
class InputAnalyzer {
  /**
   * Analyze input and extract features
   * @param {{text?: string, file?: File, url?: string}} input
   * @returns {InputAnalysis}
   */
  static analyze(input);

  /**
   * Detect input type
   * @returns {"url" | "file" | "text" | "mixed"}
   */
  static detectInputType(input);
}
```

### 3. UrlAnalyzer

Specialized analyzer for URL inputs.

```javascript
class UrlAnalyzer {
  /**
   * Analyze URL and classify pattern
   * @param {string} url
   * @returns {UrlAnalysis}
   */
  static analyze(url);

  /**
   * Classify URL pattern
   * @returns {UrlPattern}
   */
  static classifyPattern(url);

  /**
   * Determine if URL should be scheduled
   * @returns {boolean}
   */
  static shouldSchedule(urlPattern);

  /**
   * Extract domain from URL
   * @returns {string}
   */
  static extractDomain(url);
}
```

### 4. FileAnalyzer

Specialized analyzer for file inputs.

```javascript
class FileAnalyzer {
  /**
   * Analyze file metadata
   * @param {File} file
   * @returns {FileAnalysis}
   */
  static analyze(file);

  /**
   * Categorize MIME type
   * @returns {MimeCategory}
   */
  static categorizeMimeType(mimeType);

  /**
   * Extract file extension
   * @returns {string}
   */
  static getExtension(filename);
}
```

### 5. TextAnalyzer

Specialized analyzer for text inputs.

```javascript
class TextAnalyzer {
  /**
   * Analyze text content
   * @param {string} text
   * @returns {TextAnalysis}
   */
  static analyze(text);

  /** Detect JSON format */
  static isJson(text);

  /** Detect XML format */
  static isXml(text);

  /** Detect CSV format */
  static isCsv(text);

  /** Detect HTML format */
  static isHtml(text);

  /** Detect YAML format */
  static isYaml(text);

  /** Detect email addresses */
  static containsEmails(text);

  /** Detect phone numbers */
  static containsPhones(text);

  /** Detect URLs */
  static containsUrls(text);

  /** Detect dates */
  static containsDates(text);

  /** Detect IP addresses */
  static containsIpAddresses(text);
}
```

### 6. PipelineScorer

Scores pipelines based on input analysis.

```javascript
class PipelineScorer {
  /**
   * Score all pipelines
   * @param {Pipeline[]} pipelines
   * @param {InputAnalysis} analysis
   * @returns {ScoredPipeline[]}
   */
  static scoreAll(pipelines, analysis);

  /**
   * Score single pipeline
   * @param {Pipeline} pipeline
   * @param {InputAnalysis} analysis
   * @returns {number} Score 0-100
   */
  static scorePipeline(pipeline, analysis);

  /** Calculate trigger node match score (40-60 pts) */
  static scoreTriggerNode(pipeline, analysis);

  /** Calculate processing node match score (0-30 pts) */
  static scoreProcessingNodes(pipeline, analysis);

  /** Calculate usage pattern score (0-15 pts) */
  static scoreUsagePatterns(pipeline, analysis);

  /** Calculate context match score (0-10 pts) */
  static scoreContext(pipeline, analysis);
}
```

### 7. MatchExplainer

Generates human-readable explanations for matches.

```javascript
class MatchExplainer {
  /**
   * Generate match reasons
   * @param {Pipeline} pipeline
   * @param {InputAnalysis} analysis
   * @param {number} score
   * @returns {string[]} Array of reasons
   */
  static generateReasons(pipeline, analysis, score);

  /** Explain trigger node compatibility */
  static explainTriggerMatch(pipeline, analysis);

  /** Explain format compatibility */
  static explainFormatMatch(pipeline, analysis);

  /** Explain scheduling recommendation */
  static explainScheduling(pipeline, analysis);

  /** Explain usage patterns */
  static explainUsage(pipeline);
}
```

### 8. PipelineInspector

Utility for analyzing pipeline structure.

```javascript
class PipelineInspector {
  /** Get trigger (first) node */
  static getTriggerNode(pipeline);

  /** Get all processing nodes */
  static getProcessingNodes(pipeline);

  /** Get all output nodes */
  static getOutputNodes(pipeline);

  /** Check if pipeline has specific node type */
  static hasNodeType(pipeline, nodeType);

  /** Check if pipeline has parser for format */
  static hasParser(pipeline, format);

  /** Check if pipeline has AI processor */
  static hasAiProcessor(pipeline);

  /** Check if pipeline has regex node */
  static hasRegexNode(pipeline);

  /** Check if pipeline is scheduled */
  static isScheduled(pipeline);
}
```

## Data Models

### InputAnalysis

```javascript
class InputAnalysis {
  /** @type {"url" | "file" | "text" | "mixed"} */
  inputType;

  /** URL-specific analysis */
  url?: {
    raw: string;
    pattern: UrlPattern;
    domain: string;
    needsSchedule: boolean;
  };

  /** File-specific analysis */
  file?: {
    name: string;
    mimeType: string;
    mimeCategory: MimeCategory;
    extension: string;
    size: number;
  };

  /** Text-specific analysis */
  text?: {
    isJson: boolean;
    isXml: boolean;
    isCsv: boolean;
    isHtml: boolean;
    isYaml: boolean;
    hasEmails: boolean;
    hasPhones: boolean;
    hasUrls: boolean;
    hasDates: boolean;
    hasIpAddresses: boolean;
  };
}
```

### ScoredPipeline

```javascript
class ScoredPipeline {
	/** @type {Pipeline} */
	pipeline;

	/** @type {number} Score 0-100 */
	score;

	/** @type {"perfect" | "good" | "possible" | "poor"} */
	confidence;

	/** @type {string[]} Human-readable reasons */
	reasons;

	/** @type {Object} Score breakdown for debugging */
	breakdown: {
		triggerNode: number,
		processing: number,
		usage: number,
		context: number,
	};
}
```

### MatchResult

```javascript
class MatchResult {
	/** @type {"url" | "file" | "text" | "mixed"} */
	inputType;

	/** @type {InputAnalysis} */
	detected;

	/** @type {ScoredPipeline[]} All suggestions */
	suggestions;

	/** @type {ScoredPipeline[]} Perfect matches (90-100) */
	perfect;

	/** @type {ScoredPipeline[]} Good matches (70-89) */
	good;

	/** @type {ScoredPipeline[]} Possible matches (40-69) */
	possible;
}
```

## Enums

### UrlPattern

```javascript
const UrlPattern = Object.freeze({
	API_ENDPOINT: "api_endpoint",
	RSS_FEED: "rss_feed",
	SOCIAL_MEDIA: "social_media",
	WEB_PAGE: "web_page",
	FILE_DOWNLOAD: "file_download",
});
```

### MimeCategory

```javascript
const MimeCategory = Object.freeze({
	SPREADSHEET: "spreadsheet",
	DOCUMENT: "document",
	STRUCTURED_DATA: "structured_data",
	WEB_CONTENT: "web_content",
	IMAGE: "image",
	UNKNOWN: "unknown",
});
```

### ConfidenceTier

```javascript
const ConfidenceTier = Object.freeze({
	PERFECT: "perfect", // 90-100
	GOOD: "good", // 70-89
	POSSIBLE: "possible", // 40-69
	POOR: "poor", // <40
});
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property Reflection

After analyzing all acceptance criteria, the following properties capture the essential correctness requirements:

Property 1: Input analysis completeness
_For any_ valid input (URL, file, or text), the InputAnalyzer should produce an InputAnalysis object with the inputType field set and at least one of url, file, or text analysis populated
**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

Property 2: URL pattern classification
_For any_ valid URL, the UrlAnalyzer should classify it into exactly one of the five URL patterns (API, RSS, social media, web page, file download)
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

Property 3: MIME type categorization
_For any_ file with a MIME type, the FileAnalyzer should categorize it into one of the defined MIME categories
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

Property 4: Text format detection
_For any_ text input, the TextAnalyzer should correctly identify at least one format if the text is structured (JSON, XML, CSV, HTML, YAML)
**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

Property 5: Score range validity
_For any_ pipeline and input analysis, the calculated score should be between 0 and 100 inclusive
**Validates: Requirements 5.1**

Property 6: Score monotonicity
_For any_ two pipelines where pipeline A has more matching features than pipeline B, pipeline A's score should be greater than or equal to pipeline B's score
**Validates: Requirements 5.2-5.11**

Property 7: Confidence tier consistency
_For any_ scored pipeline, the confidence tier should match the score range: perfect (90-100), good (70-89), possible (40-69), poor (<40)
**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

Property 8: Match reason completeness
_For any_ suggested pipeline, there should be at least one human-readable reason explaining the match
**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

Property 9: Empty input handling
_For any_ empty input, the system should return all pipelines sorted by usage without filtering
**Validates: Requirements 8.3**

Property 10: Performance bounds
_For any_ input with fewer than 1000 characters and fewer than 100 pipelines, analysis and scoring should complete in less than 150 milliseconds
**Validates: Requirements 9.1, 9.2**

Property 11: Statelessness
_For any_ input, calling match() multiple times with the same input should produce identical results
**Validates: Requirements 9.6**

Property 12: Privacy preservation
_For any_ input, the matcher should not make network requests or store data outside the provided pipelines array
**Validates: Requirements 12.1, 12.2, 12.3**

## Error Handling

### Input Validation Errors

1. **Null/Undefined Input**: Return empty match result with all pipelines
2. **Invalid URL**: Treat as plain text and continue analysis
3. **Corrupted File**: Use MIME type if available, fallback to extension
4. **Empty String**: Return all pipelines sorted by usage

### Analysis Errors

1. **JSON Parse Failure**: Mark as non-JSON and continue
2. **Regex Timeout**: Skip pattern detection for that specific pattern
3. **MIME Type Missing**: Fall back to file extension analysis
4. **Domain Extraction Failure**: Use full URL for matching

### Scoring Errors

1. **Missing Pipeline Nodes**: Assign 0 points for that scoring factor
2. **Invalid Usage Data**: Default to 0 usage count
3. **NaN Score**: Reset to 0 and log warning
4. **Score Overflow**: Clamp to 100

### Performance Degradation

1. **Large Input (>10MB)**: Truncate to first 10MB for analysis
2. **Many Pipelines (>1000)**: Show warning but continue
3. **Complex Regex**: Timeout after 50ms per pattern
4. **Deep Pipeline Inspection**: Limit to first 50 nodes

## Testing Strategy

### Unit Testing Approach

Unit tests will verify individual components in isolation:

1. **InputAnalyzer Tests**

   - Test URL detection with various formats
   - Test file analysis with different MIME types
   - Test text pattern detection for each format
   - Test mixed input prioritization

2. **UrlAnalyzer Tests**

   - Test each URL pattern classification
   - Test domain extraction
   - Test scheduling recommendations
   - Test edge cases (malformed URLs, localhost, IP addresses)

3. **FileAnalyzer Tests**

   - Test MIME type categorization
   - Test extension fallback
   - Test file name pattern matching

4. **TextAnalyzer Tests**

   - Test JSON detection (valid and invalid)
   - Test CSV detection with different delimiters
   - Test email/phone/URL extraction
   - Test ambiguous formats

5. **PipelineScorer Tests**

   - Test score calculation for each factor
   - Test score range (0-100)
   - Test confidence tier assignment
   - Test score breakdown accuracy

6. **MatchExplainer Tests**
   - Test reason generation for each match type
   - Test reason clarity and accuracy
   - Test reason count limits

### Integration Testing

Integration tests will verify end-to-end workflows:

1. **URL Input Flow**

   - API URL → Suggest HTTP Request pipelines
   - RSS URL → Suggest XML parser pipelines
   - Social media URL → Suggest web scraper pipelines

2. **File Input Flow**

   - CSV file → Suggest CSV parser pipelines
   - JSON file → Suggest JSON parser pipelines
   - Excel file → Suggest spreadsheet pipelines

3. **Text Input Flow**

   - JSON text → Suggest JSON parser pipelines
   - Email list → Suggest regex pipelines
   - Plain text → Suggest text processor pipelines

4. **Mixed Input Flow**

   - URL + File → Prioritize URL, show file compatibility
   - Multiple formats → Handle ambiguity correctly

5. **Empty State Flow**
   - No pipelines → Suggest creation
   - No matches → Suggest AI generation
   - Empty input → Show all pipelines

### Performance Testing

Performance tests will verify speed requirements:

1. **Analysis Speed**

   - Measure InputAnalyzer time for various inputs
   - Verify <100ms for typical inputs
   - Test with large inputs (1MB, 10MB)

2. **Scoring Speed**

   - Measure scoring time for 10, 50, 100, 500 pipelines
   - Verify <50ms for 100 pipelines
   - Identify bottlenecks

3. **Memory Usage**
   - Monitor memory during analysis
   - Verify no memory leaks
   - Test with large pipeline libraries

### Test Data

Create realistic test datasets:

1. **Sample URLs**

   - GitHub API: `https://api.github.com/repos/user/repo`
   - RSS Feed: `https://blog.example.com/feed.xml`
   - Twitter: `https://twitter.com/username`
   - Amazon Product: `https://amazon.com/product/B08N5WRWNW`

2. **Sample Files**

   - CSV: Sales data with headers
   - JSON: API response
   - HTML: Web page
   - Excel: Financial report

3. **Sample Text**

   - JSON string: `{"name": "John", "age": 30}`
   - CSV text: `name,age\nJohn,30\nJane,25`
   - Email list: `john@example.com, jane@example.com`
   - Plain text: Lorem ipsum

4. **Sample Pipelines**
   - API fetcher with JSON parser
   - RSS reader with XML parser
   - Web scraper with HTML parser
   - CSV processor with filter
   - Email extractor with regex

## Implementation Notes

### Performance Optimizations

1. **Lazy Evaluation**: Only analyze features needed for scoring
2. **Early Exit**: Stop scoring if pipeline already below threshold
3. **Caching**: Cache regex compilation and pattern matching
4. **Batch Operations**: Process all pipelines in single pass

### Code Organization

```
extension/pipelines/services/Matcher/
├── PipelineMatcher.js (main service)
├── analyzers/
│   ├── InputAnalyzer.js
│   ├── UrlAnalyzer.js
│   ├── FileAnalyzer.js
│   └── TextAnalyzer.js
├── scoring/
│   ├── PipelineScorer.js
│   └── MatchExplainer.js
├── utils/
│   ├── PipelineInspector.js
│   └── PatternDetectors.js
└── types/
    ├── UrlPattern.js
    ├── MimeCategory.js
    └── ConfidenceTier.js
```

### Browser Compatibility

- Target: Chrome 140+
- Use native URL API for parsing
- Use native File API for file analysis
- Use native RegExp for pattern matching
- No external dependencies

### Extensibility Points

1. **Custom Pattern Detectors**: Add new text pattern detectors
2. **Custom Scoring Factors**: Add new scoring criteria
3. **Custom Confidence Tiers**: Adjust score thresholds
4. **Custom Reason Templates**: Customize explanation text

## UI Integration

### Homepage Input Field

The matcher integrates with the homepage input component:

```javascript
// In input-field.js
import { PipelineMatcher } from '../services/Matcher/PipelineMatcher.js';

async handleInput(input) {
  const pipelines = await db.getAll(Store.Pipelines);
  const matcher = new PipelineMatcher(pipelines);
  const result = matcher.match(input);

  this.showSuggestions(result);
}
```

### Suggestion Display

Create a new component for displaying suggestions:

```javascript
// suggestion-card.js
class SuggestionCard extends HTMLElement {
	render(scoredPipeline) {
		return html`
			<div class="suggestion-card ${scoredPipeline.confidence}">
				<div class="pipeline-info">
					<h3>${scoredPipeline.pipeline.title}</h3>
					<span class="score">${scoredPipeline.score}% match</span>
				</div>
				<ul class="reasons">
					${scoredPipeline.reasons.map((r) => html`<li>${r}</li>`)}
				</ul>
				<button @click=${() => this.runPipeline(scoredPipeline.pipeline)}>Run with this data</button>
			</div>
		`;
	}
}
```

## Dependencies

### Existing Dependencies

- Pipeline and PipeNode models
- IndexedDB wrapper (db.js)
- NodeType enum

### No External Dependencies

- All pattern matching uses native JavaScript
- All analysis uses native browser APIs
- No ML libraries or external services

## Migration Strategy

1. **Phase 1**: Implement core matcher without UI
2. **Phase 2**: Add UI integration to homepage
3. **Phase 3**: Add usage tracking and learning
4. **Phase 4**: Add AI-assisted pipeline generation for no-match cases

## Future Enhancements

1. **Learning**: Track user selections to improve scoring
2. **Fuzzy Matching**: Use Levenshtein distance for name matching
3. **Semantic Analysis**: Use embeddings for description matching
4. **Template Suggestions**: Suggest templates when no pipelines exist
5. **Multi-Language**: Support non-English text patterns
