# Requirements Document

## Introduction

This document specifies the requirements for implementing cloud storage and spreadsheet export capabilities in GhostPipes. The feature enables pipelines to export processed data to popular cloud storage services (Google Drive, OneDrive, Dropbox, Box) and spreadsheet platforms (Google Sheets, Smartsheet, Airtable). The implementation includes OAuth authentication, unified API handlers, conflict resolution, column mapping, and secure token management.

## Glossary

- **Cloud Provider**: A cloud storage service (Google Drive, OneDrive, Dropbox, Box)
- **Spreadsheet Provider**: A spreadsheet service (Google Sheets, Smartsheet, Airtable)
- **OAuth**: Open Authorization protocol for secure API access
- **Access Token**: Short-lived token for API authentication
- **Refresh Token**: Long-lived token for obtaining new access tokens
- **Conflict Resolution**: Strategy for handling existing files (replace, rename, skip, version)
- **Column Mapping**: Mapping between pipeline data fields and spreadsheet columns
- **Folder Picker**: UI component for browsing and selecting cloud folders
- **Sheet Picker**: UI component for browsing and selecting spreadsheets
- **Chunked Upload**: Uploading large files in smaller pieces
- **DriveUploadConfig**: Configuration model for cloud drive uploads
- **SheetExportConfig**: Configuration model for spreadsheet exports

## Requirements

### Requirement 1: Drive Upload Configuration Model

**User Story:** As a pipeline designer, I want a comprehensive configuration model for drive uploads, so that all upload settings are properly validated and stored.

#### Acceptance Criteria

1. THE DriveUploadConfig class SHALL support provider, folderId, folderPath, filename, format, onConflict, createFolder, accessToken, and metadata properties
2. THE DriveUploadConfig class SHALL support Google Drive, OneDrive, Dropbox, and Box providers
3. THE DriveUploadConfig class SHALL support JSON, CSV, XML, and TXT file formats
4. THE DriveUploadConfig class SHALL support replace, rename, skip, and version conflict resolution strategies
5. THE DriveUploadConfig class SHALL validate that provider is one of the supported cloud providers
6. THE DriveUploadConfig class SHALL validate that filename is a non-empty string
7. THE DriveUploadConfig class SHALL provide getApiEndpoint() method returning provider-specific API URLs
8. THE DriveUploadConfig class SHALL provide getSummary() method returning human-readable description
9. THE DriveUploadConfig class SHALL serialize to JSON for storage
10. THE DriveUploadConfig class SHALL deserialize from JSON for loading

### Requirement 2: Spreadsheet Export Configuration Model

**User Story:** As a pipeline designer, I want a configuration model for spreadsheet exports, so that I can control how data is written to sheets.

#### Acceptance Criteria

1. THE SheetExportConfig class SHALL support provider, sheetId, sheetName, worksheetName, operation, columnMapping, hasHeaders, and dataValidation properties
2. THE SheetExportConfig class SHALL support Google Sheets, Smartsheet, and Airtable providers
3. THE SheetExportConfig class SHALL support create, append, replace, and insert operations
4. THE SheetExportConfig class SHALL support column mapping as an array of field-to-column mappings
5. THE SheetExportConfig class SHALL validate that provider is one of the supported spreadsheet providers
6. THE SheetExportConfig class SHALL validate that sheetId or sheetName is provided
7. THE SheetExportConfig class SHALL provide getApiEndpoint() method returning provider-specific API URLs
8. THE SheetExportConfig class SHALL provide getSummary() method returning human-readable description
9. THE SheetExportConfig class SHALL serialize to JSON for storage
10. THE SheetExportConfig class SHALL deserialize from JSON for loading

### Requirement 3: Unified Drive API Handler

**User Story:** As a developer, I want a unified API handler for all cloud providers, so that drive operations work consistently across providers.

#### Acceptance Criteria

1. THE DriveApiHandler class SHALL provide a single interface for all cloud storage providers
2. THE DriveApiHandler class SHALL support uploadFile() method for all providers
3. THE DriveApiHandler class SHALL support createFolder() method for all providers
4. THE DriveApiHandler class SHALL support listFolders() method for all providers
5. THE DriveApiHandler class SHALL support getFileMetadata() method for all providers
6. THE DriveApiHandler class SHALL support deleteFile() method for all providers
7. THE DriveApiHandler class SHALL handle provider-specific API differences internally
8. THE DriveApiHandler class SHALL use OAuth access tokens for authentication
9. THE DriveApiHandler class SHALL automatically refresh expired tokens
10. THE DriveApiHandler class SHALL handle API rate limits with exponential backoff

