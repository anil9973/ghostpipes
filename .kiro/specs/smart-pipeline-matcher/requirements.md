# Requirements Document

## Introduction

This document specifies the requirements for an intelligent pipeline recommendation system for GhostPipes. The system analyzes user input (URLs, files, or text) and automatically suggests the most relevant pipelines from the user's library based on sophisticated pattern matching and scoring algorithms. This feature transforms the user experience from manual pipeline selection to intelligent, context-aware recommendations.

## Glossary

- **Pipeline**: A visual workflow consisting of connected nodes that process data
- **Node**: A single operation in a pipeline (e.g., HTTP Request, Parse JSON, Filter)
- **Trigger Node**: The first node in a pipeline that receives input data
- **Processing Node**: A node that transforms or analyzes data
- **Output Node**: A node that exports or saves processed data
- **Input Type**: The category of user input (URL, file, text, or mixed)
- **MIME Type**: A standard identifier for file formats (e.g., text/csv, application/json)
- **URL Pattern**: A classification of URL types (API endpoint, RSS feed, social media, etc.)
- **Match Score**: A numerical value (0-100) indicating how well a pipeline fits the input
- **Confidence Tier**: A categorization of match quality (perfect, good, possible, poor)
- **PipelineMatcher**: The service class that performs input analysis and pipeline scoring

## Requirements

### Requirement 1: Input Analysis and Classification

**User Story:** As a user, I want the system to automatically detect what type of data I'm providing, so that it can suggest appropriate pipelines without me having to specify the format.

#### Acceptance Criteria

1. WHEN a user pastes a URL THEN the system SHALL extract and classify the URL pattern
2. WHEN a user uploads a file THEN the system SHALL analyze the MIME type and file extension
3. WHEN a user pastes text THEN the system SHALL detect structured data formats (JSON, CSV, XML, HTML)
4. WHEN a user provides mixed input (URL + file) THEN the system SHALL analyze both inputs and prioritize appropriately
5. THE system SHALL detect embedded patterns in text including emails, phone numbers, dates, and IP addresses
6. THE system SHALL complete input analysis in less than 100 milliseconds for typical inputs
7. WHEN input analysis fails THEN the system SHALL default to treating input as plain text

### Requirement 2: URL Pattern Recognition

**User Story:** As a user, I want the system to understand different types of URLs, so that it can recommend pipelines designed for APIs, RSS feeds, or web scraping.

#### Acceptance Criteria

1. WHEN a URL contains `/api/`, `.json`, `/v1/`, `/v2/`, or `/graphql` THEN the system SHALL classify it as an API endpoint
2. WHEN a URL contains `/rss`, `/feed`, `.rss`, `.atom`, or `/xml` THEN the system SHALL classify it as an RSS/Atom feed
3. WHEN a URL domain matches twitter.com, x.com, facebook.com, instagram.com, linkedin.com, tiktok.com, or youtube.com THEN the system SHALL classify it as social media
4. WHEN a URL ends with `.pdf`, `.csv`, `.xlsx`, `.zip`, `.json`, or `.xml` THEN the system SHALL classify it as a file download
5. WHEN a URL does not match specific patterns THEN the system SHALL classify it as a standard web page
6. THE system SHALL extract the domain name from URLs for provider-specific matching
7. THE system SHALL recommend scheduling for API endpoints, RSS feeds, and social media URLs
8. THE system SHALL NOT recommend scheduling for static pages or one-time file downloads

### Requirement 3: File Type Detection

**User Story:** As a user, I want the system to recognize my file format, so that it can suggest pipelines with appropriate parsers.

#### Acceptance Criteria

