# Requirements Document

## Introduction

This document specifies the requirements for updating the GhostPipes node execution engine to ensure all node types execute correctly in the background service worker. The feature includes implementing missing node executors, handling file system permissions, implementing file watching with FileSystemObserver, and ensuring robust error handling and retry logic. The implementation must work within the constraints of Chrome extension Manifest V3, where service workers have limited capabilities compared to persistent background pages.

## Glossary

- **Service Worker**: Background script in Chrome extension that handles events and executes pipelines
- **Node Executor**: Code that executes a specific node type's logic
- **FileHandle**: Reference to a file obtained via File System Access API
- **File System Access API**: Browser API for reading/writing files with user permission
- **FileSystemObserver**: API for watching file system changes (not available in service workers)
- **Permission Request**: Process of asking user to grant file write permission
- **Options Page**: Extension settings page that can display UI and run persistent code
- **Observer Page**: Persistent page that runs FileSystemObserver
- **Pipeline Execution**: Running a complete pipeline from input to output nodes
- **Node Timeout**: Maximum time allowed for a node to execute
- **Execution Retry**: Attempting to execute a failed node again

## Requirements

### Requirement 1: Node Executor Audit and Inventory

**User Story:** As a developer, I want a complete inventory of all node types and their executors, so that I can identify missing or incomplete implementations.

#### Acceptance Criteria

1. THE system SHALL scan all config files in `/extension/pipelines/models/configs/` directory
2. THE system SHALL scan all executor files in `/extension/background/execution/` directory
3. THE system SHALL generate a report listing all node types
4. THE system SHALL identify node types without corresponding executors
5. THE system SHALL identify executors with incomplete implementations
6. THE system SHALL categorize nodes by type (input, processing, output)
7. THE system SHALL list required methods for each executor (execute, validate, cleanup)
8. THE system SHALL identify nodes requiring special permissions (file system, network)
9. THE system SHALL document dependencies between node types
10. THE system SHALL output the audit report in markdown format

### Requirement 2: File Append Node Execution

**User Story:** As a pipeline designer, I want to append data to files, so that I can accumulate results over multiple pipeline runs.

#### Acceptance Criteria

1. WHEN executing a file append node THEN the system SHALL retrieve the fileHandle from IndexedDB using getFileHandleById
2. THE system SHALL check if the fileHandle has write permission
3. WHEN write permission is denied THEN the system SHALL request permission from the user
4. THE system SHALL open the file for writing in append mode
5. THE system SHALL write the data to the end of the file
6. THE system SHALL close the file after writing
7. THE system SHALL handle file not found errors gracefully
8. THE system SHALL handle permission denied errors by requesting permission
9. THE system SHALL handle disk full errors with appropriate error messages
10. THE system SHALL log all file operations for debugging

### Requirement 3: File Permission Request Flow

**User Story:** As a user, I want to grant file permissions when needed, so that pipelines can write to my files.

#### Acceptance Criteria

1. WHEN file write permission is needed THEN the service worker SHALL send a message to the options page
2. WHEN the options page is not open THEN the system SHALL open it automatically
3. THE options page SHALL display a permission dialog with the filename
4. THE dialog SHALL show a clear message explaining why permission is needed
5. THE dialog SHALL provide a "Grant Permission" button
6. WHEN the user clicks "Grant Permission" THEN the system SHALL request file permission via File System Access API
7. WHEN permission is granted THEN the system SHALL send success message to service worker
8. WHEN permission is denied THEN the system SHALL send failure message to service worker
9. THE service worker SHALL resume pipeline execution after receiving permission
10. THE system SHALL handle permission request timeouts (30 seconds)

### Requirement 4: Permission Request Message Handling

**User Story:** As a developer, I want robust message handling between service worker and options page, so that permission requests work reliably.

#### Acceptance Criteria

1. THE options page SHALL register a chrome.runtime.onMessage listener
2. THE listener SHALL handle "requestPermission" command
3. THE listener SHALL extract fileHandleId from the message
4. THE listener SHALL retrieve the fileHandle from IndexedDB
5. THE listener SHALL display the permission dialog with filename
6. THE listener SHALL request permission when user clicks the button
7. THE listener SHALL send response back to service worker with permission result
8. THE listener SHALL handle errors during permission request
9. THE listener SHALL close the dialog after permission is granted or denied
10. THE listener SHALL log all permission request events