### Requirement 4: Unified Spreadsheet API Handler

**User Story:** As a developer, I want a unified API handler for all spreadsheet providers, so that sheet operations work consistently across providers.

#### Acceptance Criteria

1. THE SheetApiHandler class SHALL provide a single interface for all spreadsheet providers
2. THE SheetApiHandler class SHALL support createSheet() method for all providers
3. THE SheetApiHandler class SHALL support appendRows() method for all providers
4. THE SheetApiHandler class SHALL support replaceData() method for all providers
5. THE SheetApiHandler class SHALL support insertRows() method for all providers
6. THE SheetApiHandler class SHALL support listSheets() method for all providers
7. THE SheetApiHandler class SHALL support getSheetMetadata() method for all providers
8. THE SheetApiHandler class SHALL handle provider-specific API differences internally
9. THE SheetApiHandler class SHALL use OAuth access tokens for authentication
10. THE SheetApiHandler class SHALL automatically refresh expired tokens

### Requirement 5: OAuth Authentication Flow

**User Story:** As a user, I want to securely connect my cloud accounts, so that pipelines can access my files and sheets.

#### Acceptance Criteria

1. WHEN a user clicks "Connect Account" THEN the system SHALL initiate OAuth flow for the selected provider
2. THE system SHALL open OAuth authorization page in a new browser tab
3. THE system SHALL redirect to a local callback page after authorization
4. THE callback page SHALL extract the authorization code from the URL
5. THE system SHALL exchange the authorization code for access and refresh tokens
6. THE system SHALL store tokens securely in the backend database
7. THE system SHALL associate tokens with the user account
8. THE system SHALL display "Connected" status after successful authentication
9. THE system SHALL allow users to disconnect accounts
10. WHEN disconnecting THEN the system SHALL revoke tokens and delete from database

### Requirement 6: Token Management and Refresh

**User Story:** As a system administrator, I want automatic token refresh, so that users don't have to re-authenticate frequently.

#### Acceptance Criteria

1. THE system SHALL store access tokens, refresh tokens, and expiration times in the database
2. THE system SHALL encrypt refresh tokens before storing
3. WHEN an access token expires THEN the system SHALL automatically use the refresh token to obtain a new access token
4. WHEN token refresh succeeds THEN the system SHALL update the stored access token and expiration time
5. WHEN token refresh fails THEN the system SHALL prompt the user to re-authenticate
6. THE system SHALL check token expiration before making API calls
7. THE system SHALL handle concurrent token refresh requests safely
8. THE system SHALL log token refresh failures for debugging
9. THE system SHALL expire refresh tokens after 90 days of inactivity
10. THE system SHALL notify users before token expiration

### Requirement 7: Drive Upload Node UI

**User Story:** As a pipeline designer, I want an intuitive UI for configuring drive uploads, so that I can easily set up cloud exports.

#### Acceptance Criteria

1. THE DriveUploadNodePopup SHALL display a provider selector dropdown with Google Drive, OneDrive, Dropbox, and Box
2. THE DriveUploadNodePopup SHALL display a "Connect Account" button when not authenticated
3. WHEN authenticated THEN the DriveUploadNodePopup SHALL display the connected account email
4. THE DriveUploadNodePopup SHALL provide a folder picker for browsing cloud folders
5. THE DriveUploadNodePopup SHALL allow manual folder path input as an alternative
6. THE DriveUploadNodePopup SHALL provide a filename input field
7. THE DriveUploadNodePopup SHALL provide a format selector dropdown (JSON, CSV, XML, TXT)
8. THE DriveUploadNodePopup SHALL provide conflict resolution options (replace, rename, skip, version)
9. THE DriveUploadNodePopup SHALL provide a "Create folder if missing" checkbox
10. THE DriveUploadNodePopup SHALL display a preview of the upload path
11. THE DriveUploadNodePopup SHALL validate configuration before saving

### Requirement 8: Spreadsheet Export Node UI

**User Story:** As a pipeline designer, I want an intuitive UI for configuring spreadsheet exports, so that I can easily set up data exports to sheets.

#### Acceptance Criteria

1. THE SheetExportNodePopup SHALL display a provider selector dropdown with Google Sheets, Smartsheet, and Airtable
2. THE SheetExportNodePopup SHALL display a "Connect Account" button when not authenticated
3. WHEN authenticated THEN the SheetExportNodePopup SHALL display the connected account email
4. THE SheetExportNodePopup SHALL provide a sheet picker for browsing existing sheets
5. THE SheetExportNodePopup SHALL allow creating a new sheet with a name input
6. THE SheetExportNodePopup SHALL provide a worksheet/tab selector for multi-tab sheets
7. THE SheetExportNodePopup SHALL provide operation options (create, append, replace, insert)
8. THE SheetExportNodePopup SHALL provide a column mapping interface
9. THE SheetExportNodePopup SHALL allow toggling "First row is headers" option
10. THE SheetExportNodePopup SHALL display a preview of the data mapping
11. THE SheetExportNodePopup SHALL validate configuration before saving

