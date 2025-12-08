# Design Document

## Overview

The Node Execution Engine Update enhances the GhostPipes pipeline execution system to ensure all node types execute correctly in the Chrome extension service worker environment. The design addresses the constraints of Manifest V3 service workers, which cannot directly access certain APIs like FileSystemObserver. The solution implements a hybrid architecture where the service worker handles pipeline execution while a persistent observer page handles file system watching.

The architecture includes a comprehensive node executor framework with standardized interfaces, robust error handling with configurable retry strategies, file permission management with user-friendly dialogs, and a file watching system using FileSystemObserver in a persistent page. All executors follow a consistent pattern with validate(), execute(), and cleanup() methods, ensuring reliable resource management and error recovery.

## Architecture

### Component Hierarchy

```
Node Execution System
├── Service Worker (Background)
│   ├── Pipeline Executor
│   │   ├── Execution Queue
│   │   ├── Node Scheduler
│   │   └── Retry Manager
│   ├── Node Executors
│   │   ├── Input Executors
│   │   ├── Processing Executors
│   │   └── Output Executors
│   ├── Permission Manager
│   │   ├── Permission Request Queue
│   │   └── Permission Cache
│   └── Execution Logger
├── Observer Page (Persistent)
│   ├── FileSystemObserver Manager
│   │   ├── Observer Instances
│   │   └── Watch Configuration
│   ├── Change Detector
│   │   ├── Debouncer
│   │   └── Event Queue
│   └── Service Worker Communicator
├── Options Page (UI)
│   ├── Permission Dialog
│   ├── Observer Status Display
│   └── Message Handler
└── IndexedDB Storage
    ├── FileHandle Store
    ├── Execution Logs
    ├── Observer Config
    └── Permission Cache
```

### Execution Flow

```
Pipeline Trigger
    ↓
Service Worker: Pipeline Executor
    ↓
Validate All Nodes
    ↓
Execute Nodes Sequentially/Parallel
    ↓
For Each Node:
    ├→ Get Executor
    ├→ Call validate()
    ├→ Call execute()
    │   ├→ Need Permission?
    │   │   ├→ Check Cache
    │   │   ├→ Request from User
    │   │   └→ Wait for Response
    │   ├→ Execute Logic
    │   ├→ Handle Errors
    │   └→ Retry if Needed
    └→ Call cleanup()
    ↓
Log Results
    ↓
Complete Pipeline
```

### File Permission Flow

```
Node Needs File Permission
    ↓
Service Worker: Check Permission Cache
    ├→ Cached: Use Cached Permission
    └→ Not Cached:
        ↓
        Send Message to Options Page
        ↓
        Options Page Not Open?
        ├→ Open Options Page
        └→ Already Open
        ↓
        Display Permission Dialog
        ↓
        User Clicks "Grant Permission"
        ↓
        Request Permission via File System Access API
        ↓
        Send Result to Service Worker
        ↓
        Cache Permission
        ↓
        Resume Node Execution
```

### File Watch Flow

```
Browser Starts
    ↓
Check if File Watching Enabled
    ├→ No: Skip
    └→ Yes:
        ↓
        Open Observer Page (Hidden)
        ↓
        Load Observer Configuration
        ↓
        Create FileSystemObserver Instances
        ↓
        Watch Configured Directories
        ↓
        File Change Detected
        ↓
        Debounce (500ms)
        ↓
        Extract File Info
        ↓
        Find Matching Pipelines
        ↓
        Send Message to Service Worker
        ↓
        Service Worker Executes Pipelines
```

## Components and Interfaces

### 1. BaseNodeExecutor

```javascript
class BaseNodeExecutor {
  /** @param {PipeNode} node */
  constructor(node);

  /** @type {PipeNode} Node configuration */
  node;

  /** @type {number} Execution timeout in ms */
  timeout;

  /** @type {RetryStrategy} Retry configuration */
  retryStrategy;

  /**
   * Validate node configuration
   * @returns {string[]} Array of validation errors
   */
  validate();

  /**
   * Execute node logic
   * @param {any} input - Input data from previous node
   * @param {ExecutionContext} context - Execution context
   * @returns {Promise<any>} Output data
   */
  async execute(input, context);

  /**
   * Clean up resources
   * @returns {Promise<void>}
   */
  async cleanup();

  /**
   * Check if error is retryable
   * @param {Error} error
   * @returns {boolean}
   */
  isRetryableError(error);

  /**
   * Get executor metadata
   * @returns {ExecutorMetadata}
   */
  static getMetadata();
}
```

### 2. PipelineExecutor

```javascript
class PipelineExecutor {
  /** @param {Pipeline} pipeline */
  constructor(pipeline);

  /** @type {Pipeline} */
  pipeline;

  /** @type {Map<string, BaseNodeExecutor>} */
  executors;

  /** @type {ExecutionLogger} */
  logger;

  /** @type {PermissionManager} */
  permissionManager;

  /**
   * Execute entire pipeline
   * @returns {Promise<ExecutionResult>}
   */
  async execute();

  /**
   * Validate entire pipeline
   * @returns {ValidationResult}
   */
  validate();

  /**
   * Execute single node
   * @param {PipeNode} node
   * @param {any} input
   * @returns {Promise<any>}
   */
  async executeNode(node, input);

  /**
   * Get executor for node type
   * @param {string} nodeType
   * @returns {BaseNodeExecutor}
   */
  getExecutor(nodeType);

  /**
   * Handle node execution error
   * @param {PipeNode} node
   * @param {Error} error
   * @param {number} attempt
   * @returns {Promise<any>}
   */
  async handleError(node, error, attempt);

  /**
   * Stop pipeline execution
   * @returns {Promise<void>}
   */
  async stop();

  /**
   * Clean up all resources
   * @returns {Promise<void>}
   */
  async cleanup();
}
```

