# Prompt for Kiro IDE - Smart Pipeline Matching System

I'm building GhostPipes, a browser extension for visual data pipeline automation. I need to implement an intelligent pipeline suggestion system that analyzes user input and recommends the most relevant pipelines from their existing library.

## Project Context

**Tech Stack:**

- Vanilla JS + Om.js reactive framework
- IndexedDB for pipeline storage
- Chrome Extension (Manifest V3)
- Modern ES6+ features

**Code Guidelines:**

- Concise modern JS (ternary, object maps, arrow functions)
- Classes for separation of concerns
- Enums for type safety
- JSDoc for documentation
- No external dependencies for matching logic

**Existing Architecture:**

- Pipeline storage: `/extension/pipelines/db/pipeline-storage.js`
- Pipeline configs: `/extension/pipelines/models/configs/`
- Node types defined in: `/extension/pipelines/models/NodeType.js`
- Homepage UI: `/extension/pipelines/components/home/`

---

## Feature: Intelligent Pipeline Matcher

**Objective:** When users paste text, upload files, or paste URLs in the homepage input field, automatically suggest the most relevant pipelines from their library based on intelligent pattern matching and scoring.

### User Flow

1. User opens extension homepage
2. User interacts with input field by:
   - Pasting a URL (e.g., API endpoint, RSS feed, social media link)
   - Uploading a file (CSV, JSON, HTML, etc.)
   - Pasting text data (JSON, CSV, XML, plain text)
   - Combination of above
3. System analyzes the input
4. System displays ranked pipeline suggestions with match reasons
5. User selects a pipeline and runs it with the input

### Input Analysis Requirements

The system should detect and classify input into these categories:

#### 1. URL Detection & Pattern Recognition

When user pastes a URL, analyze it to determine:

**URL Pattern Types:**

- **API Endpoint**: Contains `/api/`, `.json`, `/v1/`, `/v2/`, `/graphql`, RESTful patterns
- **RSS/Atom Feed**: Contains `/rss`, `/feed`, `.rss`, `.atom`, `/xml`
- **Social Media**: twitter.com, x.com, facebook.com, instagram.com, linkedin.com, tiktok.com, youtube.com
- **Web Page**: Standard HTML pages (default)
- **File Download**: Ends with `.pdf`, `.csv`, `.xlsx`, `.zip`, `.json`, `.xml`

**Additional URL Analysis:**

- Extract domain name (for provider-specific pipelines)
- Detect authentication requirements (oauth, api-key patterns)
- Determine if URL should be scheduled:
  - APIs, RSS feeds, social media → suggest scheduling
  - Static files, one-time pages → no schedule needed
- Parse URL structure (path segments, query parameters) for context

#### 2. File Upload Detection & MIME Type Analysis

When user uploads a file, extract:

**File Metadata:**

- MIME type (exact match)
- File extension
- File size
- File name patterns

**MIME Type Categories:**

