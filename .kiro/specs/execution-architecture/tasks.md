# Implementation Plan

- [x] 1. Create base execution infrastructure

  - Create BaseExecutor abstract class with execute(), validate(), and shouldRetry() methods
  - Create ExecutionContext class with nodeOutputs Map, storage Map, and metadata object
  - Implement setNodeOutput(), getNodeOutput(), getInputData(), and clearNodeOutput() methods
  - Create error classes: NodeExecutionError, ValidationError, RateLimitError
  - _Requirements: 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2. Implement TurbineEngine core

  - [x] 2.1 Create TurbineEngine class with executor registry

    - Initialize executor registry Map for dynamic executor loading
    - Implement getExecutor() method with dynamic import of executor classes
    - Create activeExecutions Map to track running pipelines
    - _Requirements: 2.1, 6.2_

  - [x] 2.2 Implement executePipeline() method

    - Load pipeline configuration from IndexedDB
    - Create ExecutionContext instance with pipeline ID
    - Initialize context with trigger data
    - Calculate topological execution order for nodes
    - Execute nodes sequentially using executeNode()
    - Store execution results in IndexedDB.executions
    - Send chrome.notifications on completion
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.1_

  - [x] 2.3 Implement executeNode() with retry logic

    - Retrieve executor class using getExecutor()
    - Validate input data availability using context.getInputData()
    - Execute node with try-catch and retry loop (max 3 attempts)
    - Implement exponential backoff (1s, 2s, 4s delays)
    - Store output in context on success
    - Call handleNodeFailure() on all retries failed
    - _Requirements: 5.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 2.4 Implement handleNodeFailure() recovery strategies
    - Check for cached data and use if available
    - Check node.config.skipOnError flag and skip if enabled
    - Throw NodeExecutionError if no recovery possible
    - Log all errors with node ID, message, and recovery action
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [x] 3. Create input node executors

  - [x] 3.1 Implement ManualInputExecutor

    - Return input data directly from trigger
    - Validate data format matches expected schema
    - _Requirements: 1.3, 4.1_

  - [x] 3.2 Implement HttpRequestExecutor

    - Execute fetch() with configured URL, method, headers
    - Handle response parsing (JSON, text, blob)
    - Implement retry logic for network errors
    - Cache responses using CacheManager
    - _Requirements: 1.3, 5.1, 10.1_

  - [x] 3.3 Implement WebhookExecutor

    - Extract webhook payload from trigger data
    - Validate payload structure
    - Return payload data for downstream nodes
    - _Requirements: 1.3, 4.4_

  - [ ] 3.4 Implement FileWatchExecutor
    - Extract file content from trigger data
    - Parse file based on format (text, JSON, CSV)
    - Return parsed data
    - _Requirements: 1.3, 4.5_

- [ ] 4. Create processing node executors

  - [ ] 4.1 Implement FilterExecutor

    - Evaluate rules against each item in input array
    - Support operators: ==, !=, >, <, >=, <=, contains, regex
    - Handle permit/block modes
    - Handle all/any match types
    - _Requirements: 1.3_

  - [ ] 4.2 Implement TransformExecutor

    - Apply field mappings to input data
    - Support expressions and functions
    - Handle nested object transformations
    - _Requirements: 1.3_

  - [ ] 4.3 Implement ParseExecutor

    - Parse HTML using DOM parser
    - Parse JSON with error handling
    - Parse CSV with configurable delimiter
    - Extract data using selectors/paths
    - _Requirements: 1.3_

  - [ ] 4.4 Implement ConditionExecutor

    - Evaluate condition expression
    - Route data to true/false output
    - Support multiple condition types
    - _Requirements: 1.3_

  - [ ] 4.5 Implement JoinExecutor

    - Merge multiple inputs into single array
    - Handle different join strategies (inner, outer, left, right)
    - Match records by key field
    - _Requirements: 1.3, 3.5_

  - [ ] 4.6 Implement remaining processing executors

    - Create DeduplicateExecutor for removing duplicates
    - Create ValidateExecutor for schema validation
    - Create AggregateExecutor for sum/avg/count operations
    - Create SortExecutor for sorting arrays
    - Create SplitExecutor for splitting arrays
    - Create LoopExecutor for iterating over items
    - Create SwitchExecutor for multi-way branching
    - Create RegexPatternExecutor for pattern matching
    - Create FormatExecutor for string formatting
    - Create StringBuilderExecutor for template strings
    - Create UrlBuilderExecutor for URL construction
    - Create LookupExecutor for dictionary lookups
    - Create UnionExecutor for set union
    - Create IntersectExecutor for set intersection
    - Create DistinctExecutor for unique values
    - _Requirements: 1.3_

  - [ ] 4.7 Implement CustomCodeExecutor with sandboxing
    - Create isolated execution context without chrome APIs
    - Execute user code with Function constructor
    - Implement 30-second timeout
    - Provide safe console.log/error methods
    - _Requirements: 1.3, 9.1, 9.2_