### 3. PermissionManager

```javascript
class PermissionManager {
  /** @type {Map<string, PermissionStatus>} */
  permissionCache;

  /** @type {Array<PermissionRequest>} */
  requestQueue;

  /**
   * Request file permission
   * @param {string} fileHandleId
   * @param {string} filename
   * @returns {Promise<boolean>}
   */
  async requestFilePermission(fileHandleId, filename);

  /**
   * Check cached permission
   * @param {string} fileHandleId
   * @returns {PermissionStatus|null}
   */
  getCachedPermission(fileHandleId);

  /**
   * Cache permission result
   * @param {string} fileHandleId
   * @param {boolean} granted
   * @returns {Promise<void>}
   */
  async cachePermission(fileHandleId, granted);

  /**
   * Batch request multiple permissions
   * @param {Array<{fileHandleId: string, filename: string}>} requests
   * @returns {Promise<Map<string, boolean>>}
   */
  async batchRequestPermissions(requests);

  /**
   * Send permission request to options page
   * @param {string} fileHandleId
   * @param {string} filename
   * @returns {Promise<boolean>}
   */
  async sendPermissionRequest(fileHandleId, filename);

  /**
   * Handle permission response
   * @param {string} fileHandleId
   * @param {boolean} granted
   */
  handlePermissionResponse(fileHandleId, granted);

  /**
   * Clear permission cache
   * @returns {Promise<void>}
   */
  async clearCache();
}
```

### 4. FileSystemObserverManager

```javascript
class FileSystemObserverManager {
  /** @type {Map<string, FileSystemObserver>} */
  observers;

  /** @type {Map<string, WatchConfig>} */
  watchConfigs;

  /** @type {ServiceWorkerCommunicator} */
  communicator;

  /**
   * Initialize observer manager
   * @returns {Promise<void>}
   */
  async initialize();

  /**
   * Add directory to watch
   * @param {string} directoryHandleId
   * @param {WatchConfig} config
   * @returns {Promise<void>}
   */
  async addWatch(directoryHandleId, config);

  /**
   * Remove directory watch
   * @param {string} directoryHandleId
   * @returns {Promise<void>}
   */
  async removeWatch(directoryHandleId);

  /**
   * Handle file change event
   * @param {FileSystemObserverRecord[]} records
   * @param {FileSystemObserver} observer
   */
  handleFileChange(records, observer);

  /**
   * Find pipelines for changed file
   * @param {string} filePath
   * @returns {Promise<string[]>} Pipeline IDs
   */
  async findMatchingPipelines(filePath);

  /**
   * Send file change to service worker
   * @param {string[]} pipelineIds
   * @param {FileChangeInfo} changeInfo
   * @returns {Promise<void>}
   */
  async notifyServiceWorker(pipelineIds, changeInfo);

  /**
   * Reconnect all observers
   * @returns {Promise<void>}
   */
  async reconnectAll();

  /**
   * Save configuration
   * @returns {Promise<void>}
   */
  async saveConfig();

  /**
   * Load configuration
   * @returns {Promise<void>}
   */
  async loadConfig();
}
```

### 5. ExecutionLogger

```javascript
class ExecutionLogger {
  /** @type {string} */
  pipelineId;

  /** @type {Array<LogEntry>} */
  logs;

  /**
   * Log node start
   * @param {string} nodeId
   * @param {string} nodeType
   */
  logNodeStart(nodeId, nodeType);

  /**
   * Log node completion
   * @param {string} nodeId
   * @param {number} duration
   * @param {number} inputSize
   * @param {number} outputSize
   */
  logNodeComplete(nodeId, duration, inputSize, outputSize);

  /**
   * Log node error
   * @param {string} nodeId
   * @param {Error} error
   * @param {number} attempt
   */
  logNodeError(nodeId, error, attempt);

  /**
   * Log permission request
   * @param {string} fileHandleId
   * @param {string} filename
   */
  logPermissionRequest(fileHandleId, filename);

  /**
   * Log permission response
   * @param {string} fileHandleId
   * @param {boolean} granted
   */
  logPermissionResponse(fileHandleId, granted);

  /**
   * Log timeout
   * @param {string} nodeId
   * @param {number} timeout
   */
  logTimeout(nodeId, timeout);

  /**
   * Get logs for pipeline
   * @param {LogFilter} filter
   * @returns {Promise<LogEntry[]>}
   */
  async getLogs(filter);

  /**
   * Clear old logs
   * @param {number} retentionDays
   * @returns {Promise<void>}
   */
  async clearOldLogs(retentionDays);

  /**
   * Export logs
   * @param {string} format - 'json' | 'csv'
   * @returns {Promise<string>}
   */
  async exportLogs(format);
}
```

