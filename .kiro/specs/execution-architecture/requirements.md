# Requirements Document

## Introduction

The GhostPipes execution architecture enables pipelines to run in the background via a Chrome extension service worker. This system separates UI configuration from execution logic, allowing pipelines to execute on schedules, webhooks, file changes, or manual triggers without requiring the UI to be open.

## Glossary

- **TurbineEngine**: The master controller that orchestrates pipeline execution in the service worker
- **ExecutionContext**: Runtime environment that stores node outputs and shared data during pipeline execution
- **Executor**: A class that implements the actual execution logic for a specific node type
- **Config Class**: A UI-side class that defines configuration options and validation for a node type
- **Trigger**: An event that initiates pipeline execution (manual, schedule, webhook, file watch)
- **Service Worker**: Background script that runs independently of the UI process
- **Node Output**: The data produced by executing a node, stored in ExecutionContext
- **Recovery Strategy**: Error handling approach (retry, cache, skip, or fail)

## Requirements

### Requirement 1: Dual Node System

**User Story:** As a developer, I want separate UI and execution node systems, so that configuration logic stays in the renderer process while execution logic runs in the isolated service worker.

#### Acceptance Criteria

1. WHEN a node type is created, THE System SHALL provide both a Config class for UI and an Executor class for execution
2. THE Config class SHALL define configuration schema, validation rules, and UI display summaries
3. THE Executor class SHALL implement the execute method that processes input data according to configuration
4. THE Config class SHALL NOT contain execution logic
5. THE Executor class SHALL NOT access DOM, window, or document objects

### Requirement 2: TurbineEngine Execution

**User Story:** As a pipeline creator, I want pipelines to execute reliably in the background, so that data processing continues even when the UI is closed.

#### Acceptance Criteria

1. WHEN a trigger event occurs, THE TurbineEngine SHALL load the pipeline configuration from IndexedDB
2. THE TurbineEngine SHALL create an ExecutionContext for the pipeline run
3. THE TurbineEngine SHALL execute nodes sequentially according to pipeline topology
4. WHEN all nodes complete successfully, THE TurbineEngine SHALL store execution results in IndexedDB
5. WHEN execution completes, THE TurbineEngine SHALL send a notification with status and summary

### Requirement 3: ExecutionContext Management

**User Story:** As a node executor, I need access to previous node outputs and shared storage, so that I can process data from upstream nodes.

#### Acceptance Criteria

1. THE ExecutionContext SHALL store outputs from each executed node indexed by node ID
2. THE ExecutionContext SHALL provide a getInputData method that retrieves data from connected input nodes
3. WHEN a node has zero inputs, THE getInputData method SHALL return null
4. WHEN a node has one input, THE getInputData method SHALL return the output data from that node
5. WHEN a node has multiple inputs, THE getInputData method SHALL return an array of objects containing nodeId and data

### Requirement 4: Trigger System

**User Story:** As a pipeline creator, I want multiple ways to trigger pipeline execution, so that pipelines can run on demand, on schedule, via webhooks, or when files change.

#### Acceptance Criteria

1. WHEN a user clicks "Run Pipeline" in the UI, THE System SHALL send a message to the service worker to execute the pipeline manually
2. WHEN a pipeline has a schedule trigger configured, THE System SHALL create a chrome.alarms entry with the specified interval
3. WHEN a chrome.alarms event fires, THE TriggerManager SHALL execute the associated pipeline with trigger type "schedule"
4. WHEN a webhook request is received, THE System SHALL identify the pipeline by webhook ID and execute it with the payload data
5. WHEN a watched file changes, THE System SHALL execute the associated pipeline with the file content as input data

### Requirement 5: Error Recovery

**User Story:** As a pipeline creator, I want pipelines to handle errors gracefully, so that temporary failures don't stop the entire pipeline.

#### Acceptance Criteria

1. WHEN a node execution fails, THE TurbineEngine SHALL retry up to 3 times with exponential backoff
2. WHEN all retries fail and cached data exists, THE TurbineEngine SHALL use the cached output and mark the node as cached
3. WHEN all retries fail and the node has skipOnError enabled, THE TurbineEngine SHALL skip the node and continue execution
4. WHEN all retries fail and no recovery is possible, THE TurbineEngine SHALL throw a NodeExecutionError and stop pipeline execution
5. THE TurbineEngine SHALL log all errors with node ID, error message, and recovery action taken

### Requirement 6: Node Execution Loop

**User Story:** As the execution engine, I need to execute nodes in the correct order with proper error handling, so that data flows correctly through the pipeline.

#### Acceptance Criteria

1. THE TurbineEngine SHALL execute nodes in topological order based on connections
2. WHEN executing a node, THE TurbineEngine SHALL retrieve the appropriate Executor class for the node type
3. THE TurbineEngine SHALL validate that all required input data is available before executing a node
4. THE TurbineEngine SHALL call the Executor's execute method with input data, configuration, and context
5. WHEN a node completes, THE TurbineEngine SHALL store the output in ExecutionContext and update progress

### Requirement 7: Output Handling

**User Story:** As a pipeline creator, I want multiple output options, so that I can download files, send HTTP requests, or trigger emails with pipeline results.

#### Acceptance Criteria

1. WHEN a download output node executes, THE OutputHandler SHALL create a data URL and trigger chrome.downloads.download
2. WHEN an HTTP POST output node executes, THE OutputHandler SHALL send a fetch request with the configured URL, method, and headers
3. WHEN an email output node executes, THE OutputHandler SHALL send a message to the UI to open a mailto: link
4. WHEN a file append output node executes, THE OutputHandler SHALL use File System Access API to write data to the specified file
5. THE OutputHandler SHALL handle errors for each output type and report them in execution results

### Requirement 8: Execution Results Storage

**User Story:** As a user, I want to see the history of pipeline executions, so that I can debug issues and track pipeline performance.

#### Acceptance Criteria

1. THE TurbineEngine SHALL create an execution record with unique ID, pipeline ID, status, and timestamps
2. THE execution record SHALL include node-by-node results with success status, duration, and output size
3. THE execution record SHALL include the final output data from the last node
4. THE execution record SHALL include all errors with node ID, error message, and recovery action
5. THE TurbineEngine SHALL store the execution record in IndexedDB.executions object store

### Requirement 9: Security Sandboxing

**User Story:** As a security-conscious user, I want custom code to run in isolation, so that malicious pipelines cannot access sensitive browser APIs.

#### Acceptance Criteria

1. THE CustomCodeExecutor SHALL execute user code in an isolated context without access to chrome APIs
2. THE System SHALL limit node execution time to 30 seconds maximum
3. THE System SHALL validate all external data from webhooks and file uploads before execution
4. THE System SHALL sanitize data before passing to custom code nodes
5. THE System SHALL validate API response schemas against expected formats

### Requirement 10: Performance Optimization

**User Story:** As a pipeline creator, I want fast execution times, so that pipelines complete quickly even with many nodes.

#### Acceptance Criteria

1. WHEN HTTP request nodes execute, THE System SHALL cache responses with configurable TTL
2. WHEN multiple nodes have no dependencies between them, THE TurbineEngine SHALL execute them in parallel
3. WHEN a node produces large output data, THE TurbineEngine SHALL clear the output from memory after downstream nodes consume it
4. THE System SHALL implement rate limiting for HTTP requests to prevent API throttling
5. THE System SHALL stream large files instead of loading them entirely into memory
