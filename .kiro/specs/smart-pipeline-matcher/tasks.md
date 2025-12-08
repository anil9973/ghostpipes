# Implementation Plan

- [x] 1. Set up matcher service infrastructure

  - Create directory structure for matcher services
  - Create enum files for types
  - Set up test infrastructure
  - _Requirements: All_

- [x] 2. Implement enums and type definitions

  - [x] 2.1 Create UrlPattern enum

    - Define API_ENDPOINT, RSS_FEED, SOCIAL_MEDIA, WEB_PAGE, FILE_DOWNLOAD
    - Export as frozen object
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 2.2 Create MimeCategory enum

    - Define SPREADSHEET, DOCUMENT, STRUCTURED_DATA, WEB_CONTENT, IMAGE, UNKNOWN
    - Export as frozen object
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 2.3 Create ConfidenceTier enum
    - Define PERFECT, GOOD, POSSIBLE, POOR with score ranges
    - Export as frozen object
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 3. Implement UrlAnalyzer

  - [x] 3.1 Create UrlAnalyzer class with pattern detection

    - Implement analyze() method
    - Implement classifyPattern() method
    - Implement extractDomain() method
    - Implement shouldSchedule() method
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 3.2 Add URL pattern detection logic

    - Detect API endpoints (contains /api/, .json, /v1/, /graphql)
    - Detect RSS feeds (contains /rss, /feed, .rss, .atom)
    - Detect social media (domain matching)
    - Detect file downloads (extension matching)
    - Default to web page
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.3 Add scheduling recommendation logic
    - Recommend scheduling for APIs, RSS, social media
    - Don't recommend for static pages
    - _Requirements: 2.7, 2.8_

- [x] 4. Implement FileAnalyzer

  - [x] 4.1 Create FileAnalyzer class

    - Implement analyze() method
    - Implement categorizeMimeType() method
    - Implement getExtension() method
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 4.2 Add MIME type categorization

    - Categorize spreadsheets (CSV, Excel)
    - Categorize structured data (JSON, XML, YAML)
    - Categorize web content (HTML)
    - Categorize images
    - Categorize documents (PDF, text, markdown)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 4.3 Add extension fallback logic
    - Extract extension from filename
    - Map extensions to MIME categories
    - Use when MIME type unavailable
    - _Requirements: 3.6_

- [x] 5. Implement TextAnalyzer

  - [x] 5.1 Create TextAnalyzer class

    - Implement analyze() method
    - Implement format detection methods
    - Implement pattern detection methods
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

  - [x] 5.2 Add structured format detection

    - Implement isJson() - check for {}/[] with validation
    - Implement isXml() - check for < tags and declarations
    - Implement isCsv() - check for consistent delimiters
    - Implement isHtml() - check for HTML tags
    - Implement isYaml() - check for : and indentation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 5.3 Add pattern detection methods
    - Implement containsEmails() - regex for email patterns
    - Implement containsPhones() - regex for phone patterns
    - Implement containsUrls() - regex for URL patterns
    - Implement containsDates() - regex for date patterns
    - Implement containsIpAddresses() - regex for IP patterns
    - _Requirements: 4.6, 4.7, 4.8, 4.9, 4.10_

- [x] 6. Implement InputAnalyzer

  - [x] 6.1 Create InputAnalyzer class

    - Implement analyze() method
    - Implement detectInputType() method
    - Integrate UrlAnalyzer, FileAnalyzer, TextAnalyzer
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 6.2 Add input type detection

    - Detect URL input
    - Detect file input
    - Detect text input
    - Detect mixed input (URL + file)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 6.3 Add error handling
    - Handle null/undefined input
    - Handle invalid URLs (treat as text)
    - Handle corrupted files (fallback to extension)
    - Handle empty strings
    - _Requirements: 1.7, 10.1, 10.2, 10.3_

- [x] 7. Implement PipelineInspector utility

  - [x] 7.1 Create PipelineInspector class

    - Implement getTriggerNode() method
    - Implement getProcessingNodes() method
    - Implement getOutputNodes() method
    - Implement hasNodeType() method
    - _Requirements: 11.3_

  - [x] 7.2 Add pipeline analysis methods
    - Implement hasParser() - check for parse nodes
    - Implement hasAiProcessor() - check for AI nodes
    - Implement hasRegexNode() - check for regex nodes
    - Implement isScheduled() - check for schedule trigger
    - _Requirements: 5.6, 5.7, 5.10_