### 6. RetryManager

```javascript
class RetryManager {
  /** @type {RetryStrategy} */
  strategy;

  /** @type {number} */
  maxAttempts;

  /** @type {number} */
  baseDelay;

  /**
   * Execute with retry
   * @param {Function} fn - Function to execute
   * @param {ExecutionContext} context
   * @returns {Promise<any>}
   */
  async executeWithRetry(fn, context);

  /**
   * Calculate retry delay
   * @param {number} attempt
   * @returns {number} Delay in ms
   */
  calculateDelay(attempt);

  /**
   * Check if should retry
   * @param {Error} error
   * @param {number} attempt
   * @returns {boolean}
   */
  shouldRetry(error, attempt);

  /**
   * Wait for delay
   * @param {number} ms
   * @returns {Promise<void>}
   */
  async wait(ms);
}
```

### 7. FileAppendExecutor

```javascript
class FileAppendExecutor extends BaseNodeExecutor {
  /**
   * Execute file append
   * @param {any} input - Data to append
   * @param {ExecutionContext} context
   * @returns {Promise<AppendResult>}
   */
  async execute(input, context);

  /**
   * Get file handle from IndexedDB
   * @param {string} fileHandleId
   * @returns {Promise<FileSystemFileHandle>}
   */
  async getFileHandle(fileHandleId);

  /**
   * Check write permission
   * @param {FileSystemFileHandle} fileHandle
   * @returns {Promise<boolean>}
   */
  async checkPermission(fileHandle);

  /**
   * Request write permission
   * @param {FileSystemFileHandle} fileHandle
   * @returns {Promise<boolean>}
   */
  async requestPermission(fileHandle);

  /**
   * Append data to file
   * @param {FileSystemFileHandle} fileHandle
   * @param {string} data
   * @returns {Promise<void>}
   */
  async appendToFile(fileHandle, data);

  /**
   * Format data for appending
   * @param {any} data
   * @returns {string}
   */
  formatData(data);
}
```

### 8. ServiceWorkerCommunicator

```javascript
class ServiceWorkerCommunicator {
  /** @type {Array<PendingMessage>} */
  messageQueue;

  /** @type {boolean} */
  isConnected;

  /**
   * Send message to service worker
   * @param {string} command
   * @param {any} data
   * @returns {Promise<any>}
   */
  async sendMessage(command, data);

  /**
   * Send with retry
   * @param {string} command
   * @param {any} data
   * @param {number} maxRetries
   * @returns {Promise<any>}
   */
  async sendWithRetry(command, data, maxRetries);

  /**
   * Queue message if service worker unavailable
   * @param {string} command
   * @param {any} data
   */
  queueMessage(command, data);

  /**
   * Process message queue
   * @returns {Promise<void>}
   */
  async processQueue();

  /**
   * Check service worker status
   * @returns {Promise<boolean>}
   */
  async checkServiceWorker();

  /**
   * Handle service worker restart
   */
  handleServiceWorkerRestart();
}
```

### 9. NodeExecutorRegistry

```javascript
class NodeExecutorRegistry {
  /** @type {Map<string, typeof BaseNodeExecutor>} */
  static executors = new Map();

  /**
   * Register executor
   * @param {string} nodeType
   * @param {typeof BaseNodeExecutor} executorClass
   */
  static register(nodeType, executorClass);

  /**
   * Get executor class
   * @param {string} nodeType
   * @returns {typeof BaseNodeExecutor}
   */
  static get(nodeType);

  /**
   * Check if executor exists
   * @param {string} nodeType
   * @returns {boolean}
   */
  static has(nodeType);

  /**
   * Get all registered node types
   * @returns {string[]}
   */
  static getNodeTypes();

  /**
   * Audit executors
   * @returns {ExecutorAuditReport}
   */
  static audit();
}
```

### 10. PermissionDialog Component

```javascript
class PermissionDialog extends HTMLDialogElement {
  /** @type {string} */
  fileHandleId;

  /** @type {string} */
  filename;

  /** @type {Function} */
  onGrant;

  /** @type {Function} */
  onDeny;

  /**
   * Show dialog
   * @param {string} fileHandleId
   * @param {string} filename
   * @returns {Promise<boolean>}
   */
  async show(fileHandleId, filename);

  /**
   * Handle grant button click
   */
  async handleGrant();

  /**
   * Handle deny button click
   */
  handleDeny();

  /**
   * Request file permission
   * @returns {Promise<boolean>}
   */
  async requestPermission();

  /**
   * Render dialog
   */
  render();
}
```

## Data Models

### ExecutionContext

```javascript
class ExecutionContext {
	/** @type {string} Pipeline ID */
	pipelineId;

	/** @type {string} Execution ID */
	executionId;

	/** @type {Map<string, any>} Shared data between nodes */
	sharedData;

	/** @type {ExecutionLogger} Logger instance */
	logger;

	/** @type {PermissionManager} Permission manager */
	permissionManager;

	/** @type {AbortController} Abort controller */
	abortController;

	/** @type {number} Start timestamp */
	startTime;

	/** @type {boolean} Is stopped */
	isStopped;
}
```