### Requirement 5: FileSystemObserver Implementation Strategy

**User Story:** As a developer, I want to watch file system changes, so that pipelines can be triggered automatically when files change.

#### Acceptance Criteria

1. THE system SHALL implement FileSystemObserver in a persistent page (not service worker)
2. THE system SHALL choose between options page, dedicated index.html, or pipelines/index.html
3. THE chosen page SHALL remain open or be reopened after browser restart
4. THE observer page SHALL create a FileSystemObserver instance
5. THE observer SHALL watch specified directories recursively
6. THE observer SHALL detect file additions, modifications, and deletions
7. THE observer SHALL send file change events to the service worker
8. THE service worker SHALL trigger pipeline execution on file changes
9. THE system SHALL handle observer disconnection and reconnection
10. THE system SHALL persist observer configuration across browser restarts

### Requirement 6: FileSystemObserver Watch Callback

**User Story:** As a pipeline designer, I want pipelines to trigger when watched files change, so that I can automate data processing.

#### Acceptance Criteria

1. WHEN a file change is detected THEN the observer SHALL invoke the watch callback
2. THE callback SHALL receive an array of change records
3. THE callback SHALL extract file paths from change records
4. THE callback SHALL determine the type of change (added, modified, deleted)
5. THE callback SHALL find pipelines configured to watch the changed file
6. THE callback SHALL send a message to the service worker with pipeline IDs and file info
7. THE service worker SHALL execute the matching pipelines
8. THE system SHALL pass the file content as input to the pipeline
9. THE system SHALL handle multiple simultaneous file changes
10. THE system SHALL debounce rapid file changes (wait 500ms after last change)

### Requirement 7: Observer Page Communication

**User Story:** As a developer, I want reliable communication between observer page and service worker, so that file change events are not lost.

#### Acceptance Criteria

1. THE observer page SHALL establish a message port with the service worker
2. THE observer page SHALL send file change events via chrome.runtime.sendMessage
3. THE service worker SHALL acknowledge receipt of file change events
4. WHEN the service worker doesn't respond THEN the observer page SHALL retry up to 3 times
5. THE observer page SHALL queue file change events if service worker is unavailable
6. THE observer page SHALL process the queue when service worker becomes available
7. THE system SHALL handle service worker restarts gracefully
8. THE system SHALL reconnect the observer after service worker restart
9. THE system SHALL log all communication events for debugging
10. THE system SHALL handle message passing errors with appropriate retries

### Requirement 8: Observer Page Lifecycle Management

**User Story:** As a user, I want the observer page to work reliably without manual intervention, so that file watching is seamless.

#### Acceptance Criteria

1. WHEN the browser starts THEN the system SHALL open the observer page if file watching is enabled
2. THE observer page SHALL remain open in the background (hidden)
3. WHEN the observer page is closed THEN the system SHALL reopen it automatically
4. THE system SHALL persist observer page state in chrome.storage
5. THE system SHALL restore observer configuration on page reload
6. THE system SHALL handle browser crashes and restarts
7. THE system SHALL provide a way to disable file watching
8. WHEN file watching is disabled THEN the system SHALL close the observer page
9. THE system SHALL show observer status in the options page
10. THE system SHALL allow users to manually restart the observer

### Requirement 9: Missing Input Node Executors

**User Story:** As a pipeline designer, I want all input node types to execute correctly, so that I can use any data source.

#### Acceptance Criteria

1. THE system SHALL implement executor for manual input node
2. THE system SHALL implement executor for HTTP request node
3. THE system SHALL implement executor for webhook node
4. THE system SHALL implement executor for scheduled trigger node
5. THE system SHALL implement executor for file watch node
6. THE system SHALL implement executor for extension data node
7. THE system SHALL implement executor for clipboard node
8. THE system SHALL implement executor for storage node
9. WHEN executing an input node THEN the executor SHALL return data in standard format
10. THE system SHALL handle input node errors without crashing the pipeline

### Requirement 10: Missing Processing Node Executors

**User Story:** As a pipeline designer, I want all processing node types to execute correctly, so that I can transform data as needed.

#### Acceptance Criteria

