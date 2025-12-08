# Implementation Plan

- [ ] 1. Create base executor framework

  - Implement BaseNodeExecutor class with validate(), execute(), cleanup() methods
  - Implement NodeExecutorRegistry for registering and retrieving executors
  - Define ExecutorMetadata structure
  - Create RetryStrategy and ExecutionContext models
  - _Requirements: 1.4, 1.5, 20.1-20.10, 21.1-21.10_

- [ ]\* 1.1 Write property test for executor interface compliance

  - **Property 2: Executor interface compliance**
  - **Validates: Requirements 1.5, 20.1-20.10, 21.1-21.10**

- [ ] 2. Implement executor audit system

  - Create audit script to scan configs and executors directories
  - Implement ExecutorAuditReport generation
  - Generate markdown report with missing/incomplete executors
  - Categorize nodes by type (input, processing, output)
  - _Requirements: 1.1-1.10_

- [ ]\* 2.1 Write property test for executor registry completeness

  - **Property 1: Executor registry completeness**
  - **Validates: Requirements 1.4, 1.5, 9.1-11.10**

- [ ] 3. Implement PipelineExecutor

  - Create PipelineExecutor class with execute() method
  - Implement pipeline validation before execution
  - Implement sequential node execution
  - Implement parallel node execution for independent nodes
  - Integrate with NodeExecutorRegistry
  - _Requirements: 15.1-15.10_

- [ ]\* 3.1 Write property test for node validation before execution

  - **Property 19: Node validation before execution**
  - **Validates: Requirements 20.1-20.10**

- [ ]\* 3.2 Write property test for node execution

  - **Property 20: Node execution with input**
  - **Validates: Requirements 15.1-15.10**

- [ ] 4. Implement RetryManager

  - Create RetryManager class with retry strategies (none, fixed, exponential)
  - Implement retry delay calculation
  - Implement max attempts enforcement
  - Implement retryable error detection
  - _Requirements: 12.1-12.10, 19.1-19.10_

- [ ]\* 4.1 Write property tests for retry logic

  - **Property 22: Retry on retryable errors**
  - **Property 23: No retry on non-retryable errors**
  - **Property 39: Exponential backoff retry delay**
  - **Validates: Requirements 12.4, 12.5, 19.1-19.10**

- [ ] 5. Implement error handling in PipelineExecutor

  - Implement error catching and logging
  - Integrate RetryManager for retryable errors
  - Implement pipeline continuation on optional node failure
  - Implement pipeline stop on required node failure
  - _Requirements: 12.1-12.10_

- [ ]\* 5.1 Write property tests for error handling

  - **Property 21: Error catching and logging**
  - **Property 24: Pipeline continuation on optional node failure**
  - **Property 25: Pipeline stop on required node failure**
  - **Validates: Requirements 12.1-12.7**

- [ ] 6. Implement node execution timeout

  - Add timeout configuration to BaseNodeExecutor
  - Implement timeout enforcement using AbortController
  - Implement timeout cleanup
  - Add timeout logging
  - _Requirements: 13.1-13.10_

- [ ]\* 6.1 Write property tests for timeout

  - **Property 26: Node execution timeout**
  - **Property 27: Timeout cleanup**
  - **Validates: Requirements 13.1-13.10**

- [ ] 7. Implement ExecutionLogger

  - Create ExecutionLogger class
  - Implement log entry creation for all execution events
  - Implement log filtering by pipeline, node type, severity
  - Implement log persistence to IndexedDB
  - Implement log retention (7-day cleanup)
  - Implement log export (JSON, CSV)
  - _Requirements: 14.1-14.10_

- [ ]\* 7.1 Write property tests for logging

  - **Property 28: Execution logging completeness**
  - **Property 29: Error logging with stack trace**
  - **Property 31: Log retention**
  - **Validates: Requirements 14.1-14.10**

- [ ] 8. Implement PermissionManager

  - Create PermissionManager class
  - Implement permission caching in memory and chrome.storage
  - Implement permission request queue
  - Implement sendPermissionRequest to options page
  - Implement batch permission requests
  - _Requirements: 3.1-3.10, 16.1-16.10, 17.1-17.10_