### ExecutionResult

```javascript
class ExecutionResult {
	/** @type {boolean} Success status */
	success;

	/** @type {string} Pipeline ID */
	pipelineId;

	/** @type {Map<string, NodeResult>} Results per node */
	nodeResults;

	/** @type {number} Total duration */
	duration;

	/** @type {Error} Error if failed */
	error;

	/** @type {number} Nodes executed */
	nodesExecuted;

	/** @type {number} Nodes failed */
	nodesFailed;

	/** @type {number} Nodes skipped */
	nodesSkipped;
}
```

### NodeResult

```javascript
class NodeResult {
	/** @type {string} Node ID */
	nodeId;

	/** @type {string} Node type */
	nodeType;

	/** @type {boolean} Success status */
	success;

	/** @type {any} Output data */
	output;

	/** @type {Error} Error if failed */
	error;

	/** @type {number} Duration in ms */
	duration;

	/** @type {number} Retry attempts */
	retryAttempts;

	/** @type {number} Input size in bytes */
	inputSize;

	/** @type {number} Output size in bytes */
	outputSize;
}
```

### RetryStrategy

```javascript
class RetryStrategy {
  /** @type {RetryType} Type of retry */
  type;

  /** @type {number} Max attempts */
  maxAttempts;

  /** @type {number} Base delay in ms */
  baseDelay;

  /** @type {number} Max delay in ms */
  maxDelay;

  /** @type {string[]} Retryable error types */
  retryableErrors;

  /** Get default strategy */
  static getDefault();
}
```

### WatchConfig

```javascript
class WatchConfig {
	/** @type {string} Directory handle ID */
	directoryHandleId;

	/** @type {string} Directory path */
	directoryPath;

	/** @type {boolean} Watch recursively */
	recursive;

	/** @type {string[]} File patterns to watch */
	patterns;

	/** @type {string[]} Pipeline IDs to trigger */
	pipelineIds;

	/** @type {number} Debounce delay in ms */
	debounceDelay;

	/** @type {boolean} Enabled */
	enabled;
}
```

### FileChangeInfo

```javascript
class FileChangeInfo {
	/** @type {string} File path */
	filePath;

	/** @type {string} File name */
	fileName;

	/** @type {ChangeType} Type of change */
	changeType;

	/** @type {number} Timestamp */
	timestamp;

	/** @type {number} File size */
	fileSize;

	/** @type {FileSystemFileHandle} File handle */
	fileHandle;
}
```

### PermissionRequest

```javascript
class PermissionRequest {
	/** @type {string} Request ID */
	id;

	/** @type {string} File handle ID */
	fileHandleId;

	/** @type {string} Filename */
	filename;

	/** @type {number} Timestamp */
	timestamp;

	/** @type {Function} Resolve callback */
	resolve;

	/** @type {Function} Reject callback */
	reject;

	/** @type {number} Timeout in ms */
	timeout;
}
```

### LogEntry

```javascript
class LogEntry {
	/** @type {string} Log ID */
	id;

	/** @type {string} Pipeline ID */
	pipelineId;

	/** @type {string} Execution ID */
	executionId;

	/** @type {string} Node ID */
	nodeId;

	/** @type {LogLevel} Log level */
	level;

	/** @type {string} Message */
	message;

	/** @type {any} Additional data */
	data;

	/** @type {number} Timestamp */
	timestamp;

	/** @type {string} Stack trace */
	stackTrace;
}
```

### ExecutorMetadata

```javascript
class ExecutorMetadata {
	/** @type {string} Node type */
	nodeType;

	/** @type {string} Display name */
	displayName;

	/** @type {string} Description */
	description;

	/** @type {string} Category */
	category;

	/** @type {string[]} Required permissions */
	requiredPermissions;

	/** @type {boolean} Supports async */
	supportsAsync;

	/** @type {number} Default timeout */
	defaultTimeout;

	/** @type {boolean} Is retryable */
	isRetryable;
}
```

### ExecutorAuditReport

```javascript
class ExecutorAuditReport {
  /** @type {string[]} All node types */
  allNodeTypes;

  /** @type {string[]} Registered executors */
  registeredExecutors;

  /** @type {string[]} Missing executors */
  missingExecutors;

  /** @type {Map<string, string[]>} Incomplete executors */
  incompleteExecutors;

  /** @type {Map<string, ExecutorMetadata>} Executor metadata */
  executorMetadata;

  /** @type {number} Total nodes */
  totalNodes;

  /** @type {number} Coverage percentage */
  coveragePercentage;

  /** Generate markdown report */
  toMarkdown();
}
```

## Enums

### RetryType

```javascript
const RetryType = Object.freeze({
	NONE: "none",
	FIXED: "fixed",
	EXPONENTIAL: "exponential",
});
```

### ChangeType

```javascript
const ChangeType = Object.freeze({
	ADDED: "added",
	MODIFIED: "modified",
	DELETED: "deleted",
	RENAMED: "renamed",
});
```

### LogLevel

```javascript
const LogLevel = Object.freeze({
	DEBUG: "debug",
	INFO: "info",
	WARN: "warn",
	ERROR: "error",
});
```

### PermissionStatus

