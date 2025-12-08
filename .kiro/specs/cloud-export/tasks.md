# Implementation Plan

- [x] 1. Set up configuration models and enums

  - Create DriveUploadConfig and SheetExportConfig classes with validation
  - Define provider enums (DriveProvider, SheetProvider)
  - Define format and operation enums (FileFormat, ConflictResolution, SheetOperation)
  - Implement serialization/deserialization methods
  - _Requirements: 1.1-1.10, 2.1-2.10_

- [ ]\* 1.1 Write property test for configuration round-trip

  - **Property 1: Configuration serialization round-trip**
  - **Validates: Requirements 1.9, 1.10, 2.9, 2.10**

- [ ]\* 1.2 Write property tests for configuration validation

  - **Property 2: Provider validation**
  - **Property 3: Required field validation**
  - **Validates: Requirements 1.5, 1.6, 2.5, 2.6**

- [ ]\* 1.3 Write property tests for configuration methods

  - **Property 4: API endpoint generation**
  - **Property 5: Configuration summary generation**
  - **Validates: Requirements 1.7, 1.8, 2.7, 2.8**

<!-- - [ ] 2. Implement OAuth service and token management

  - Create OAuthService class with OAuth flow methods
  - Implement state token generation and validation for CSRF protection
  - Implement token storage and retrieval methods
  - Create backend API endpoints for token operations
  - Implement token encryption/decryption using AES-256
  - _Requirements: 5.1-5.10, 6.1-6.10, 13.1-13.10_ -->

<!-- - [ ]\* 2.1 Write property tests for OAuth flow

  - **Property 11: OAuth authorization code extraction**
  - **Property 12: OAuth state validation**
  - **Validates: Requirements 5.4, 14.2, 14.4**

- [ ]\* 2.2 Write property tests for token management

  - **Property 13: Token storage and retrieval**
  - **Property 14: Token encryption**
  - **Property 15: Account disconnection cleanup**
  - **Validates: Requirements 5.6, 5.7, 5.10, 6.1, 6.2, 13.4, 13.5, 13.8**

- [ ]\* 2.3 Write property test for automatic token refresh

  - **Property 9: Automatic token refresh**
  - **Validates: Requirements 3.9, 4.10, 6.3, 6.4, 6.6**

- [ ] 3. Create provider adapters for cloud storage

  - Implement GoogleDriveAdapter with Drive API v3 integration
  - Implement OneDriveAdapter with OneDrive API v1.0 integration
  - Implement DropboxAdapter with Dropbox API v2 integration
  - Implement BoxAdapter with Box API v2.0 integration
  - Each adapter should implement uploadFile, createFolder, listFolders, getFileMetadata, deleteFile
  - _Requirements: 3.1-3.10_ -->

- [ ]\* 3.1 Write property test for drive provider compatibility

  - **Property 6: Drive API handler provider compatibility**
  - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6**

- [ ] 4. Create provider adapters for spreadsheets

  - Implement GoogleSheetsAdapter with Sheets API v4 integration
  - Implement SmartsheetAdapter with Smartsheet API v2.0 integration
  - Implement AirtableAdapter with Airtable API v0 integration
  - Each adapter should implement createSheet, appendRows, replaceData, insertRows, listSheets, getSheetMetadata
  - _Requirements: 4.1-4.10_

- [ ]\* 4.1 Write property test for sheet provider compatibility

  - **Property 7: Sheet API handler provider compatibility**
  - **Validates: Requirements 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**

- [ ] 5. Implement unified API handlers

  - Create DriveApiHandler class that uses provider adapters
  - Create SheetApiHandler class that uses provider adapters
  - Implement token inclusion in all API requests
  - Implement automatic token refresh on expiration
  - Implement rate limit handling with exponential backoff
  - _Requirements: 3.1-3.10, 4.1-4.10_