- **Spreadsheets**: `text/csv`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Documents**: `text/plain`, `text/markdown`, `application/pdf`, Word documents
- **Data Formats**: `application/json`, `application/xml`, `text/xml`, `application/x-yaml`
- **Web Content**: `text/html`, `application/xhtml+xml`
- **Images**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`

**File Analysis Logic:**

- Exact MIME type match (highest priority)
- MIME category match (medium priority)
- Extension fallback if MIME type unavailable
- File name pattern matching (e.g., "sales*report*\*.csv")

#### 3. Text Pattern Detection

When user pastes plain text, analyze for:

**Structured Data Formats:**

- **JSON**: Starts with `{` or `[`, ends with `}` or `]`, validate structure
- **XML**: Starts with `<`, contains closing tags, has XML declaration
- **CSV**: Multiple lines with consistent delimiters (`,`, `;`, `\t`)
- **HTML**: Contains `<html>`, `<!doctype>`, `<div>`, `<body>` tags
- **YAML**: Contains `:` and proper indentation patterns

**Data Content Patterns:**

- **Email addresses**: Regex pattern for emails
- **Phone numbers**: Various international formats
- **URLs**: Embedded URLs in text
- **Numbers**: Numeric data (prices, quantities, IDs)
- **Dates**: Date patterns (ISO, US, EU formats)
- **IP addresses**: IPv4/IPv6 patterns

### Pipeline Matching Algorithm

Implement a sophisticated scoring system that evaluates each pipeline against the input.

#### Core Matching Logic

**Score Range:** 0-100 points

**Scoring Factors:**

1. **Trigger Node Match (Base: 40-60 points)**

   - URL input + HTTP Request node: 50 points
   - File input + Manual Input node (MIME match): 60 points
   - Text input + Manual Input node: 40 points
   - Webhook node (not relevant for manual input): 0 points

2. **Input Compatibility (Bonus: 0-30 points)**

   - Exact MIME type match: +30 points
   - MIME category match: +20 points
   - File extension match: +15 points
   - URL pattern match: +25 points
     - API URL + JSON parser: +30 points
     - RSS URL + XML parser: +30 points
     - Web page URL + HTML parser: +25 points

3. **Processing Node Relevance (Bonus: 0-20 points)**

   - JSON text + Parse JSON node: +20 points
   - CSV text + Parse CSV node: +20 points
   - URL + Parse HTML node: +15 points
   - Email/phone patterns + Regex node: +15 points
   - AI Processor node (versatile): +10 points

4. **Schedule Recommendation (Bonus: 0-20 points)**

   - API/RSS/Social URL + Scheduled node: +20 points
   - File download URL + Schedule: +15 points
   - Static page + Schedule: -10 points (penalty)

5. **Usage Patterns (Bonus: 0-10 points)**

   - Recently used (< 7 days): +10 points
   - Used in last month: +5 points
   - High usage count (>10 runs): +5 points
   - Never used: 0 points

6. **Context Matching (Bonus: 0-10 points)**
   - Pipeline name matches input domain: +10 points
   - Pipeline description matches data type: +5 points
   - Pipeline tags match input characteristics: +5 points

#### Match Quality Tiers

Based on final score, categorize matches:

- **Perfect Match (90-100)**: Exact fit, highest confidence
- **Good Match (70-89)**: Strong fit, recommended
- **Possible Match (40-69)**: Could work, show as option
- **Poor Match (<40)**: Don't show to user

### Output Requirements

The matcher should return a structured result:

```javascript
{
  inputType: "url" | "file" | "text" | "mixed",
  detected: {
    // Input-specific analysis
    url?: string,
    urlPattern?: "api_endpoint" | "rss_feed" | "social_media" | "web_page" | "file_download",
    needsSchedule?: boolean,
    mimeType?: string,
    mimeCategory?: string,
    fileName?: string,
    isJson?: boolean,
    isCsv?: boolean,
    hasEmails?: boolean,
    // ... other detected patterns
  },
  suggestions: [
    {
      pipeline: Object,        // Full pipeline object
      score: number,           // 0-100
      reasons: string[],       // Human-readable match reasons
      confidence: "perfect" | "good" | "possible"
    }
  ],
  perfect: [],  // Pipelines with score >= 90
  good: [],     // Pipelines with score 70-89
  possible: []  // Pipelines with score 40-69
}
```

### Implementation Requirements

**Main Matcher Class:**

- Class name: `PipelineMatcher`
- Constructor accepts array of pipelines
- Main method: `match(input)` where input contains `{ text?, file?, url? }`
- Should be completely stateless (no side effects)
- Should work synchronously (no async operations for analysis)

**Helper Methods Needed:**

- `analyzeInput(input)` → Detect input type and patterns
- `scorePipelines(analysis)` → Score all pipelines
- `calculateScore(pipeline, analysis)` → Score single pipeline
- `getMatchReasons(pipeline, analysis)` → Generate human-readable reasons
- `getTriggerNode(pipeline)` → Extract input node from pipeline
- `pipelineHasParsing(pipeline, formats)` → Check for parser nodes
- `pipelineHasAI(pipeline)` → Check for AI processor
- `pipelineHasRegex(pipeline)` → Check for regex node
- `isScheduledPipeline(pipeline)` → Check if pipeline has schedule

**URL Analysis Helpers:**

- `containsUrl(text)` → Detect URL in text
- `extractUrl(text)` → Extract URL from text
- `detectUrlPattern(url)` → Classify URL type
- `shouldSchedule(url)` → Recommend scheduling

**Text Pattern Helpers:**

- `looksLikeJson(text)` → JSON detection
- `looksLikeXml(text)` → XML detection
- `looksLikeCsv(text)` → CSV detection
- `looksLikeHtml(text)` → HTML detection
- `containsEmails(text)` → Email pattern detection
- `containsPhones(text)` → Phone pattern detection
- `containsNumbers(text)` → Numeric data detection

**MIME Type Helpers:**

- `getFileExtension(filename)` → Extract extension
- `getMimeCategory(mimeType)` → Categorize MIME type

**Pipeline Analysis Helpers:**

- `getTriggerNode(pipeline)` → Find input node
- `getProcessingNodes(pipeline)` → Get all processing nodes
- `getOutputNodes(pipeline)` → Get all output nodes
- `hasNodeType(pipeline, nodeType)` → Check for specific node

### Edge Cases to Handle

1. **Empty Input**: Show all pipelines, sorted by recent usage
2. **Invalid URL**: Treat as plain text
3. **Corrupted File**: Check MIME type, fallback to extension
4. **Mixed Input**: URL + File → Prioritize URL, but mention file compatibility
5. **No Matches**: Suggest creating new pipeline with AI assistance
6. **Ambiguous Format**: CSV vs TSV, JSON vs JSONL → Check delimiters
7. **Large Files**: Consider file size in scoring (very large files might need special handling)
8. **Binary Files**: Images, PDFs → Match based on MIME type only

### UI Integration Points

The matcher should integrate with:

1. **Homepage Input Field** (`/extension/pipelines/components/home/input-field.js`)

   - Trigger analysis on paste/upload
   - Show loading indicator during analysis
   - Display suggestions in dropdown/card format

2. **Pipeline Suggestion Cards** (new component needed)

   - Show pipeline name, icon, and score
   - Display match reasons as bullet points
   - Show "Run with this data" button
   - Show "Edit and run" option
   - Highlight "Perfect" matches visually

3. **Empty State**
   - When no pipelines exist, show templates
   - Suggest creating pipeline based on input type

### Storage Integration

The matcher needs access to:

- **Pipeline Storage** (`/extension/pipelines/db/pipeline-storage.js`)

  - `getAllPipelines()` → Fetch user's pipelines
  - `recordUsage(pipelineId)` → Track pipeline usage

- **Pipeline Metadata**
  - Usage count
  - Last used timestamp
  - User-defined tags
  - Custom descriptions

### Performance Considerations

- Analysis should complete in <100ms for typical inputs
- Scoring should handle 100+ pipelines efficiently
- Cache analysis results for same input (optional optimization)
- Debounce analysis when user is typing (300ms delay)
- Show loading state only if analysis takes >500ms

### Testing Scenarios

Please ensure the implementation handles these test cases:

**URL Tests:**

1. GitHub API: `https://api.github.com/repos/user/repo` → Should match API pipelines
2. RSS Feed: `https://blog.example.com/feed.xml` → Should match RSS parsers
3. Twitter Profile: `https://twitter.com/username` → Should suggest social media scrapers
4. Product Page: `https://amazon.com/product/...` → Should match web scrapers