1. WHEN a file has MIME type `text/csv`, `application/vnd.ms-excel`, or `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` THEN the system SHALL categorize it as a spreadsheet
2. WHEN a file has MIME type `application/json`, `application/xml`, `text/xml`, or `application/x-yaml` THEN the system SHALL categorize it as structured data
3. WHEN a file has MIME type `text/html` or `application/xhtml+xml` THEN the system SHALL categorize it as web content
4. WHEN a file has MIME type starting with `image/` THEN the system SHALL categorize it as an image
5. THE system SHALL prioritize exact MIME type matches over category matches
6. WHEN MIME type is unavailable THEN the system SHALL fall back to file extension analysis
7. THE system SHALL extract file name patterns for additional context matching

### Requirement 4: Text Pattern Detection

**User Story:** As a user, I want the system to recognize structured data in pasted text, so that it can suggest appropriate parsing pipelines.

#### Acceptance Criteria

1. WHEN text starts with `{` or `[` and ends with `}` or `]` with valid JSON structure THEN the system SHALL detect it as JSON
2. WHEN text starts with `<` and contains closing tags or XML declaration THEN the system SHALL detect it as XML
3. WHEN text contains multiple lines with consistent delimiters (`,`, `;`, `\t`) THEN the system SHALL detect it as CSV
4. WHEN text contains `<html>`, `<!doctype>`, `<div>`, or `<body>` tags THEN the system SHALL detect it as HTML
5. WHEN text contains `:` with proper indentation patterns THEN the system SHALL detect it as YAML
6. THE system SHALL detect email addresses using regex patterns
7. THE system SHALL detect phone numbers in various international formats
8. THE system SHALL detect embedded URLs within text
9. THE system SHALL detect date patterns (ISO, US, EU formats)
10. THE system SHALL detect IP addresses (IPv4 and IPv6)

### Requirement 5: Pipeline Scoring Algorithm

**User Story:** As a pipeline designer, I want pipelines to be scored based on multiple factors, so that the most relevant suggestions appear first.

#### Acceptance Criteria

1. THE system SHALL assign scores from 0 to 100 points for each pipeline
2. WHEN a pipeline's trigger node matches the input type THEN the system SHALL award 40-60 base points
3. WHEN input MIME type exactly matches pipeline expectations THEN the system SHALL award 30 bonus points
4. WHEN input MIME category matches pipeline expectations THEN the system SHALL award 20 bonus points
5. WHEN URL pattern matches pipeline processing nodes THEN the system SHALL award up to 30 bonus points
6. WHEN text format matches pipeline parser nodes THEN the system SHALL award 20 bonus points
7. WHEN pipeline has been used recently (within 7 days) THEN the system SHALL award 10 bonus points
8. WHEN pipeline has high usage count (more than 10 runs) THEN the system SHALL award 5 bonus points
9. WHEN pipeline name or description matches input characteristics THEN the system SHALL award up to 10 bonus points
10. WHEN API/RSS URL is provided and pipeline has scheduling THEN the system SHALL award 20 bonus points
11. WHEN static page URL is provided and pipeline has scheduling THEN the system SHALL deduct 10 points

### Requirement 6: Match Quality Categorization

**User Story:** As a user, I want to see which pipelines are the best matches, so that I can quickly choose the right one.

#### Acceptance Criteria

1. WHEN a pipeline scores 90-100 points THEN the system SHALL categorize it as a "perfect" match
2. WHEN a pipeline scores 70-89 points THEN the system SHALL categorize it as a "good" match
3. WHEN a pipeline scores 40-69 points THEN the system SHALL categorize it as a "possible" match
4. WHEN a pipeline scores below 40 points THEN the system SHALL categorize it as a "poor" match and exclude it from suggestions
5. THE system SHALL group suggestions by confidence tier (perfect, good, possible)
6. THE system SHALL sort pipelines within each tier by score (highest first)

### Requirement 7: Match Reasoning

**User Story:** As a user, I want to understand why a pipeline was suggested, so that I can make informed decisions.

#### Acceptance Criteria