```javascript
const PermissionStatus = Object.freeze({
	GRANTED: "granted",
	DENIED: "denied",
	PROMPT: "prompt",
});
```

### NodeCategory

```javascript
const NodeCategory = Object.freeze({
	INPUT: "input",
	PROCESSING: "processing",
	OUTPUT: "output",
});
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property Reflection

After analyzing all acceptance criteria, many properties can be consolidated:

- Executor existence properties (9.1-11.10) can be combined into executor registry completeness
- Permission flow properties (3.1-4.10) can be combined into permission request lifecycle
- Error handling and retry properties (12.1-13.10, 19.1-19.10) can be combined into error recovery
- Logging properties (14.1-14.10) can be combined into comprehensive logging
- Cleanup properties (21.1-21.10) can be combined into resource management

### Core Properties

Property 1: Executor registry completeness
_For any_ node type defined in the configs directory, there should exist a corresponding registered executor in the NodeExecutorRegistry
**Validates: Requirements 1.4, 1.5, 9.1-11.10**

Property 2: Executor interface compliance
_For any_ registered executor, it should implement validate(), execute(), and cleanup() methods
**Validates: Requirements 1.5, 20.1-20.10, 21.1-21.10**

Property 3: File handle retrieval
_For any_ file append node execution, the system should successfully retrieve the fileHandle from IndexedDB or fail with a clear error
**Validates: Requirements 2.1**

Property 4: Permission check before file write
_For any_ file operation, the system should check write permission before attempting to write
**Validates: Requirements 2.2**

Property 5: Permission request on denial
_For any_ file operation with denied permission, the system should request permission from the user
**Validates: Requirements 2.3, 3.1, 3.2**

Property 6: Permission dialog display
_For any_ permission request, the options page should display a permission dialog with the filename
**Validates: Requirements 3.3, 3.4, 3.5**

Property 7: Permission response handling
_For any_ permission dialog interaction, the system should send the result back to the service worker and resume execution
**Validates: Requirements 3.7, 3.8, 3.9**

Property 8: Permission request timeout
_For any_ permission request that doesn't receive a response within 30 seconds, the system should timeout and fail the operation
**Validates: Requirements 3.10**

Property 9: Options page message handling
_For any_ "requestPermission" message received by the options page, it should display the dialog and request permission
**Validates: Requirements 4.1-4.10**

Property 10: FileSystemObserver in persistent page
_For any_ file watching configuration, the FileSystemObserver should be created in a persistent page, not the service worker
**Validates: Requirements 5.1, 5.2**

Property 11: Observer persistence across restarts
_For any_ enabled file watching configuration, the observer should be recreated after browser restart
**Validates: Requirements 5.3, 8.1-8.10, 18.1-18.10**

Property 12: File change detection
_For any_ file change in a watched directory, the observer should detect it and invoke the watch callback
**Validates: Requirements 5.6, 6.1**

Property 13: Pipeline triggering on file change
_For any_ file change that matches a pipeline's watch configuration, the system should trigger that pipeline's execution
**Validates: Requirements 6.5, 6.6, 6.7**

Property 14: File change debouncing
_For any_ rapid sequence of file changes to the same file, the system should debounce and trigger only once after 500ms of inactivity
**Validates: Requirements 6.10**

Property 15: Observer to service worker communication
_For any_ file change event, the observer page should successfully send a message to the service worker or retry up to 3 times
**Validates: Requirements 7.1-7.10**

Property 16: Service worker message acknowledgment
_For any_ message sent from observer page to service worker, the service worker should acknowledge receipt
**Validates: Requirements 7.2**

Property 17: Message queue on service worker unavailable
_For any_ file change event when the service worker is unavailable, the observer page should queue the event and process it when the service worker becomes available
**Validates: Requirements 7.5, 7.6**

Property 18: Observer reconnection after service worker restart
_For any_ service worker restart, the observer page should detect it and reconnect
**Validates: Requirements 7.8**

Property 19: Node validation before execution
_For any_ node in a pipeline, the system should call validate() before execute() and fail if validation returns errors
**Validates: Requirements 20.1-20.10**

Property 20: Node execution with input
_For any_ node executor, calling execute() with valid input should return output or throw an error
**Validates: Requirements 15.1-15.10**

Property 21: Error catching and logging
_For any_ node execution that throws an error, the system should catch it, log it, and determine if it's retryable
**Validates: Requirements 12.1, 12.2, 12.3, 14.6**

Property 22: Retry on retryable errors
_For any_ node execution that fails with a retryable error, the system should retry up to the configured max attempts
**Validates: Requirements 12.4, 19.1-19.10**

Property 23: No retry on non-retryable errors
_For any_ node execution that fails with a non-retryable error (invalid config, permission denied), the system should not retry
**Validates: Requirements 12.5, 19.6**

Property 24: Pipeline continuation on optional node failure
_For any_ optional node that fails, the pipeline should continue executing subsequent nodes
**Validates: Requirements 12.6**

Property 25: Pipeline stop on required node failure
_For any_ required node that fails after all retries, the pipeline should stop execution
**Validates: Requirements 12.7**

Property 26: Node execution timeout
_For any_ node execution that exceeds its configured timeout, the system should cancel the execution and mark it as failed
**Validates: Requirements 13.1-13.10**

Property 27: Timeout cleanup
_For any_ node execution that times out, the system should call cleanup() to release resources
**Validates: Requirements 13.9**

Property 28: Execution logging completeness
_For any_ node execution, the system should log start, completion/error, duration, input size, and output size
**Validates: Requirements 14.1-14.5**

Property 29: Error logging with stack trace
_For any_ error during execution, the system should log the error message and stack trace
**Validates: Requirements 14.6**

Property 30: Permission request logging
_For any_ permission request, the system should log the request and response
**Validates: Requirements 14.8**

Property 31: Log retention
_For any_ log entry older than 7 days, the system should delete it during cleanup
**Validates: Requirements 14.10**

Property 32: Async operation support
_For any_ executor with async execute() method, the system should properly await the result
**Validates: Requirements 15.1, 15.2**

Property 33: Promise rejection handling
_For any_ async operation that rejects, the system should catch the rejection and handle it as an error
**Validates: Requirements 15.3, 15.9**

Property 34: Async operation cancellation
_For any_ pipeline that is stopped, all pending async operations should be cancelled
**Validates: Requirements 15.7**

Property 35: Resource cleanup after execution
_For any_ node execution (successful or failed), the system should call cleanup() to release resources
**Validates: Requirements 21.1-21.10**

Property 36: Cleanup on pipeline stop
_For any_ pipeline that is stopped, cleanup() should be called on all executed nodes
**Validates: Requirements 21.6, 21.7**

Property 37: Permission denial options
_For any_ permission denial, the system should offer retry, skip, or fail options
**Validates: Requirements 16.1-16.10**

Property 38: Batch permission request
_For any_ pipeline execution requiring multiple file permissions, the system should batch the requests and display them together
**Validates: Requirements 17.1-17.10**

Property 39: Exponential backoff retry delay
_For any_ retry using exponential backoff strategy, the delay should double with each attempt
**Validates: Requirements 19.4**

Property 40: Observer configuration persistence
_For any_ observer configuration change, the system should save it to chrome.storage
**Validates: Requirements 5.4, 5.5**

## Error Handling

### Executor Errors

1. **Missing Executor**: Log error, fail node, provide guidance to implement executor
2. **Validation Error**: Display validation errors, prevent execution, allow fixing config
3. **Execution Error**: Log error with stack trace, determine if retryable, retry or fail
4. **Timeout Error**: Cancel execution, log timeout, call cleanup, mark as failed
5. **Cleanup Error**: Log error, continue with pipeline (don't fail due to cleanup)

### Permission Errors

1. **Permission Denied**: Display options (retry, skip, fail), remember choice
2. **Permission Timeout**: Fail operation, log timeout, allow manual retry
3. **FileHandle Invalid**: Request new permission, update IndexedDB
4. **Options Page Closed**: Reopen options page, retry permission request
5. **Multiple Permission Requests**: Batch requests, display all at once

### File System Errors

1. **File Not Found**: Log error, fail node, suggest checking file path
2. **Disk Full**: Log error, fail node, suggest freeing space
3. **File Locked**: Retry after delay, fail after max attempts
4. **Invalid Path**: Validate path, fail with clear error message
5. **Directory Not Found**: Create directory if configured, otherwise fail

### Observer Errors

1. **Observer Creation Failed**: Log error, disable file watching, notify user
2. **Directory Handle Invalid**: Request new permission, update configuration
3. **Observer Disconnected**: Attempt reconnection, log attempts
4. **Service Worker Unavailable**: Queue messages, retry when available
5. **Message Send Failed**: Retry up to 3 times, log failure

### Communication Errors

1. **Message Timeout**: Retry message, log timeout, fail after max attempts
2. **Service Worker Restart**: Detect restart, reconnect, resend pending messages
3. **Options Page Not Responding**: Reopen page, retry message
4. **Invalid Message Format**: Log error, ignore message, continue
5. **Port Disconnected**: Recreate port, retry message

## Testing Strategy

### Unit Testing Approach

Unit tests will verify individual components:

1. **BaseNodeExecutor Tests**

   - Test validate() returns errors for invalid config
   - Test execute() with valid input returns output
   - Test cleanup() releases resources
   - Test isRetryableError() correctly identifies errors
   - Test timeout handling

2. **PipelineExecutor Tests**

   - Test pipeline validation before execution
   - Test sequential node execution
   - Test parallel node execution
   - Test error handling and retries
   - Test pipeline stop and cleanup

3. **PermissionManager Tests**

   - Test permission caching
   - Test permission request flow
   - Test batch permission requests
   - Test timeout handling
   - Test permission denial handling

4. **FileSystemObserverManager Tests**

   - Mock FileSystemObserver API
   - Test observer creation and configuration
   - Test file change detection
   - Test pipeline matching
   - Test reconnection logic

5. **ExecutionLogger Tests**

   - Test log entry creation
   - Test log filtering
   - Test log retention
   - Test log export
   - Test log size limits

6. **RetryManager Tests**
   - Test retry strategies (none, fixed, exponential)
   - Test retry delay calculation
   - Test max attempts enforcement
   - Test retryable error detection

### Property-Based Testing

Property-based tests will verify universal properties:

1. **Executor Registry Property**

   - Generate random node types
   - Verify executor exists for each
   - Verify executor implements required methods

2. **Permission Flow Property**

   - Generate random permission requests
   - Verify request reaches options page
   - Verify response returns to service worker
   - Verify execution resumes

3. **File Change Detection Property**

   - Generate random file changes
   - Verify observer detects changes
   - Verify correct pipelines triggered
   - Verify debouncing works

4. **Retry Logic Property**

   - Generate random errors
   - Verify retryable errors are retried
   - Verify non-retryable errors are not retried
   - Verify max attempts enforced

5. **Timeout Property**

   - Generate random execution durations
   - Verify timeout cancels long executions
   - Verify cleanup called after timeout

6. **Cleanup Property**

   - Generate random execution scenarios
   - Verify cleanup always called
   - Verify resources released

7. **Logging Property**

   - Generate random execution events
   - Verify all events logged
   - Verify log format correct
   - Verify old logs deleted

8. **Async Operation Property**
   - Generate random async operations
   - Verify proper awaiting
   - Verify error handling
   - Verify cancellation

### Integration Testing

Integration tests will verify end-to-end workflows:

1. **File Append Flow**

   - Create file handle
   - Store in IndexedDB
   - Execute file append node
   - Verify permission requested if needed
   - Verify data appended to file

2. **File Watch Flow**

   - Configure file watching
   - Start observer
   - Modify watched file
   - Verify pipeline triggered
   - Verify file content passed to pipeline

3. **Permission Request Flow**

   - Execute node requiring permission
   - Verify options page opens
   - Verify dialog displays
   - Grant permission
   - Verify execution resumes

4. **Pipeline Execution Flow**

   - Create pipeline with multiple nodes
   - Execute pipeline
   - Verify all nodes execute in order
   - Verify data flows between nodes
   - Verify results logged

5. **Error Recovery Flow**

   - Execute node that fails
   - Verify error logged
   - Verify retry attempted
   - Verify cleanup called
   - Verify pipeline continues or stops appropriately

6. **Observer Reconnection Flow**
   - Start observer
   - Restart browser (simulate)
   - Verify observer recreated
   - Verify watches restored
   - Verify file changes still detected

### Manual Testing

Manual tests for browser-specific features:

1. **File System Access API**

   - Test in Chrome 140+
   - Test permission dialogs
   - Test file handle persistence
   - Test permission revocation

2. **FileSystemObserver**

   - Test file change detection
   - Test recursive watching
   - Test observer lifecycle
   - Test browser restart

3. **Service Worker**

   - Test service worker lifecycle
   - Test message passing
   - Test service worker restart
   - Test background execution

4. **Options Page**
   - Test permission dialog UI
   - Test observer status display
   - Test manual controls
   - Test page lifecycle

## Implementation Notes

### Performance Optimizations

1. **Lazy Executor Loading**

   - Load executors on-demand
   - Cache loaded executors
   - Unload unused executors

2. **Parallel Node Execution**

   - Execute independent nodes in parallel
   - Use Promise.all for parallel execution
   - Limit concurrent executions (max 5)

3. **Log Batching**

   - Batch log writes to IndexedDB
   - Write logs every 5 seconds or 100 entries
   - Reduce IndexedDB transaction overhead

4. **Permission Caching**

   - Cache permission status in memory
   - Persist cache to chrome.storage
   - Invalidate cache after 24 hours

5. **Message Debouncing**
   - Debounce file change events (500ms)
   - Debounce permission requests (100ms)
   - Reduce message passing overhead

### Security Considerations

1. **File Access**

   - Always check permissions before file operations
   - Validate file paths to prevent traversal
   - Limit file size for operations
   - Sanitize file content before processing

2. **Permission Management**

   - Never cache denied permissions
   - Expire permission cache regularly
   - Log all permission requests
   - Require user interaction for permissions

3. **Service Worker Security**

   - Validate all messages from observer page
   - Sanitize pipeline input data
   - Limit execution time per pipeline
   - Prevent infinite loops in pipelines

4. **Data Privacy**
   - Don't log sensitive file content
   - Encrypt logs if they contain user data
   - Clear logs on extension uninstall
   - Respect user privacy settings

### Browser Compatibility

- Target: Chrome 140+ (Manifest V3)
- File System Access API: Chrome 86+
- FileSystemObserver: Chrome 120+ (experimental)
- Service Worker: Chrome 40+
- IndexedDB: Chrome 24+

### Observer Page Strategy

After analysis, the recommended approach is:

**Option B: Create new `/extension/index.html` (hidden background page)**

Reasons:

- Dedicated purpose (file watching)
- Doesn't interfere with options page
- Can remain hidden from user
- Easy to manage lifecycle
- Clear separation of concerns

Implementation:

```html
<!-- /extension/index.html -->
<!DOCTYPE html>
<html>
	<head>
		<title>GhostPipes Observer</title>
		<script type="module" src="/pipelines/services/observer-manager.js"></script>
	</head>
	<body>
		<!-- Hidden page for FileSystemObserver -->
	</body>