- [ ]\* 5.1 Write property test for OAuth token inclusion

  - **Property 8: OAuth token inclusion**
  - **Validates: Requirements 3.8, 4.9**

- [ ]\* 5.2 Write property test for rate limit handling

  - **Property 10: Rate limit handling with exponential backoff**
  - **Validates: Requirements 3.10, 10.10, 15.3**

- [ ]\* 5.3 Write property test for API retry logic

  - **Property 35: API retry with exponential backoff**
  - **Validates: Requirements 15.2**

- [ ] 6. Implement file upload functionality

  - Implement file format conversion (JSON, CSV, XML, TXT)
  - Implement chunked upload for files >5MB
  - Implement upload progress reporting
  - Implement conflict resolution strategies (replace, rename, skip, version)
  - Implement folder creation when missing
  - Implement file metadata setting
  - _Requirements: 9.1-9.10, 16.1-16.10_

- [ ]\* 6.1 Write property test for file format conversion

  - **Property 16: File format conversion**
  - **Validates: Requirements 9.1**

- [ ]\* 6.2 Write property test for chunked upload

  - **Property 17: Chunked upload for large files**
  - **Validates: Requirements 9.2, 16.1, 16.2**

- [ ]\* 6.3 Write property tests for conflict resolution

  - **Property 18: Conflict resolution - replace**
  - **Property 19: Conflict resolution - rename**
  - **Property 20: Conflict resolution - skip**
  - **Property 21: Conflict resolution - version**
  - **Validates: Requirements 9.5, 9.6, 9.7, 9.8**

- [ ]\* 6.4 Write property test for folder creation

  - **Property 22: Folder creation when missing**
  - **Validates: Requirements 9.9**

- [ ]\* 6.5 Write property tests for upload features

  - **Property 37: Upload progress reporting**
  - **Property 38: Chunk upload retry**
  - **Property 39: Upload resumption**
  - **Property 40: File size limit enforcement**
  - **Validates: Requirements 9.3, 16.4, 16.5, 16.6, 16.8, 16.10**

- [ ] 7. Implement spreadsheet export functionality

  - Implement column mapping application
  - Implement sheet operations (create, append, replace, insert)
  - Implement header row insertion
  - Implement data validation before export
  - Implement data type conversion (dates, booleans, numbers)
  - Implement null value handling
  - Implement string truncation for provider limits
  - Implement row count validation
  - Implement batch write operations
  - _Requirements: 10.1-10.10, 17.1-17.10, 18.1_

- [ ]\* 7.1 Write property test for column mapping

  - **Property 23: Column mapping application**
  - **Validates: Requirements 10.1**

- [ ]\* 7.2 Write property tests for sheet operations

  - **Property 24: Sheet operation - create**
  - **Property 25: Sheet operation - append**
  - **Property 26: Sheet operation - replace**
  - **Property 27: Sheet operation - insert**
  - **Validates: Requirements 10.2, 10.3, 10.4, 10.5**

- [ ]\* 7.3 Write property test for header row insertion

  - **Property 28: Header row insertion**
  - **Validates: Requirements 10.6**

- [ ]\* 7.4 Write property tests for data validation

  - **Property 29: Data validation before export**
  - **Property 33: Row count validation**
  - **Validates: Requirements 17.1, 17.2, 17.3, 17.9**

- [ ]\* 7.5 Write property tests for data handling

  - **Property 30: Null value handling**
  - **Property 31: Data type conversion**
  - **Property 32: String truncation for provider limits**
  - **Validates: Requirements 10.7, 10.8, 17.4, 17.5, 17.6, 17.7, 17.8**

- [ ]\* 7.6 Write property test for batch operations

  - **Property 34: Batch write operations**
  - **Validates: Requirements 10.9, 18.1**

- [ ] 8. Create OAuth callback page

  - Create /oauth/callback HTML page
  - Implement authorization code extraction from URL
  - Implement state parameter extraction and validation
  - Implement postMessage to send code to extension
  - Implement success/error message display
  - Implement auto-close after 3 seconds
  - _Requirements: 14.1-14.10_