1. WHEN a pipeline is suggested THEN the system SHALL provide human-readable reasons for the match
2. THE system SHALL explain trigger node compatibility (e.g., "Has HTTP Request node for URL input")
3. THE system SHALL explain format compatibility (e.g., "Can parse JSON data")
4. THE system SHALL explain scheduling recommendations (e.g., "Designed for periodic API fetching")
5. THE system SHALL explain usage patterns (e.g., "Recently used for similar data")
6. THE system SHALL limit reasons to the top 3-5 most significant factors
7. THE system SHALL use clear, non-technical language in explanations

### Requirement 8: Empty State Handling

**User Story:** As a new user with no pipelines, I want helpful suggestions, so that I can get started quickly.

#### Acceptance Criteria

1. WHEN no pipelines exist in the library THEN the system SHALL suggest creating a new pipeline
2. WHEN input is provided but no pipelines exist THEN the system SHALL offer AI-assisted pipeline generation
3. WHEN input is empty THEN the system SHALL display all pipelines sorted by recent usage
4. WHEN no pipelines match well (all scores below 40) THEN the system SHALL suggest creating a new pipeline for the input type

### Requirement 9: Performance Requirements

**User Story:** As a user, I want instant suggestions, so that my workflow is not interrupted.

#### Acceptance Criteria

1. THE system SHALL complete input analysis in less than 100 milliseconds
2. THE system SHALL score 100 pipelines in less than 50 milliseconds
3. THE system SHALL debounce analysis during typing with a 300 millisecond delay
4. THE system SHALL show a loading indicator only if analysis takes more than 500 milliseconds
5. THE system SHALL operate synchronously without async operations for core analysis
6. THE system SHALL be stateless and produce no side effects during analysis

### Requirement 10: Edge Case Handling

**User Story:** As a user, I want the system to handle unusual inputs gracefully, so that it never crashes or produces confusing results.

#### Acceptance Criteria

1. WHEN input is empty THEN the system SHALL show all pipelines sorted by usage
2. WHEN a URL is invalid THEN the system SHALL treat it as plain text
3. WHEN a file is corrupted THEN the system SHALL check MIME type and fall back to extension
4. WHEN input contains both URL and file THEN the system SHALL prioritize URL but mention file compatibility
5. WHEN format is ambiguous (CSV vs TSV) THEN the system SHALL check delimiters to disambiguate
6. WHEN file size is very large THEN the system SHALL consider size in scoring
7. WHEN binary files (images, PDFs) are provided THEN the system SHALL match based on MIME type only
8. WHEN no matches are found THEN the system SHALL provide helpful guidance for creating a new pipeline

### Requirement 11: Integration with Pipeline Storage

**User Story:** As a developer, I want the matcher to integrate seamlessly with existing storage, so that it works with the current architecture.

#### Acceptance Criteria

1. THE system SHALL retrieve pipelines using the existing IndexedDB API
2. THE system SHALL access pipeline metadata including usage count and last used timestamp
3. THE system SHALL work with the existing Pipeline and PipeNode data models
4. THE system SHALL not modify pipeline data during analysis
5. THE system SHALL support recording usage statistics after pipeline selection

### Requirement 12: Privacy and Security

**User Story:** As a privacy-conscious user, I want my data to stay local, so that sensitive information is not exposed.

#### Acceptance Criteria

1. THE system SHALL perform all analysis locally in the browser
2. THE system SHALL NOT send input data to any external servers
3. THE system SHALL NOT store input data unless explicitly saved by the user
4. THE system SHALL NOT log sensitive information from input analysis
5. THE system SHALL clear analysis results when the user navigates away

### Requirement 13: Extensibility

**User Story:** As a developer, I want the matcher to be extensible, so that new patterns and scoring factors can be added easily.

#### Acceptance Criteria

1. THE system SHALL use enums for input types, URL patterns, and MIME categories
2. THE system SHALL separate analysis logic from scoring logic
3. THE system SHALL allow new pattern detectors to be added without modifying core code
4. THE system SHALL allow scoring weights to be configured
5. THE system SHALL provide clear extension points for custom matching logic