1. THE system SHALL implement executor for filter node
2. THE system SHALL implement executor for transform node
3. THE system SHALL implement executor for parse node (JSON, CSV, XML)
4. THE system SHALL implement executor for format node
5. THE system SHALL implement executor for aggregate node
6. THE system SHALL implement executor for sort node
7. THE system SHALL implement executor for deduplicate node
8. THE system SHALL implement executor for merge node
9. THE system SHALL implement executor for split node
10. THE system SHALL implement executor for AI processing node

### Requirement 11: Missing Output Node Executors

**User Story:** As a pipeline designer, I want all output node types to execute correctly, so that I can export data to any destination.

#### Acceptance Criteria

1. THE system SHALL implement executor for download node
2. THE system SHALL implement executor for file append node
3. THE system SHALL implement executor for drive upload node
4. THE system SHALL implement executor for sheet export node
5. THE system SHALL implement executor for email node
6. THE system SHALL implement executor for webhook output node
7. THE system SHALL implement executor for notification node
8. THE system SHALL implement executor for storage node
9. WHEN executing an output node THEN the executor SHALL confirm successful output
10. THE system SHALL handle output node errors gracefully

### Requirement 12: Node Executor Error Handling

**User Story:** As a pipeline designer, I want robust error handling, so that one failed node doesn't break the entire pipeline.

#### Acceptance Criteria

1. WHEN a node execution fails THEN the system SHALL catch the error
2. THE system SHALL log the error with node ID, type, and error message
3. THE system SHALL determine if the error is retryable
4. WHEN the error is retryable THEN the system SHALL retry up to 3 times
5. WHEN the error is not retryable THEN the system SHALL mark the node as failed
6. THE system SHALL continue pipeline execution if the node is optional
7. THE system SHALL stop pipeline execution if the node is required
8. THE system SHALL provide detailed error messages for debugging
9. THE system SHALL track error counts per node type
10. THE system SHALL notify users of persistent errors

### Requirement 13: Node Execution Timeout

**User Story:** As a system administrator, I want node execution timeouts, so that stuck nodes don't block pipelines indefinitely.

#### Acceptance Criteria

1. THE system SHALL set a default timeout of 30 seconds for all nodes
2. THE system SHALL allow configuring custom timeouts per node type
3. WHEN a node execution exceeds the timeout THEN the system SHALL cancel the execution
4. THE system SHALL log timeout errors with node details
5. THE system SHALL mark timed-out nodes as failed
6. THE system SHALL allow retrying timed-out nodes
7. THE system SHALL provide timeout configuration in node settings
8. THE system SHALL handle timeout for async operations correctly
9. THE system SHALL clean up resources after timeout
10. THE system SHALL notify users of timeout errors

### Requirement 14: Node Execution Logging

**User Story:** As a developer, I want comprehensive execution logging, so that I can debug pipeline issues.

#### Acceptance Criteria

1. THE system SHALL log the start of each node execution
2. THE system SHALL log the completion of each node execution
3. THE system SHALL log execution duration for each node
4. THE system SHALL log input data size for each node
5. THE system SHALL log output data size for each node
6. THE system SHALL log all errors with stack traces
7. THE system SHALL log retry attempts
8. THE system SHALL log permission requests
9. THE system SHALL provide log filtering by pipeline, node type, and severity
10. THE system SHALL persist logs in IndexedDB with 7-day retention

### Requirement 15: Async Operation Support

**User Story:** As a developer, I want proper async/await support in executors, so that asynchronous operations work correctly.

#### Acceptance Criteria

1. THE system SHALL support async execute methods in all executors
2. THE system SHALL properly await all async operations
3. THE system SHALL handle Promise rejections gracefully
4. THE system SHALL support parallel execution of independent nodes
5. THE system SHALL support sequential execution of dependent nodes
6. THE system SHALL handle async timeouts correctly
7. THE system SHALL cancel pending async operations when pipeline is stopped
8. THE system SHALL clean up resources after async operations complete
9. THE system SHALL handle async errors without crashing the service worker
10. THE system SHALL log async operation timing for performance monitoring

### Requirement 16: Permission Denial Handling

**User Story:** As a user, I want clear options when I deny permissions, so that I understand the consequences.

#### Acceptance Criteria