- [ ] 5. Create output node executors and OutputHandler

  - [ ] 5.1 Create OutputHandler class

    - Implement formatData() method for different formats (JSON, CSV, text)
    - Implement toBase64() helper for data URLs
    - Implement formatEmailBody() for email templates
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 5.2 Implement DownloadExecutor

    - Format data using OutputHandler.formatData()
    - Create data URL with base64 encoding
    - Trigger chrome.downloads.download()
    - Handle download errors
    - _Requirements: 7.1, 7.5_

  - [ ] 5.3 Implement HttpPostExecutor

    - Execute fetch() with configured URL, method, headers, body
    - Handle response and errors
    - Return response data
    - _Requirements: 7.2, 7.5_

  - [ ] 5.4 Implement EmailExecutor

    - Format email body using template
    - Create mailto: URL
    - Send message to UI to open mailto link
    - _Requirements: 7.3, 7.5_

  - [ ] 5.5 Implement FileAppendExecutor
    - Get file handle using File System Access API
    - Create writable stream with keepExistingData
    - Seek to end of file
    - Write formatted data
    - _Requirements: 7.4, 7.5_

- [ ] 6. Implement TriggerManager

  - [ ] 6.1 Create TriggerManager class

    - Initialize chrome.alarms listener
    - Initialize chrome.runtime.onMessage listener
    - Create pipeline-to-trigger mapping
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 6.2 Implement setupSchedule() method

    - Create chrome.alarms entry with pipeline ID
    - Configure interval and start time
    - Store alarm metadata
    - _Requirements: 4.2, 4.3_

  - [ ] 6.3 Implement handleManualTrigger() method

    - Listen for EXECUTE_PIPELINE messages from UI
    - Extract pipeline ID and input data
    - Call turbineEngine.executePipeline()
    - _Requirements: 4.1_

  - [ ] 6.4 Implement handleWebhook() method

    - Listen for WEBHOOK messages
    - Find pipeline by webhook ID
    - Call turbineEngine.executePipeline() with payload
    - _Requirements: 4.4_

  - [ ] 6.5 Implement watchFile() method
    - Setup FileSystemObserver for file handle
    - Listen for file change events
    - Read file content on change
    - Call turbineEngine.executePipeline() with content
    - _Requirements: 4.5_

- [ ] 7. Implement utility classes

  - [ ] 7.1 Create CacheManager class

    - Implement get() method with expiration check
    - Implement set() method with TTL
    - Implement clear() method
    - Use Map for in-memory storage
    - _Requirements: 10.1_

  - [ ] 7.2 Create RateLimiter class

    - Track requests per key in time window
    - Implement checkLimit() method
    - Throw RateLimitError when limit exceeded
    - Calculate wait time for rate limit errors
    - _Requirements: 10.4_

  - [ ] 7.3 Create DataValidator class
    - Implement validate() method with schema checking
    - Implement sanitizeString() method
    - Remove script tags from strings
    - Escape HTML entities
    - _Requirements: 9.3, 9.4_

- [ ] 8. Implement execution results storage

  - [ ] 8.1 Create execution result schema

    - Define execution record structure with id, pipelineId, status, timestamps
    - Define nodeResults structure with success, duration, outputSize, cached
    - Define finalOutput structure with nodeId, data, size
    - Define errors array structure with nodeId, error, recoveryAction
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 8.2 Implement result storage in TurbineEngine
    - Create execution record after pipeline completes
    - Populate nodeResults from ExecutionContext
    - Store finalOutput from last node
    - Store errors array from context.metadata.errors
    - Save to IndexedDB.executions object store
    - _Requirements: 8.5_

- [ ] 9. Implement service worker setup

  - [ ] 9.1 Create service-worker.js entry point

    - Import TurbineEngine, TriggerManager, and utility classes
    - Initialize TurbineEngine instance
    - Initialize TriggerManager instance
    - Setup message listeners
    - Setup alarm listeners
    - _Requirements: 2.1, 4.1, 4.2, 4.3_

  - [ ] 9.2 Setup IndexedDB in service worker
    - Create database with pipelines and executions stores
    - Create indexes for pipelineId and status
    - Implement upgrade handler for schema changes
    - _Requirements: 2.1, 8.5_

- [ ] 10. Implement performance optimizations

  - [ ] 10.1 Add parallel execution support

    - Implement findIndependentGroups() in TurbineEngine
    - Calculate node execution levels
    - Execute nodes at same level in parallel using Promise.all()
    - _Requirements: 10.2_

  - [ ] 10.2 Add memory management

    - Implement clearUnusedOutputs() in ExecutionContext
    - Identify nodes that won't be used again
    - Clear outputs after downstream nodes consume them
    - _Requirements: 10.3_

  - [ ] 10.3 Integrate caching in HttpRequestExecutor

    - Generate cache key from URL and method
    - Check cache before making request
    - Store response in cache with TTL
    - _Requirements: 10.1_

  - [ ] 10.4 Add rate limiting to HttpRequestExecutor
    - Create RateLimiter instance per domain
    - Check rate limit before each request
    - Wait if rate limit exceeded
    - _Requirements: 10.4_

- [ ] 11. Create UI integration points

  - [ ] 11.1 Add manual trigger button in pipeline builder

    - Add "Run Pipeline" button to toolbar
    - Send chrome.runtime.sendMessage on click
    - Show execution progress indicator
    - Display results or errors on completion
    - _Requirements: 4.1_

  - [ ] 11.2 Add schedule configuration UI

    - Create schedule trigger form
    - Allow setting interval and start time
    - Save schedule to pipeline configuration
    - Call TriggerManager.setupSchedule() on save
    - _Requirements: 4.2_

  - [ ] 11.3 Add execution history viewer

    - Query IndexedDB.executions for pipeline
    - Display list of executions with status and timestamps
    - Show node-by-node results on click
    - Display errors and recovery actions
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 11.4 Handle mailto links from service worker
    - Listen for OPEN_MAILTO messages
    - Open mailto URL in new tab
    - _Requirements: 7.3_