- [x] 8. Implement PipelineScorer

  - [x] 8.1 Create PipelineScorer class

    - Implement scoreAll() method
    - Implement scorePipeline() method
    - Implement score breakdown methods
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11_

  - [x] 8.2 Implement trigger node scoring (40-60 pts)

    - URL input + HTTP Request node: 50 pts
    - File input + Manual Input node (MIME match): 60 pts
    - Text input + Manual Input node: 40 pts
    - Webhook node (not relevant): 0 pts
    - _Requirements: 5.2_

  - [x] 8.3 Implement input compatibility scoring (0-30 pts)

    - Exact MIME type match: +30 pts
    - MIME category match: +20 pts
    - File extension match: +15 pts
    - URL pattern match: +25 pts
    - API URL + JSON parser: +30 pts
    - RSS URL + XML parser: +30 pts
    - Web page + HTML parser: +25 pts
    - _Requirements: 5.3, 5.4, 5.5, 5.6_

  - [x] 8.4 Implement processing node scoring (0-20 pts)

    - JSON text + Parse JSON node: +20 pts
    - CSV text + Parse CSV node: +20 pts
    - URL + Parse HTML node: +15 pts
    - Email/phone patterns + Regex node: +15 pts
    - AI Processor node: +10 pts
    - _Requirements: 5.7_

  - [x] 8.5 Implement schedule scoring (0-20 pts)

    - API/RSS/Social URL + Scheduled node: +20 pts
    - File download URL + Schedule: +15 pts
    - Static page + Schedule: -10 pts (penalty)
    - _Requirements: 5.10, 5.11_

  - [x] 8.6 Implement usage pattern scoring (0-10 pts)

    - Recently used (< 7 days): +10 pts
    - Used in last month: +5 pts
    - High usage count (>10 runs): +5 pts
    - Never used: 0 pts
    - _Requirements: 5.8, 5.9_

  - [x] 8.7 Implement context matching scoring (0-10 pts)

    - Pipeline name matches input domain: +10 pts
    - Pipeline description matches data type: +5 pts
    - Pipeline tags match input characteristics: +5 pts
    - _Requirements: 5.11_

  - [x] 8.8 Add score validation
    - Ensure scores are 0-100
    - Clamp scores if needed
    - Handle NaN/Infinity
    - _Requirements: 5.1_

- [x] 9. Implement MatchExplainer

  - [x] 9.1 Create MatchExplainer class

    - Implement generateReasons() method
    - Implement explanation methods for each factor
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 9.2 Add trigger node explanations

    - Explain HTTP Request compatibility
    - Explain Manual Input compatibility
    - Explain file format compatibility
    - _Requirements: 7.2_

  - [x] 9.3 Add format compatibility explanations

    - Explain JSON parsing capability
    - Explain CSV parsing capability
    - Explain XML parsing capability
    - Explain HTML parsing capability
    - _Requirements: 7.3_

  - [x] 9.4 Add scheduling explanations

    - Explain why scheduling is recommended
    - Explain periodic fetching benefits
    - _Requirements: 7.4_

  - [x] 9.5 Add usage pattern explanations

    - Explain recent usage
    - Explain high usage count
    - _Requirements: 7.5_

  - [x] 9.6 Limit and format reasons
    - Limit to top 3-5 reasons
    - Use clear, non-technical language
    - Format as bullet points
    - _Requirements: 7.6, 7.7_

- [x] 10. Implement PipelineMatcher main service

  - [x] 10.1 Create PipelineMatcher class

    - Implement constructor accepting pipelines array
    - Implement match() method
    - Integrate all analyzers and scorers
    - _Requirements: All_

  - [x] 10.2 Implement match() method logic

    - Call InputAnalyzer to analyze input
    - Call PipelineScorer to score all pipelines
    - Call MatchExplainer to generate reasons
    - Categorize by confidence tier
    - Return MatchResult
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 10.3 Add confidence tier categorization

    - Perfect: 90-100 points
    - Good: 70-89 points
    - Possible: 40-69 points
    - Poor: <40 points (exclude from results)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 10.4 Add empty state handling

    - Handle no pipelines case
    - Handle no matches case (all <40)
    - Handle empty input case
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 10.5 Add performance optimizations
    - Ensure analysis completes in <100ms
    - Ensure scoring completes in <50ms for 100 pipelines
    - Add early exit for low scores
    - Cache regex compilations
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 11. Create data model classes

  - [x] 11.1 Create InputAnalysis class

    - Define inputType property
    - Define url analysis properties
    - Define file analysis properties
    - Define text analysis properties
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 11.2 Create ScoredPipeline class

    - Define pipeline property
    - Define score property
    - Define confidence property
    - Define reasons array
    - Define breakdown object
    - _Requirements: 5.1, 6.1, 7.1_

  - [x] 11.3 Create MatchResult class
    - Define inputType property
    - Define detected analysis
    - Define suggestions array
    - Define perfect/good/possible arrays
    - _Requirements: 6.5_