- [ ]\* 8.1 Write property tests for permission management

  - **Property 5: Permission request on denial**
  - **Property 7: Permission response handling**
  - **Property 8: Permission request timeout**
  - **Property 30: Permission request logging**
  - **Property 37: Permission denial options**
  - **Property 38: Batch permission request**
  - **Validates: Requirements 2.3, 3.1-3.10, 14.8, 16.1-16.10, 17.1-17.10**

- [ ] 9. Create permission dialog component

  - Create PermissionDialog web component extending HTMLDialogElement
  - Implement dialog display with filename
  - Implement grant/deny button handlers
  - Implement File System Access API permission request
  - Add dialog styling
  - _Requirements: 3.3-3.9_

- [ ]\* 9.1 Write property test for permission dialog

  - **Property 6: Permission dialog display**
  - **Validates: Requirements 3.3, 3.4, 3.5**

- [ ] 10. Implement options page message handler

  - Add chrome.runtime.onMessage listener to options page
  - Handle "requestPermission" command
  - Retrieve fileHandle from IndexedDB
  - Display permission dialog
  - Send response back to service worker
  - Handle errors during permission request
  - _Requirements: 4.1-4.10_

- [ ]\* 10.1 Write property test for message handling

  - **Property 9: Options page message handling**
  - **Validates: Requirements 4.1-4.10**

- [ ] 11. Implement FileAppendExecutor

  - Create FileAppendExecutor extending BaseNodeExecutor
  - Implement getFileHandle from IndexedDB
  - Implement checkPermission for write access
  - Implement requestPermission via PermissionManager
  - Implement appendToFile with data formatting
  - Implement error handling for file operations
  - _Requirements: 2.1-2.10_

- [ ]\* 11.1 Write property tests for file append

  - **Property 3: File handle retrieval**
  - **Property 4: Permission check before file write**
  - **Validates: Requirements 2.1, 2.2**

- [ ] 12. Create observer page (index.html)

  - Create /extension/index.html as hidden background page
  - Add script tag for observer-manager.js
  - Configure manifest to reference observer page
  - _Requirements: 5.1-5.3_

- [ ] 13. Implement FileSystemObserverManager

  - Create FileSystemObserverManager class
  - Implement observer creation and configuration
  - Implement addWatch and removeWatch methods
  - Implement handleFileChange callback
  - Implement findMatchingPipelines logic
  - Implement configuration persistence to chrome.storage
  - _Requirements: 5.1-5.10, 6.1-6.10_

- [ ]\* 13.1 Write property tests for observer

  - **Property 10: FileSystemObserver in persistent page**
  - **Property 12: File change detection**
  - **Property 13: Pipeline triggering on file change**
  - **Property 14: File change debouncing**
  - **Property 40: Observer configuration persistence**
  - **Validates: Requirements 5.1, 5.2, 5.4, 5.5, 5.6, 6.1, 6.5, 6.6, 6.7, 6.10**

- [ ] 14. Implement ServiceWorkerCommunicator

  - Create ServiceWorkerCommunicator class
  - Implement sendMessage with chrome.runtime.sendMessage
  - Implement sendWithRetry (up to 3 attempts)
  - Implement message queue for when service worker unavailable
  - Implement processQueue when service worker becomes available
  - Implement service worker status checking
  - _Requirements: 7.1-7.10_

- [ ]\* 14.1 Write property tests for communication

  - **Property 15: Observer to service worker communication**
  - **Property 16: Service worker message acknowledgment**
  - **Property 17: Message queue on service worker unavailable**
  - **Property 18: Observer reconnection after service worker restart**
  - **Validates: Requirements 7.1-7.10**

- [ ] 15. Implement observer lifecycle management

  - Implement observer page auto-open on browser start if watching enabled
  - Implement observer page auto-reopen if closed
  - Implement observer status persistence in chrome.storage
  - Implement observer configuration restoration on page reload
  - Add observer status display in options page
  - _Requirements: 8.1-8.10_