### Requirement 9: File Upload Implementation

**User Story:** As a pipeline designer, I want reliable file uploads, so that my data is safely stored in the cloud.

#### Acceptance Criteria

1. WHEN uploading a file THEN the system SHALL format the data according to the configured format
2. THE system SHALL support chunked uploads for files larger than 5MB
3. THE system SHALL display upload progress for large files
4. WHEN a file with the same name exists THEN the system SHALL apply the configured conflict resolution strategy
5. WHEN conflict resolution is "replace" THEN the system SHALL overwrite the existing file
6. WHEN conflict resolution is "rename" THEN the system SHALL append a number to the filename
7. WHEN conflict resolution is "skip" THEN the system SHALL not upload and log a message
8. WHEN conflict resolution is "version" THEN the system SHALL create a new version (if supported by provider)
9. WHEN createFolder is true and folder doesn't exist THEN the system SHALL create the folder
10. THE system SHALL set file metadata (title, description, tags) if provided

### Requirement 10: Spreadsheet Data Export Implementation

**User Story:** As a pipeline designer, I want reliable spreadsheet exports, so that my data is accurately written to sheets.

#### Acceptance Criteria

1. WHEN exporting to a sheet THEN the system SHALL map pipeline data fields to sheet columns according to column mapping
2. WHEN operation is "create" THEN the system SHALL create a new sheet with the data
3. WHEN operation is "append" THEN the system SHALL add rows to the end of the sheet
4. WHEN operation is "replace" THEN the system SHALL clear existing data and write new data
5. WHEN operation is "insert" THEN the system SHALL insert rows at the specified position
6. WHEN hasHeaders is true THEN the system SHALL write column headers in the first row
7. THE system SHALL validate data types before writing (numbers, dates, booleans)
8. THE system SHALL handle null and undefined values gracefully
9. THE system SHALL batch write operations for better performance
10. THE system SHALL handle API rate limits with retry logic

### Requirement 11: Folder and Sheet Picker Components

**User Story:** As a pipeline designer, I want to browse my cloud folders and sheets, so that I can easily select the destination.

#### Acceptance Criteria

1. THE FolderPicker component SHALL display a tree view of cloud folders
2. THE FolderPicker component SHALL support expanding and collapsing folders
3. THE FolderPicker component SHALL display folder icons and names
4. THE FolderPicker component SHALL allow selecting a folder by clicking
5. THE FolderPicker component SHALL display the selected folder path
6. THE FolderPicker component SHALL provide a "Refresh" button to reload folders
7. THE SheetPicker component SHALL display a list of available sheets
8. THE SheetPicker component SHALL display sheet names and last modified dates
9. THE SheetPicker component SHALL allow selecting a sheet by clicking
10. THE SheetPicker component SHALL provide a "Create New" button
11. THE SheetPicker component SHALL provide a search/filter input

### Requirement 12: Column Mapping Interface

**User Story:** As a pipeline designer, I want to map data fields to sheet columns, so that data is written to the correct columns.

#### Acceptance Criteria

1. THE ColumnMappingEditor component SHALL display available data fields from the pipeline
2. THE ColumnMappingEditor component SHALL display target sheet columns
3. THE ColumnMappingEditor component SHALL allow dragging fields to columns
4. THE ColumnMappingEditor component SHALL allow manual field-to-column mapping via dropdowns
5. THE ColumnMappingEditor component SHALL support auto-mapping based on field names
6. THE ColumnMappingEditor component SHALL display unmapped fields with a warning
7. THE ColumnMappingEditor component SHALL allow reordering columns
8. THE ColumnMappingEditor component SHALL allow adding custom column names
9. THE ColumnMappingEditor component SHALL validate that all required fields are mapped
10. THE ColumnMappingEditor component SHALL display a preview of the mapped data

### Requirement 13: Backend Token Storage

**User Story:** As a system administrator, I want secure token storage, so that user credentials are protected.

#### Acceptance Criteria