**File Tests:**

1. CSV File: `sales_data.csv` with `text/csv` MIME → Should match CSV processors
2. JSON File: `data.json` with `application/json` → Should match JSON parsers
3. HTML File: `page.html` → Should match HTML parsers
4. Excel File: `report.xlsx` → Should match spreadsheet processors

**Text Tests:**

1. JSON String: `{"name": "John", "age": 30}` → Should detect JSON
2. CSV Text: `name,age\nJohn,30\nJane,25` → Should detect CSV
3. Email List: `john@example.com, jane@example.com` → Should detect emails
4. Plain Text: Random text → Should match text processors

**Mixed Tests:**

1. URL + CSV File → Should prioritize URL but show CSV compatibility
2. JSON Text + Excel File → Should recognize both formats

### Questions for Design Decisions

1. **Scoring Weights**: Are the suggested point values appropriate, or should some factors be weighted differently?

2. **Schedule Suggestion**: Should schedule recommendation be aggressive (always suggest for APIs) or conservative (only suggest when pattern strongly indicates it)?

3. **AI Assistance**: If no pipelines match well (all scores <40), should we suggest AI-generated pipeline creation?

4. **Learning**: Should the matcher learn from user selections (e.g., if user always picks pipeline X for CSV files, boost its score)?

5. **Privacy**: All analysis happens locally, right? No input data sent to backend?

6. **Caching**: Should analysis results be cached? How long?

7. **Multiple Suggestions**: How many suggestions should be shown? Top 5? Top 10? All with score >40?

---

## Deliverables

Please provide:

1. **Complete Implementation** of `PipelineMatcher` class with all helper methods
2. **Enums** for input types, URL patterns, MIME categories
3. **JSDoc Documentation** for all public methods
4. **Test Suite** covering all scenarios mentioned above
5. **Integration Example** showing how to use the matcher from UI components