</html>
```

Manifest configuration:

```json
{
	"background": {
		"service_worker": "background/service-worker.js"
	},
	"action": {
		"default_popup": "index.html"
	}
}
```

### Code Organization

```
extension/
├── background/
│   ├── service-worker.js
│   └── execution/
│       ├── pipeline-executor.js (new)
│       ├── retry-manager.js (new)
│       ├── permission-manager.js (new)
│       ├── execution-logger.js (new)
│       ├── base-node-executor.js (new)
│       ├── node-executor-registry.js (new)
│       └── executors/
│           ├── input/
│           │   ├── manual-input-executor.js
│           │   ├── http-request-executor.js
│           │   ├── webhook-executor.js
│           │   ├── scheduled-executor.js
│           │   └── file-watch-executor.js
│           ├── processing/
│           │   ├── filter-executor.js
│           │   ├── transform-executor.js
│           │   ├── parse-executor.js
│           │   └── ... (other processing executors)
│           └── output/
│               ├── download-executor.js
│               ├── file-append-executor.js (new)
│               ├── drive-upload-executor.js
│               ├── sheet-export-executor.js
│               └── ... (other output executors)
├── pipelines/
│   └── services/
│       ├── observer-manager.js (new)
│       └── service-worker-communicator.js (new)
├── options/
│   ├── index.html
│   ├── index.js
│   └── components/
│       └── permission-dialog.js (new)
├── index.html (new - observer page)
└── db/
    └── filehandle-db.js (existing)