1. THE backend database SHALL have a drive_tokens table with user_id, provider, access_token, refresh_token, expires_at, and created_at columns
2. THE backend database SHALL have a sheet_tokens table with user_id, provider, access_token, refresh_token, expires_at, and created_at columns
3. THE backend database SHALL have a connected_accounts table with user_id, provider, account_email, and connected_at columns
4. THE backend SHALL encrypt refresh tokens using AES-256 before storing
5. THE backend SHALL decrypt refresh tokens when retrieving
6. THE backend SHALL provide API endpoints for storing and retrieving tokens
7. THE backend SHALL validate that tokens belong to the requesting user
8. THE backend SHALL delete tokens when users disconnect accounts
9. THE backend SHALL automatically delete expired tokens older than 90 days
10. THE backend SHALL log all token access for security auditing

### Requirement 14: OAuth Redirect Handler

**User Story:** As a developer, I want a redirect handler for OAuth callbacks, so that authorization codes are properly captured.

#### Acceptance Criteria

1. THE system SHALL provide an OAuth redirect page at /oauth/callback
2. THE redirect page SHALL extract the authorization code from the URL query parameters
3. THE redirect page SHALL extract the state parameter for CSRF protection
4. THE redirect page SHALL validate the state parameter matches the original request
5. THE redirect page SHALL send the authorization code to the extension via postMessage
6. THE extension SHALL exchange the authorization code for tokens via backend API
7. THE redirect page SHALL display "Authorization successful" message
8. THE redirect page SHALL automatically close after 3 seconds
9. WHEN authorization fails THEN the redirect page SHALL display the error message
10. THE redirect page SHALL handle errors gracefully and provide troubleshooting guidance

### Requirement 15: Error Handling and Recovery

**User Story:** As a pipeline designer, I want robust error handling, so that upload failures don't break my pipelines.

#### Acceptance Criteria

1. WHEN authentication fails THEN the system SHALL prompt for re-authentication
2. WHEN an API call fails THEN the system SHALL retry up to 3 times with exponential backoff
3. WHEN rate limit is exceeded THEN the system SHALL wait and retry after the specified time
4. WHEN a file upload fails THEN the system SHALL log the error and continue pipeline execution
5. WHEN a sheet export fails THEN the system SHALL log the error and continue pipeline execution
6. THE system SHALL provide detailed error messages for troubleshooting
7. THE system SHALL log all API errors to the backend
8. THE system SHALL allow manual retry of failed uploads
9. THE system SHALL queue failed uploads for later retry (optional)
10. THE system SHALL notify users of persistent failures

### Requirement 16: Large File Handling

**User Story:** As a pipeline designer, I want to upload large files, so that I'm not limited by file size.

#### Acceptance Criteria

1. WHEN a file is larger than 5MB THEN the system SHALL use chunked upload
2. THE system SHALL split files into 5MB chunks
3. THE system SHALL upload chunks sequentially
4. THE system SHALL display upload progress (percentage and bytes)
5. WHEN a chunk upload fails THEN the system SHALL retry that chunk
6. THE system SHALL resume uploads from the last successful chunk
7. THE system SHALL validate file integrity after upload
8. THE system SHALL support files up to 100MB
9. THE system SHALL warn users about very large files (>50MB)
10. THE system SHALL enforce maximum file size limits per provider

### Requirement 17: Data Validation

**User Story:** As a pipeline designer, I want data validation before export, so that invalid data doesn't cause errors.

#### Acceptance Criteria

1. WHEN exporting to sheets THEN the system SHALL validate that data is an array
2. THE system SHALL validate that each row is an object or array
3. THE system SHALL validate that column mappings reference existing fields
4. THE system SHALL convert data types to match sheet column types
5. THE system SHALL handle date strings and convert to proper date format
6. THE system SHALL handle boolean values and convert to TRUE/FALSE
7. THE system SHALL handle null values and write as empty cells
8. THE system SHALL truncate strings longer than provider limits
9. THE system SHALL validate that row count doesn't exceed provider limits
10. THE system SHALL display validation errors before attempting export

### Requirement 18: Performance Optimization

**User Story:** As a system administrator, I want optimized API usage, so that exports are fast and don't exceed rate limits.

#### Acceptance Criteria

1. THE system SHALL batch spreadsheet write operations (up to 1000 rows per batch)
2. THE system SHALL cache folder and sheet listings for 5 minutes
3. THE system SHALL reuse OAuth tokens across multiple operations
4. THE system SHALL compress file uploads when supported by provider
5. THE system SHALL use parallel uploads for multiple files (up to 3 concurrent)
6. THE system SHALL monitor API rate limits and throttle requests
7. THE system SHALL use provider-specific optimizations (batch APIs, etc.)
8. THE system SHALL minimize API calls by caching metadata
9. THE system SHALL use efficient data serialization formats
10. THE system SHALL measure and log operation performance metrics