- [ ] 9. Create DriveUploadNodePopup component

  - Implement provider selector dropdown
  - Implement connection status display
  - Implement connect/disconnect account buttons
  - Implement folder picker integration
  - Implement manual folder path input
  - Implement filename input field
  - Implement format selector dropdown
  - Implement conflict resolution selector
  - Implement create folder checkbox
  - Implement upload path preview
  - Implement configuration validation
  - _Requirements: 7.1-7.11_

- [ ] 10. Create SheetExportNodePopup component

  - Implement provider selector dropdown
  - Implement connection status display
  - Implement connect/disconnect account buttons
  - Implement sheet picker integration
  - Implement create new sheet option
  - Implement worksheet selector
  - Implement operation selector
  - Implement column mapping editor integration
  - Implement headers checkbox
  - Implement data mapping preview
  - Implement configuration validation
  - _Requirements: 8.1-8.11_

- [ ] 11. Create FolderPicker component

  - Implement tree view of folders
  - Implement expand/collapse functionality
  - Implement folder selection
  - Implement selected path display
  - Implement refresh button
  - Implement loading states
  - _Requirements: 11.1-11.6_

- [ ] 12. Create SheetPicker component

  - Implement sheet list display
  - Implement sheet selection
  - Implement create new sheet form
  - Implement search/filter functionality
  - Implement loading states
  - _Requirements: 11.7-11.11_

- [ ] 13. Create ColumnMappingEditor component

  - Implement data fields display
  - Implement target columns display
  - Implement drag-and-drop mapping
  - Implement dropdown mapping
  - Implement auto-mapping functionality
  - Implement unmapped fields warning
  - Implement column reordering
  - Implement add custom column
  - Implement mapping validation
  - Implement data preview
  - _Requirements: 12.1-12.10_

- [ ] 14. Implement backend database schema

  - Create drive_tokens table
  - Create sheet_tokens table
  - Create connected_accounts table
  - Implement database migrations
  - _Requirements: 13.1-13.3_

- [ ] 15. Implement backend token API endpoints

  - Create POST /api/tokens/store endpoint
  - Create GET /api/tokens/retrieve endpoint
  - Create POST /api/tokens/refresh endpoint
  - Create DELETE /api/tokens/revoke endpoint
  - Implement user ownership validation
  - Implement token encryption/decryption
  - Implement automatic cleanup of expired tokens
  - Implement security auditing logs
  - _Requirements: 13.4-13.10_

- [ ] 16. Implement error handling and recovery

  - Add authentication error handling
  - Add upload error handling
  - Add export error handling
  - Add UI error handling
  - Add backend error handling
  - Implement retry logic with exponential backoff
  - Implement error logging
  - Implement user notifications
  - _Requirements: 15.1-15.10_

- [ ]\* 16.1 Write property test for error logging and continuation

  - **Property 36: Error logging and pipeline continuation**
  - **Validates: Requirements 15.4, 15.5**

- [ ] 17. Implement performance optimizations

  - Implement caching for folder/sheet listings (5 min TTL)
  - Implement batch operations for sheets
  - Implement parallel file uploads (max 3 concurrent)
  - Implement file compression when supported
  - Implement connection pooling
  - Implement metadata caching
  - _Requirements: 18.1-18.10_

- [ ] 18. Add comprehensive error messages and user guidance

  - Add inline validation errors
  - Add detailed error messages for all failure scenarios
  - Add troubleshooting guidance
  - Add provider-specific help links
  - _Requirements: 15.6_

- [ ] 19. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 20. Create user documentation

  - Document OAuth setup for each provider
  - Document configuration options
  - Document conflict resolution strategies
  - Document column mapping
  - Document error handling
  - Create example pipelines

- [ ] 21. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