```

## UI Design

### Permission Dialog Layout

```
┌─────────────────────────────────────────────┐
│ 🔏 Permission Required                [×]  │
├─────────────────────────────────────────────┤
│                                             │
│  Permission required to write to:           │
│                                             │
│  📄 sales-data.csv                          │
│                                             │
│  This file is used by the pipeline:         │
│  "Daily Sales Report"                       │
│                                             │
│  [Grant Permission]  [Deny]                 │
│                                             │
└─────────────────────────────────────────────┘
```

### Batch Permission Dialog Layout

```
┌─────────────────────────────────────────────┐
│ 🔏 Multiple Permissions Required      [×]  │
├─────────────────────────────────────────────┤
│                                             │
│  The pipeline needs access to 3 files:      │
│                                             │
│  ☐ 📄 sales-data.csv                        │
│  ☐ 📄 inventory.json                        │
│  ☐ 📄 customers.txt                         │
│                                             │
│  [Grant All]  [Grant Selected]  [Deny All] │
│                                             │
└─────────────────────────────────────────────┘
```

### Observer Status Display (in Options Page)

```
┌─────────────────────────────────────────────┐
│ File Watching Status                        │
├─────────────────────────────────────────────┤
│                                             │
│  Status: ● Active                           │
│  Watching: 2 directories                    │
│  Pipelines: 3 configured                    │
│                                             │
│  Recent Activity:                           │
│  • sales-data.csv modified (2 min ago)      │
│  • inventory.json modified (5 min ago)      │
│                                             │
│  [Restart Observer]  [Disable Watching]     │
│                                             │
└─────────────────────────────────────────────┘
```

## Dependencies

### Existing Dependencies

- IndexedDB (for file handle storage)
- chrome.storage (for configuration persistence)
- chrome.runtime (for message passing)
- File System Access API (for file operations)

### New Dependencies

- FileSystemObserver API (for file watching)

### Browser APIs Used

- File System Access API
- FileSystemObserver API
- chrome.runtime.sendMessage
- chrome.runtime.onMessage
- chrome.storage.local
- chrome.windows.create
- IndexedDB
- AbortController (for cancellation)
- Promise (for async operations)

## Migration Strategy

1. **Phase 1**: Implement base executor framework and registry
2. **Phase 2**: Audit existing executors and identify missing ones
3. **Phase 3**: Implement missing input node executors
4. **Phase 4**: Implement missing processing node executors
5. **Phase 5**: Implement missing output node executors
6. **Phase 6**: Implement permission management system
7. **Phase 7**: Implement file append executor with permissions
8. **Phase 8**: Create observer page and FileSystemObserver manager
9. **Phase 9**: Implement observer to service worker communication
10. **Phase 10**: Implement error handling and retry logic
11. **Phase 11**: Implement execution logging
12. **Phase 12**: Add comprehensive testing
13. **Phase 13**: Performance optimization and cleanup

## Future Enhancements

1. **Advanced Retry Strategies**: Jitter, circuit breaker, adaptive retry
2. **Execution Metrics**: Track performance, success rates, bottlenecks
3. **Distributed Execution**: Execute nodes across multiple service workers
4. **Execution Visualization**: Real-time execution graph visualization
5. **Debugging Tools**: Step-through execution, breakpoints, variable inspection
6. **Execution Replay**: Replay failed executions with same inputs
7. **Conditional Execution**: Execute nodes based on conditions
8. **Dynamic Pipeline Modification**: Modify pipeline during execution
9. **Execution Scheduling**: Schedule pipeline execution at specific times
10. **Resource Limits**: Limit CPU, memory, network usage per pipeline
11. **Execution Priorities**: Prioritize critical pipelines
12. **Execution Queuing**: Queue pipelines when resources limited
13. **Execution Monitoring**: Real-time monitoring dashboard
14. **Execution Alerts**: Alert on failures, slow execution, resource issues
15. **Execution Analytics**: Analyze execution patterns, optimize pipelines