- [ ] 16. Implement observer reconnection after restart

  - Implement browser restart detection
  - Implement observer configuration retrieval from chrome.storage
  - Implement FileSystemObserver recreation
  - Implement directory handle validation
  - Implement permission re-request for invalid handles
  - Add reconnection logging and user notifications
  - _Requirements: 18.1-18.10_

- [ ]\* 16.1 Write property test for observer persistence

  - **Property 11: Observer persistence across restarts**
  - **Validates: Requirements 5.3, 8.1-8.10, 18.1-18.10**

- [ ] 17. Implement missing input node executors

  - Implement ManualInputExecutor
  - Implement HttpRequestExecutor
  - Implement WebhookExecutor
  - Implement ScheduledExecutor
  - Implement FileWatchExecutor
  - Implement ExtensionDataExecutor
  - Implement ClipboardExecutor
  - Implement StorageExecutor
  - Register all executors in NodeExecutorRegistry
  - _Requirements: 9.1-9.10_

- [ ] 18. Implement missing processing node executors

  - Implement FilterExecutor
  - Implement TransformExecutor
  - Implement ParseExecutor (JSON, CSV, XML)
  - Implement FormatExecutor
  - Implement AggregateExecutor
  - Implement SortExecutor
  - Implement DeduplicateExecutor
  - Implement MergeExecutor
  - Implement SplitExecutor
  - Implement AIProcessingExecutor
  - Register all executors in NodeExecutorRegistry
  - _Requirements: 10.1-10.10_

- [ ] 19. Implement missing output node executors

  - Implement DownloadExecutor
  - Implement DriveUploadExecutor
  - Implement SheetExportExecutor
  - Implement EmailExecutor
  - Implement WebhookOutputExecutor
  - Implement NotificationExecutor
  - Implement StorageOutputExecutor
  - Register all executors in NodeExecutorRegistry
  - _Requirements: 11.1-11.10_

- [ ] 20. Implement resource cleanup

  - Ensure cleanup() called after every node execution
  - Ensure cleanup() called on pipeline stop
  - Ensure cleanup() called even when execution fails
  - Implement resource tracking per pipeline
  - Implement force cleanup after timeout
  - Add cleanup logging
  - _Requirements: 21.1-21.10_

- [ ]\* 20.1 Write property tests for cleanup

  - **Property 35: Resource cleanup after execution**
  - **Property 36: Cleanup on pipeline stop**
  - **Validates: Requirements 21.1-21.10**

- [ ] 21. Implement async operation support

  - Ensure all executors properly use async/await
  - Implement Promise rejection handling
  - Implement async operation cancellation on pipeline stop
  - Implement async timeout handling
  - Add async operation timing logs
  - _Requirements: 15.1-15.10_

- [ ]\* 21.1 Write property tests for async operations

  - **Property 32: Async operation support**
  - **Property 33: Promise rejection handling**
  - **Property 34: Async operation cancellation**
  - **Validates: Requirements 15.1-15.10**

- [ ] 22. Add comprehensive error messages

  - Add detailed error messages for all error types
  - Add troubleshooting guidance for common errors
  - Add error codes for categorization
  - Add error context (node ID, pipeline ID, timestamp)
  - _Requirements: 12.8_

- [ ] 23. Implement performance optimizations

  - Implement lazy executor loading
  - Implement parallel node execution (max 5 concurrent)
  - Implement log batching (every 5 seconds or 100 entries)
  - Implement permission caching with 24-hour expiration
  - Implement message debouncing (file changes: 500ms, permissions: 100ms)
  - _Requirements: Performance considerations_

- [ ] 24. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 25. Create executor documentation

  - Document BaseNodeExecutor interface
  - Document how to create new executors
  - Document retry strategies
  - Document timeout configuration
  - Document error handling patterns
  - Provide executor examples

- [ ] 26. Create user documentation

  - Document file permission flow
  - Document file watching setup
  - Document observer status monitoring
  - Document troubleshooting common issues
  - Create example pipelines using new executors

- [ ] 27. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