- [x] 12. Add error handling and edge cases

  - [x] 12.1 Handle invalid inputs

    - Null/undefined input → return all pipelines
    - Invalid URL → treat as text
    - Corrupted file → use MIME/extension fallback
    - Empty string → return all pipelines
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 12.2 Handle ambiguous formats

    - CSV vs TSV → check delimiters
    - JSON vs JSONL → validate structure
    - XML vs HTML → check for HTML-specific tags
    - _Requirements: 10.5_

  - [x] 12.3 Handle large inputs

    - Large files → consider size in scoring
    - Very large text → truncate for analysis
    - Many pipelines → show warning but continue
    - _Requirements: 10.6, 10.7_

  - [x] 12.4 Handle binary files
    - Images → match on MIME type only
    - PDFs → match on MIME type only
    - Archives → match on MIME type only
    - _Requirements: 10.8_

- [x] 13. Checkpoint - Ensure core matcher works

  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Create UI integration components

  - [x] 14.1 Create SuggestionCard component

    - Display pipeline name and icon
    - Display match score
    - Display match reasons as bullets
    - Add "Run with this data" button
    - Add "Edit and run" option
    - Highlight perfect matches visually
    - _Requirements: All_

  - [x] 14.2 Create SuggestionList component

    - Group suggestions by confidence tier
    - Show tier headers (Perfect, Good, Possible)
    - Sort within tiers by score
    - Show empty state when no matches
    - _Requirements: 6.5, 6.6_

  - [x] 14.3 Create EmptyState component
    - Show when no pipelines exist
    - Suggest creating new pipeline
    - Offer AI-assisted generation
    - Show templates
    - _Requirements: 8.1, 8.2, 8.4_

- [x] 15. Integrate with homepage input field

  - [x] 15.1 Add matcher to input field component

    - Import PipelineMatcher
    - Fetch pipelines from IndexedDB
    - Call matcher on input change
    - Display suggestions
    - _Requirements: 11.1, 11.2_

  - [x] 15.2 Add debouncing for typing

    - Debounce analysis by 300ms
    - Cancel previous analysis on new input
    - Show loading indicator if >500ms
    - _Requirements: 9.3, 9.4_

  - [x] 15.3 Add suggestion interaction handlers
    - Handle "Run with this data" click
    - Handle "Edit and run" click
    - Record usage when pipeline selected
    - _Requirements: 11.5_

- [x] 16. Add usage tracking

  - [x] 16.1 Create usage tracking utility

    - Record pipeline selection
    - Update usage count
    - Update last used timestamp
    - Store in IndexedDB
    - _Requirements: 11.5_

  - [x] 16.2 Integrate usage data into scoring
    - Fetch usage data for each pipeline
    - Use in usage pattern scoring
    - _Requirements: 5.8, 5.9_

- [x] 17. Add CSS styling

  - [x] 17.1 Style SuggestionCard component

    - Card layout with shadow
    - Confidence tier colors (green/blue/yellow)
    - Score badge styling
    - Reason list styling
    - Button styling
    - Hover effects
    - _Requirements: All_

  - [x] 17.2 Style SuggestionList component

    - Tier header styling
    - Spacing between tiers
    - Responsive layout
    - _Requirements: 6.5_

  - [x] 17.3 Style EmptyState component

    - Centered layout
    - Icon/illustration
    - Call-to-action buttons
    - _Requirements: 8.1, 8.2_

  - [x] 17.4 Add loading states
    - Skeleton loading for suggestions
    - Spinner for analysis
    - Smooth transitions
    - _Requirements: 9.4_

- [x] 18. Add accessibility features

  - [x] 18.1 Add ARIA labels

    - Label suggestion cards
    - Label confidence tiers
    - Label action buttons
    - _Requirements: All_

  - [x] 18.2 Add keyboard navigation

    - Tab through suggestions
    - Enter to select
    - Escape to close
    - _Requirements: All_

  - [x] 18.3 Add screen reader support
    - Announce match count
    - Announce confidence tiers
    - Announce score changes
    - _Requirements: All_

- [x] 19. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