1. WHEN a user denies file permission THEN the system SHALL display the consequences
2. THE system SHALL offer to retry the permission request
3. THE system SHALL offer to skip the node and continue the pipeline
4. THE system SHALL offer to fail the pipeline
5. THE system SHALL remember the user's choice for future executions
6. THE system SHALL allow changing the permission choice in settings
7. THE system SHALL show which pipelines are affected by denied permissions
8. THE system SHALL provide a way to grant permissions later
9. THE system SHALL handle partial permissions (read but not write)
10. THE system SHALL log all permission denial events

### Requirement 17: Batch Permission Requests

**User Story:** As a user, I want to grant multiple permissions at once, so that I don't have to approve each one individually.

#### Acceptance Criteria

1. WHEN multiple nodes need permissions THEN the system SHALL batch the requests
2. THE system SHALL display a list of all files needing permission
3. THE system SHALL provide a "Grant All" button
4. THE system SHALL provide individual grant buttons for each file
5. THE system SHALL track which permissions were granted
6. THE system SHALL resume pipeline execution after all permissions are granted
7. THE system SHALL handle partial grants (some approved, some denied)
8. THE system SHALL timeout batch requests after 60 seconds
9. THE system SHALL allow canceling the batch request
10. THE system SHALL persist granted permissions for future use

### Requirement 18: Observer Reconnection After Restart

**User Story:** As a user, I want file watching to resume after browser restart, so that I don't have to reconfigure it.

#### Acceptance Criteria

1. WHEN the browser restarts THEN the system SHALL check if file watching was enabled
2. THE system SHALL retrieve observer configuration from chrome.storage
3. THE system SHALL reopen the observer page
4. THE system SHALL recreate FileSystemObserver instances
5. THE system SHALL restore all watched directories
6. THE system SHALL verify directory handles are still valid
7. WHEN a directory handle is invalid THEN the system SHALL request permission again
8. THE system SHALL notify users if observer reconnection fails
9. THE system SHALL log all reconnection attempts
10. THE system SHALL provide manual reconnection option in settings

### Requirement 19: Execution Retry Strategy

**User Story:** As a pipeline designer, I want configurable retry strategies, so that transient failures don't break pipelines.

#### Acceptance Criteria

1. THE system SHALL support retry strategies: none, fixed, exponential backoff
2. THE system SHALL allow configuring max retry attempts (default 3)
3. THE system SHALL allow configuring retry delay (default 1 second)
4. WHEN using exponential backoff THEN the system SHALL double the delay each retry
5. THE system SHALL retry only on retryable errors (network, timeout, rate limit)
6. THE system SHALL not retry on permanent errors (invalid config, permission denied)
7. THE system SHALL log each retry attempt with attempt number
8. THE system SHALL track retry success rate per node type
9. THE system SHALL allow disabling retries per node
10. THE system SHALL provide retry configuration in node settings

### Requirement 20: Node Executor Validation

**User Story:** As a developer, I want to validate node configurations before execution, so that invalid configs are caught early.

#### Acceptance Criteria

1. THE system SHALL call validate() method on each executor before execution
2. THE validate() method SHALL check all required configuration fields
3. THE validate() method SHALL check field types and formats
4. THE validate() method SHALL check for missing dependencies
5. THE validate() method SHALL return an array of validation errors
6. WHEN validation fails THEN the system SHALL not execute the node
7. THE system SHALL display validation errors to the user
8. THE system SHALL allow fixing validation errors and retrying
9. THE system SHALL validate the entire pipeline before starting execution
10. THE system SHALL cache validation results to avoid redundant checks

### Requirement 21: Resource Cleanup

**User Story:** As a system administrator, I want proper resource cleanup, so that the extension doesn't leak memory or file handles.

#### Acceptance Criteria

1. THE system SHALL call cleanup() method on each executor after execution
2. THE cleanup() method SHALL close all open file handles
3. THE cleanup() method SHALL cancel pending network requests
4. THE cleanup() method SHALL clear temporary data
5. THE cleanup() method SHALL remove event listeners
6. THE system SHALL call cleanup() even when execution fails
7. THE system SHALL call cleanup() when pipeline is stopped
8. THE system SHALL track open resources per pipeline
9. THE system SHALL force cleanup after timeout
10. THE system SHALL log cleanup operations for debugging
