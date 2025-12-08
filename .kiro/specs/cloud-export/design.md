# Design Document

## Overview

The Cloud Export feature enables GhostPipes pipelines to export processed data to popular cloud storage services (Google Drive, OneDrive, Dropbox, Box) and spreadsheet platforms (Google Sheets, Smartsheet, Airtable). The design implements a unified API abstraction layer that handles provider-specific differences, OAuth authentication with secure token management, intuitive UI components for configuration, and robust error handling with retry logic.

The architecture separates concerns into configuration models, API handlers, UI components, and backend services. OAuth tokens are securely stored in the backend with encryption, and the system automatically refreshes expired tokens. The implementation supports large file uploads via chunking, batch spreadsheet operations for performance, and comprehensive data validation before export.

## Architecture

### Component Hierarchy

```
Cloud Export System
├── Frontend (Extension)
│   ├── Configuration Models
│   │   ├── DriveUploadConfig
│   │   └── SheetExportConfig
│   ├── API Handlers
│   │   ├── DriveApiHandler
│   │   └── SheetApiHandler
│   ├── UI Components
│   │   ├── DriveUploadNodePopup
│   │   ├── SheetExportNodePopup
│   │   ├── FolderPicker
│   │   ├── SheetPicker
│   │   └── ColumnMappingEditor
│   └── OAuth Handler
│       └── OAuthCallbackHandler
├── Backend (API)
│   ├── OAuth Service
│   │   ├── Token Storage
│   │   ├── Token Refresh
│   │   └── Account Management
│   ├── Drive Service
│   │   └── Provider Adapters
│   └── Sheet Service
│       └── Provider Adapters
└── External Services
    ├── Cloud Storage Providers
    │   ├── Google Drive API
    │   ├── OneDrive API
    │   ├── Dropbox API
    │   └── Box API
    └── Spreadsheet Providers
        ├── Google Sheets API
        ├── Smartsheet API
        └── Airtable API
```

### Data Flow - Drive Upload

```
Pipeline Execution
    ↓ Output Data
DriveUploadNode
    ↓ Format Data (JSON/CSV/XML/TXT)
DriveApiHandler
    ↓ Get Access Token
Backend Token Service
    ↓ Check Expiration
    ├→ Expired: Refresh Token
    └→ Valid: Return Token
DriveApiHandler
    ↓ Upload File (Chunked if >5MB)
Cloud Provider API
    ↓ Handle Conflicts
    ↓ Store File
Success/Error Response
```

### Data Flow - Spreadsheet Export

```
Pipeline Execution
    ↓ Output Data (Array of Objects)
SheetExportNode
    ↓ Validate Data
    ↓ Apply Column Mapping
    ↓ Format Rows
SheetApiHandler
    ↓ Get Access Token
Backend Token Service
    ↓ Check Expiration
    ├→ Expired: Refresh Token
    └→ Valid: Return Token
SheetApiHandler
    ↓ Batch Write Operations
Spreadsheet Provider API
    ↓ Write Data
Success/Error Response
```

### OAuth Authentication Flow

```
User Clicks "Connect Account"
    ↓
Generate State Token (CSRF Protection)
    ↓
Open OAuth Authorization URL
    ↓
User Authorizes in Browser
    ↓
Redirect to /oauth/callback?code=...&state=...
    ↓
Validate State Token
    ↓
Extract Authorization Code
    ↓
Send Code to Backend
    ↓
Backend Exchanges Code for Tokens
    ↓
Backend Stores Encrypted Tokens
    ↓
Return Success to Extension
    ↓
Display "Connected" Status
```

## Components and Interfaces

### 1. DriveUploadConfig Model

```javascript
class DriveUploadConfig extends BaseConfig {
  /** @param {Object} init */
  constructor(init = {});

  /** @type {DriveProvider} Cloud storage provider */
  provider;

  /** @type {string} Target folder ID */
  folderId;

  /** @type {string} Target folder path (alternative to folderId) */
  folderPath;

  /** @type {string} Output filename */
  filename;

  /** @type {FileFormat} File format */
  format;

  /** @type {ConflictResolution} Conflict resolution strategy */
  onConflict;

  /** @type {boolean} Create folder if missing */
  createFolder;

  /** @type {string} OAuth access token */
  accessToken;

  /** @type {Object} File metadata */
  metadata;

  /** Validate configuration */
  validate();

  /** Get provider-specific API endpoint */
  getApiEndpoint();

  /** Get human-readable summary */
  getSummary();

  /** Serialize to JSON */
  toJSON();

  /** Deserialize from JSON */
  static fromJSON(data);
}
```

### 2. SheetExportConfig Model

```javascript
class SheetExportConfig extends BaseConfig {
  /** @param {Object} init */
  constructor(init = {});

  /** @type {SheetProvider} Spreadsheet provider */
  provider;

  /** @type {string} Target sheet ID */
  sheetId;

  /** @type {string} Target sheet name (alternative to sheetId) */
  sheetName;

  /** @type {string} Worksheet/tab name */
  worksheetName;

  /** @type {SheetOperation} Write operation */
  operation;

  /** @type {ColumnMapping[]} Field to column mappings */
  columnMapping;

  /** @type {boolean} First row contains headers */
  hasHeaders;

  /** @type {boolean} Enable data validation */
  dataValidation;

  /** @type {string} OAuth access token */
  accessToken;

  /** Validate configuration */
  validate();

  /** Get provider-specific API endpoint */
  getApiEndpoint();

  /** Get human-readable summary */
  getSummary();

  /** Serialize to JSON */
  toJSON();

  /** Deserialize from JSON */
  static fromJSON(data);
}
```

### 3. DriveApiHandler

```javascript
class DriveApiHandler {
  /** @param {DriveProvider} provider */
  constructor(provider);

  /**
   * Upload file to cloud storage
   * @param {DriveUploadConfig} config
   * @param {string|Blob} data
   * @returns {Promise<UploadResult>}
   */
  async uploadFile(config, data);

  /**
   * Create folder
   * @param {string} folderName
   * @param {string} parentId
   * @param {string} accessToken
   * @returns {Promise<Folder>}
   */
  async createFolder(folderName, parentId, accessToken);

  /**
   * List folders
   * @param {string} parentId
   * @param {string} accessToken
   * @returns {Promise<Folder[]>}
   */
  async listFolders(parentId, accessToken);

  /**
   * Get file metadata
   * @param {string} fileId
   * @param {string} accessToken
   * @returns {Promise<FileMetadata>}
   */
  async getFileMetadata(fileId, accessToken);

  /**
   * Delete file
   * @param {string} fileId
   * @param {string} accessToken
   * @returns {Promise<void>}
   */
  async deleteFile(fileId, accessToken);

  /**
   * Handle chunked upload for large files
   * @param {DriveUploadConfig} config
   * @param {Blob} data
   * @param {Function} onProgress
   * @returns {Promise<UploadResult>}
   */
  async uploadChunked(config, data, onProgress);

  /**
   * Resolve file conflicts
   * @param {string} filename
   * @param {string} folderId
   * @param {ConflictResolution} strategy
   * @param {string} accessToken
   * @returns {Promise<string>} Final filename
   */
  async resolveConflict(filename, folderId, strategy, accessToken);

  /**
   * Get provider-specific adapter
   * @returns {ProviderAdapter}
   */
  getAdapter();
}
```

### 4. SheetApiHandler

```javascript
class SheetApiHandler {
  /** @param {SheetProvider} provider */
  constructor(provider);

  /**
   * Create new sheet
   * @param {string} sheetName
   * @param {string} accessToken
   * @returns {Promise<Sheet>}
   */
  async createSheet(sheetName, accessToken);

  /**
   * Append rows to sheet
   * @param {SheetExportConfig} config
   * @param {Array<Object>} rows
   * @returns {Promise<ExportResult>}
   */
  async appendRows(config, rows);

  /**
   * Replace all data in sheet
   * @param {SheetExportConfig} config
   * @param {Array<Object>} rows
   * @returns {Promise<ExportResult>}
   */
  async replaceData(config, rows);

  /**
   * Insert rows at position
   * @param {SheetExportConfig} config
   * @param {Array<Object>} rows
   * @param {number} position
   * @returns {Promise<ExportResult>}
   */
  async insertRows(config, rows, position);

  /**
   * List available sheets
   * @param {string} accessToken
   * @returns {Promise<Sheet[]>}
   */
  async listSheets(accessToken);

  /**
   * Get sheet metadata
   * @param {string} sheetId
   * @param {string} accessToken
   * @returns {Promise<SheetMetadata>}
   */
  async getSheetMetadata(sheetId, accessToken);

  /**
   * Apply column mapping to data
   * @param {Array<Object>} data
   * @param {ColumnMapping[]} mapping
   * @returns {Array<Array>} Mapped rows
   */
  applyColumnMapping(data, mapping);

  /**
   * Batch write operations
   * @param {SheetExportConfig} config
   * @param {Array<Array>} rows
   * @returns {Promise<ExportResult>}
   */
  async batchWrite(config, rows);

  /**
   * Get provider-specific adapter
   * @returns {ProviderAdapter}
   */
  getAdapter();
}
```

### 5. OAuthService

```javascript
class OAuthService {
  /**
   * Initiate OAuth flow
   * @param {string} provider
   * @returns {Promise<string>} Authorization URL
   */
  async initiateOAuth(provider);

  /**
   * Exchange authorization code for tokens
   * @param {string} provider
   * @param {string} code
   * @param {string} state
   * @returns {Promise<TokenPair>}
   */
  async exchangeCode(provider, code, state);

  /**
   * Refresh access token
   * @param {string} provider
   * @param {string} refreshToken
   * @returns {Promise<TokenPair>}
   */
  async refreshToken(provider, refreshToken);

  /**
   * Get stored access token
   * @param {string} provider
   * @returns {Promise<string>}
   */
  async getAccessToken(provider);

  /**
   * Revoke tokens and disconnect account
   * @param {string} provider
   * @returns {Promise<void>}
   */
  async disconnectAccount(provider);

  /**
   * Check if user is connected to provider
   * @param {string} provider
   * @returns {Promise<boolean>}
   */
  async isConnected(provider);

  /**
   * Get connected account info
   * @param {string} provider
   * @returns {Promise<AccountInfo>}
   */
  async getAccountInfo(provider);

  /**
   * Validate state token for CSRF protection
   * @param {string} state
   * @returns {boolean}
   */
  validateState(state);

  /**
   * Generate state token
   * @returns {string}
   */
  generateState();
}
```

### 6. DriveUploadNodePopup Component

```javascript
class DriveUploadNodePopup extends HTMLDialogElement {
  /** @param {PipeNode} pipeNode */
  constructor(pipeNode);

  /** @type {DriveUploadConfig} */
  config;

  /** @type {OAuthService} */
  oauthService;

  /** @type {DriveApiHandler} */
  driveHandler;

  /** @type {boolean} */
  isConnected;

  /** @type {AccountInfo} */
  accountInfo;

  /** Initialize component */
  async connectedCallback();

  /** Load account connection status */
  async loadConnectionStatus();

  /** Handle provider change */
  async handleProviderChange(provider);

  /** Handle connect account */
  async handleConnect();

  /** Handle disconnect account */
  async handleDisconnect();

  /** Open folder picker */
  async openFolderPicker();

  /** Handle folder selection */
  handleFolderSelect(folder);

  /** Handle filename change */
  handleFilenameChange(filename);

  /** Handle format change */
  handleFormatChange(format);

  /** Handle conflict resolution change */
  handleConflictChange(strategy);

  /** Toggle create folder option */
  toggleCreateFolder();

  /** Validate and save configuration */
  async handleSave();

  /** Render component */
  render();

  /** Render connection required state */
  renderConnectionRequired();

  /** Render configuration form */
  renderConfigForm();

  /** Render upload path preview */
  renderPathPreview();
}
```

### 7. SheetExportNodePopup Component

```javascript
class SheetExportNodePopup extends HTMLDialogElement {
  /** @param {PipeNode} pipeNode */
  constructor(pipeNode);

  /** @type {SheetExportConfig} */
  config;

  /** @type {OAuthService} */
  oauthService;

  /** @type {SheetApiHandler} */
  sheetHandler;

  /** @type {boolean} */
  isConnected;

  /** @type {AccountInfo} */
  accountInfo;

  /** Initialize component */
  async connectedCallback();

  /** Load account connection status */
  async loadConnectionStatus();

  /** Handle provider change */
  async handleProviderChange(provider);

  /** Handle connect account */
  async handleConnect();

  /** Handle disconnect account */
  async handleDisconnect();

  /** Open sheet picker */
  async openSheetPicker();

  /** Handle sheet selection */
  handleSheetSelect(sheet);

  /** Handle create new sheet */
  async handleCreateSheet(sheetName);

  /** Handle operation change */
  handleOperationChange(operation);

  /** Open column mapping editor */
  openColumnMappingEditor();

  /** Handle column mapping update */
  handleMappingUpdate(mapping);

  /** Toggle headers option */
  toggleHeaders();

  /** Validate and save configuration */
  async handleSave();

  /** Render component */
  render();

  /** Render connection required state */
  renderConnectionRequired();

  /** Render configuration form */
  renderConfigForm();

  /** Render data mapping preview */
  renderMappingPreview();
}
```

### 8. FolderPicker Component

```javascript
class FolderPicker extends HTMLDialogElement {
  /** @param {DriveProvider} provider */
  constructor(provider);

  /** @type {DriveApiHandler} */
  driveHandler;

  /** @type {Folder[]} */
  folders;

  /** @type {Folder} */
  selectedFolder;

  /** @type {string} */
  currentParentId;

  /** Initialize component */
  async connectedCallback();

  /** Load folders */
  async loadFolders(parentId);

  /** Handle folder expand */
  async handleExpand(folder);

  /** Handle folder select */
  handleSelect(folder);

  /** Handle refresh */
  async handleRefresh();

  /** Handle confirm */
  handleConfirm();

  /** Render component */
  render();

  /** Render folder tree */
  renderFolderTree(folders, level);

  /** Render selected path */
  renderSelectedPath();
}
```

### 9. SheetPicker Component

```javascript
class SheetPicker extends HTMLDialogElement {
  /** @param {SheetProvider} provider */
  constructor(provider);

  /** @type {SheetApiHandler} */
  sheetHandler;

  /** @type {Sheet[]} */
  sheets;

  /** @type {Sheet} */
  selectedSheet;

  /** @type {string} */
  searchQuery;

  /** Initialize component */
  async connectedCallback();

  /** Load sheets */
  async loadSheets();

  /** Handle search */
  handleSearch(query);

  /** Handle sheet select */
  handleSelect(sheet);

  /** Handle create new */
  async handleCreateNew(sheetName);

  /** Handle confirm */
  handleConfirm();

  /** Render component */
  render();

  /** Render sheet list */
  renderSheetList(sheets);

  /** Render create new form */
  renderCreateForm();
}
```

### 10. ColumnMappingEditor Component

```javascript
class ColumnMappingEditor extends HTMLDialogElement {
  /** @param {Array<string>} dataFields */
  constructor(dataFields);

  /** @type {Array<string>} */
  dataFields;

  /** @type {ColumnMapping[]} */
  mappings;

  /** @type {Array<Object>} */
  previewData;

  /** Initialize component */
  connectedCallback();

  /** Handle auto-map */
  handleAutoMap();

  /** Handle field to column mapping */
  handleMapField(field, column);

  /** Handle add column */
  handleAddColumn(columnName);

  /** Handle remove mapping */
  handleRemoveMapping(index);

  /** Handle reorder */
  handleReorder(fromIndex, toIndex);

  /** Validate mappings */
  validateMappings();

  /** Handle confirm */
  handleConfirm();

  /** Render component */
  render();

  /** Render mapping rows */
  renderMappingRows();

  /** Render preview table */
  renderPreview();

  /** Render unmapped fields warning */
  renderUnmappedWarning();
}
```

## Data Models

### Folder

```javascript
class Folder {
	/** @type {string} Folder ID */
	id;

	/** @type {string} Folder name */
	name;

	/** @type {string} Parent folder ID */
	parentId;

	/** @type {string} Full path */
	path;

	/** @type {boolean} Has children */
	hasChildren;

	/** @type {number} Created timestamp */
	createdAt;

	/** @type {number} Modified timestamp */
	modifiedAt;
}
```

### Sheet

```javascript
class Sheet {
	/** @type {string} Sheet ID */
	id;

	/** @type {string} Sheet name */
	name;

	/** @type {string} Owner email */
	owner;

	/** @type {number} Row count */
	rowCount;

	/** @type {number} Column count */
	columnCount;

	/** @type {string[]} Worksheet names */
	worksheets;

	/** @type {number} Created timestamp */
	createdAt;

	/** @type {number} Modified timestamp */
	modifiedAt;
}
```

### ColumnMapping

```javascript
class ColumnMapping {
	/** @type {string} Source field name */
	field;

	/** @type {string} Target column name */
	column;

	/** @type {number} Column index */
	columnIndex;

	/** @type {string} Data type */
	dataType;

	/** @type {boolean} Required field */
	required;
}
```

### UploadResult

```javascript
class UploadResult {
	/** @type {boolean} Success status */
	success;

	/** @type {string} File ID */
	fileId;

	/** @type {string} File URL */
	fileUrl;

	/** @type {string} Final filename */
	filename;

	/** @type {number} File size */
	fileSize;

	/** @type {string} Error message */
	error;

	/** @type {number} Upload duration (ms) */
	duration;
}
```

### ExportResult

```javascript
class ExportResult {
	/** @type {boolean} Success status */
	success;

	/** @type {number} Rows written */
	rowsWritten;

	/** @type {string} Sheet URL */
	sheetUrl;

	/** @type {string} Error message */
	error;

	/** @type {number} Export duration (ms) */
	duration;
}
```

### TokenPair

```javascript
class TokenPair {
	/** @type {string} Access token */
	accessToken;

	/** @type {string} Refresh token */
	refreshToken;

	/** @type {number} Expires at timestamp */
	expiresAt;

	/** @type {string} Token type */
	tokenType;

	/** @type {string[]} Scopes */
	scopes;
}
```

### AccountInfo

```javascript
class AccountInfo {
	/** @type {string} Provider */
	provider;

	/** @type {string} Account email */
	email;

	/** @type {string} Display name */
	displayName;

	/** @type {string} Avatar URL */
	avatarUrl;

	/** @type {number} Connected timestamp */
	connectedAt;
}
```

### FileMetadata

```javascript
class FileMetadata {
	/** @type {string} File ID */
	id;

	/** @type {string} Filename */
	name;

	/** @type {string} MIME type */
	mimeType;

	/** @type {number} File size */
	size;

	/** @type {string} Parent folder ID */
	parentId;

	/** @type {number} Created timestamp */
	createdAt;

	/** @type {number} Modified timestamp */
	modifiedAt;

	/** @type {Object} Custom metadata */
	metadata;
}
```

### SheetMetadata

```javascript
class SheetMetadata {
	/** @type {string} Sheet ID */
	id;

	/** @type {string} Sheet name */
	name;

	/** @type {number} Row count */
	rowCount;

	/** @type {number} Column count */
	columnCount;

	/** @type {string[]} Column headers */
	headers;

	/** @type {string[]} Worksheet names */
	worksheets;

	/** @type {number} Created timestamp */
	createdAt;

	/** @type {number} Modified timestamp */
	modifiedAt;
}
```

## Enums

### DriveProvider

```javascript
const DriveProvider = Object.freeze({
	GOOGLE_DRIVE: "google_drive",
	ONEDRIVE: "onedrive",
	DROPBOX: "dropbox",
	BOX: "box",
});
```

### SheetProvider

```javascript
const SheetProvider = Object.freeze({
	GOOGLE_SHEETS: "google_sheets",
	SMARTSHEET: "smartsheet",
	AIRTABLE: "airtable",
});
```

### FileFormat

```javascript
const FileFormat = Object.freeze({
	JSON: "json",
	CSV: "csv",
	XML: "xml",
	TXT: "txt",
});
```

### ConflictResolution

```javascript
const ConflictResolution = Object.freeze({
	REPLACE: "replace",
	RENAME: "rename",
	SKIP: "skip",
	VERSION: "version",
});
```

### SheetOperation

```javascript
const SheetOperation = Object.freeze({
	CREATE: "create",
	APPEND: "append",
	REPLACE: "replace",
	INSERT: "insert",
});
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated:

- Config validation properties (1.5, 1.6, 2.5, 2.6) can be combined into comprehensive validation properties
- API handler method support properties (3.2-3.6, 4.2-4.7) can be combined into provider compatibility properties
- Token management properties (6.1-6.10) can be consolidated into token lifecycle properties
- Conflict resolution properties (9.5-9.8) are distinct behaviors that should remain separate
- Data validation properties (17.1-17.10) can be combined into comprehensive data validation properties

### Core Properties

Property 1: Configuration serialization round-trip
_For any_ valid DriveUploadConfig or SheetExportConfig, serializing to JSON and then deserializing should produce an equivalent configuration
**Validates: Requirements 1.9, 1.10, 2.9, 2.10**

Property 2: Provider validation
_For any_ configuration with an invalid provider value, validation should fail and return an error message
**Validates: Requirements 1.5, 2.5**

Property 3: Required field validation
_For any_ DriveUploadConfig with an empty filename or SheetExportConfig missing both sheetId and sheetName, validation should fail
**Validates: Requirements 1.6, 2.6**

Property 4: API endpoint generation
_For any_ valid provider in a configuration, getApiEndpoint() should return a non-empty HTTPS URL
**Validates: Requirements 1.7, 2.7**

Property 5: Configuration summary generation
_For any_ valid configuration, getSummary() should return a non-empty human-readable string
**Validates: Requirements 1.8, 2.8**

Property 6: Drive API handler provider compatibility
_For any_ supported DriveProvider, the DriveApiHandler should successfully execute uploadFile(), createFolder(), listFolders(), getFileMetadata(), and deleteFile() methods
**Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6**

Property 7: Sheet API handler provider compatibility
_For any_ supported SheetProvider, the SheetApiHandler should successfully execute createSheet(), appendRows(), replaceData(), insertRows(), listSheets(), and getSheetMetadata() methods
**Validates: Requirements 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**

Property 8: OAuth token inclusion
_For any_ API call made by DriveApiHandler or SheetApiHandler, the request should include a valid OAuth access token in the authorization header
**Validates: Requirements 3.8, 4.9**

Property 9: Automatic token refresh
_For any_ API call with an expired access token, the handler should automatically refresh the token before making the request
**Validates: Requirements 3.9, 4.10, 6.3, 6.4, 6.6**

Property 10: Rate limit handling with exponential backoff
_For any_ API call that receives a rate limit error (HTTP 429), the system should retry with exponentially increasing delays
**Validates: Requirements 3.10, 10.10, 15.3**

Property 11: OAuth authorization code extraction
_For any_ OAuth callback URL containing a code parameter, the redirect handler should successfully extract the authorization code
**Validates: Requirements 5.4, 14.2**

Property 12: OAuth state validation
_For any_ OAuth callback with a state parameter that doesn't match the original request, the system should reject the authorization
**Validates: Requirements 14.4**

Property 13: Token storage and retrieval
_For any_ successfully exchanged token pair, storing and then retrieving the tokens should return the same access token and a decrypted refresh token matching the original
**Validates: Requirements 5.6, 5.7, 6.1, 13.5**

Property 14: Token encryption
_For any_ refresh token stored in the database, the stored value should be encrypted and not match the plaintext token
**Validates: Requirements 6.2, 13.4**

Property 15: Account disconnection cleanup
_For any_ connected account, after disconnection the tokens should not be retrievable and should be deleted from the database
**Validates: Requirements 5.10, 13.8**

Property 16: File format conversion
_For any_ pipeline output data and configured FileFormat, the upload system should convert the data to the specified format (JSON, CSV, XML, or TXT)
**Validates: Requirements 9.1**

Property 17: Chunked upload for large files
_For any_ file larger than 5MB, the upload system should use chunked upload and split the file into 5MB chunks
**Validates: Requirements 9.2, 16.1, 16.2**

Property 18: Conflict resolution - replace
_For any_ file upload with conflict resolution set to "replace" and an existing file with the same name, the system should overwrite the existing file
**Validates: Requirements 9.5**

Property 19: Conflict resolution - rename
_For any_ file upload with conflict resolution set to "rename" and an existing file with the same name, the system should append a number to the filename
**Validates: Requirements 9.6**

Property 20: Conflict resolution - skip
_For any_ file upload with conflict resolution set to "skip" and an existing file with the same name, the system should not upload the file and log a message
**Validates: Requirements 9.7**

Property 21: Conflict resolution - version
_For any_ file upload with conflict resolution set to "version" and a provider that supports versioning, the system should create a new version of the file
**Validates: Requirements 9.8**

Property 22: Folder creation when missing
_For any_ upload with createFolder set to true and a non-existent target folder, the system should create the folder before uploading
**Validates: Requirements 9.9**

Property 23: Column mapping application
_For any_ pipeline data array and column mapping configuration, the export system should map data fields to sheet columns according to the mapping
**Validates: Requirements 10.1**

Property 24: Sheet operation - create
_For any_ sheet export with operation set to "create", the system should create a new sheet with the provided data
**Validates: Requirements 10.2**

Property 25: Sheet operation - append
_For any_ sheet export with operation set to "append", the system should add rows to the end of the existing sheet
**Validates: Requirements 10.3**

Property 26: Sheet operation - replace
_For any_ sheet export with operation set to "replace", the system should clear existing data and write new data
**Validates: Requirements 10.4**

Property 27: Sheet operation - insert
_For any_ sheet export with operation set to "insert", the system should insert rows at the specified position
**Validates: Requirements 10.5**

Property 28: Header row insertion
_For any_ sheet export with hasHeaders set to true, the system should write column headers in the first row
**Validates: Requirements 10.6**

Property 29: Data validation before export
_For any_ sheet export data, the system should validate that data is an array, each row is an object or array, and column mappings reference existing fields
**Validates: Requirements 17.1, 17.2, 17.3**

Property 30: Null value handling
_For any_ data containing null or undefined values, the system should handle them gracefully by writing empty cells
**Validates: Requirements 10.8, 17.7**

Property 31: Data type conversion
_For any_ data being exported to sheets, the system should convert data types appropriately (dates to date format, booleans to TRUE/FALSE, numbers to numeric format)
**Validates: Requirements 10.7, 17.4, 17.5, 17.6**

Property 32: String truncation for provider limits
_For any_ string value exceeding the provider's maximum length, the system should truncate the string to fit within the limit
**Validates: Requirements 17.8**

Property 33: Row count validation
_For any_ data array exceeding the provider's maximum row count, validation should fail before attempting export
**Validates: Requirements 17.9**

Property 34: Batch write operations
_For any_ sheet export with more than 1000 rows, the system should batch the write operations into groups of up to 1000 rows
**Validates: Requirements 10.9, 18.1**

Property 35: API retry with exponential backoff
_For any_ failed API call, the system should retry up to 3 times with exponentially increasing delays before giving up
**Validates: Requirements 15.2**

Property 36: Error logging and pipeline continuation
_For any_ file upload or sheet export failure, the system should log the error and allow pipeline execution to continue
**Validates: Requirements 15.4, 15.5**

Property 37: Upload progress reporting
_For any_ file upload larger than 5MB, the system should report upload progress as percentage and bytes uploaded
**Validates: Requirements 9.3, 16.4**

Property 38: Chunk upload retry
_For any_ failed chunk upload, the system should retry that specific chunk before proceeding
**Validates: Requirements 16.5**

Property 39: Upload resumption
_For any_ interrupted chunked upload, the system should resume from the last successfully uploaded chunk
**Validates: Requirements 16.6**

Property 40: File size limit enforcement
_For any_ file exceeding 100MB or the provider-specific maximum, the system should reject the upload with an error message
**Validates: Requirements 16.8, 16.10**

## Error Handling

### Authentication Errors

1. **OAuth Flow Failure**: Display error message, offer retry or manual authentication
2. **Token Expired**: Automatically refresh using refresh token
3. **Refresh Token Expired**: Prompt user to re-authenticate
4. **Invalid Credentials**: Show authentication dialog with error details
5. **Network Error During Auth**: Retry with exponential backoff, max 3 attempts

### Upload Errors

1. **File Too Large**: Reject with clear error message about size limit
2. **Invalid Format**: Validate format before upload, show format error
3. **Folder Not Found**: Create folder if createFolder is true, otherwise error
4. **Insufficient Permissions**: Show permission error, suggest re-authentication
5. **Network Timeout**: Retry chunk upload, resume from last successful chunk
6. **Quota Exceeded**: Show quota error with provider-specific guidance

### Export Errors

1. **Invalid Data Structure**: Show validation errors before export attempt
2. **Column Mapping Error**: Highlight unmapped required fields
3. **Sheet Not Found**: Offer to create new sheet or select different sheet
4. **Permission Denied**: Show permission error, suggest re-authentication
5. **Row Limit Exceeded**: Show error with row count and provider limit
6. **API Rate Limit**: Wait for rate limit reset, retry automatically

### UI Errors

1. **Failed to Load Folders**: Show retry button, cache previous results
2. **Failed to Load Sheets**: Show retry button, allow manual sheet ID input
3. **Connection Lost**: Queue operations, retry when connection restored
4. **Invalid Configuration**: Show inline validation errors, prevent save

### Backend Errors

1. **Database Connection Failed**: Retry with exponential backoff
2. **Token Encryption Failed**: Log error, prompt re-authentication
3. **Token Decryption Failed**: Delete corrupted token, prompt re-authentication
4. **Concurrent Token Refresh**: Use locking mechanism to prevent race conditions

## Testing Strategy

### Unit Testing Approach

Unit tests will verify individual components and methods:

1. **Configuration Model Tests**

   - Test validation for all properties
   - Test serialization/deserialization round-trip
   - Test getApiEndpoint() for all providers
   - Test getSummary() output format
   - Test default values

2. **API Handler Tests**

   - Mock provider APIs
   - Test all CRUD operations
   - Test token refresh logic
   - Test rate limit handling
   - Test error handling and retries

3. **OAuth Service Tests**

   - Mock OAuth endpoints
   - Test authorization flow
   - Test token exchange
   - Test token refresh
   - Test state validation

4. **UI Component Tests**
   - Test rendering with different states
   - Test user interactions
   - Test validation logic
   - Test event handling

### Property-Based Testing

Property-based tests will verify universal properties across many inputs:

1. **Configuration Round-Trip Property**

   - Generate random valid configurations
   - Serialize to JSON and deserialize
   - Verify equivalence

2. **Provider Compatibility Property**

   - For each supported provider
   - Test all API methods
   - Verify consistent behavior

3. **Token Encryption Property**

   - Generate random tokens
   - Encrypt and decrypt
   - Verify round-trip correctness

4. **Data Validation Property**

   - Generate random data structures
   - Apply validation rules
   - Verify correct acceptance/rejection

5. **Column Mapping Property**

   - Generate random data and mappings
   - Apply mapping
   - Verify correct field-to-column transformation

6. **Conflict Resolution Property**

   - For each conflict strategy
   - Generate scenarios with existing files
   - Verify correct behavior

7. **Chunked Upload Property**

   - Generate files of various sizes
   - Verify chunking for files >5MB
   - Verify chunk size is 5MB

8. **Batch Write Property**
   - Generate datasets of various sizes
   - Verify batching for datasets >1000 rows
   - Verify batch size ≤1000 rows

### Integration Testing

Integration tests will verify end-to-end workflows:

1. **Drive Upload Flow**

   - Authenticate with provider
   - Configure upload
   - Upload file
   - Verify file in cloud storage

2. **Sheet Export Flow**

   - Authenticate with provider
   - Configure export
   - Export data
   - Verify data in spreadsheet

3. **OAuth Flow**

   - Initiate OAuth
   - Complete authorization
   - Exchange code for tokens
   - Verify tokens stored

4. **Token Refresh Flow**

   - Use expired token
   - Trigger automatic refresh
   - Verify new token obtained
   - Verify API call succeeds

5. **Conflict Resolution Flow**

   - Upload file
   - Upload same filename again
   - Verify conflict resolution applied

6. **Large File Upload Flow**
   - Upload file >5MB
   - Verify chunked upload
   - Verify progress reporting
   - Verify file integrity

### Security Testing

Security tests will verify protection mechanisms:

1. **Token Encryption Tests**

   - Verify refresh tokens encrypted in database
   - Verify encryption uses AES-256
   - Verify tokens not exposed in logs

2. **OAuth State Validation Tests**

   - Test CSRF protection
   - Test state mismatch rejection
   - Test state replay attacks

3. **Token Ownership Tests**

   - Test user can only access own tokens
   - Test cross-user token access blocked

4. **Input Sanitization Tests**
   - Test SQL injection prevention
   - Test XSS prevention in filenames
   - Test path traversal prevention

## Implementation Notes

### Performance Optimizations

1. **Caching Strategy**

   - Cache folder listings for 5 minutes
   - Cache sheet listings for 5 minutes
   - Cache provider metadata
   - Invalidate cache on user actions

2. **Batch Operations**

   - Batch sheet writes (up to 1000 rows)
   - Batch API calls when possible
   - Use provider-specific batch APIs

3. **Parallel Processing**

   - Upload up to 3 files concurrently
   - Process chunks in parallel when supported
   - Parallelize independent API calls

4. **Compression**

   - Compress files before upload when supported
   - Use gzip for JSON/CSV/TXT formats
   - Skip compression for already compressed formats

5. **Connection Pooling**
   - Reuse HTTP connections
   - Maintain persistent connections to providers
   - Close idle connections after timeout

### Security Considerations

1. **Token Storage**

   - Encrypt refresh tokens with AES-256
   - Store encryption key securely
   - Rotate encryption keys periodically
   - Use secure random for token generation

2. **OAuth Security**

   - Use state parameter for CSRF protection
   - Validate redirect URIs
   - Use PKCE for additional security
   - Implement token rotation

3. **API Security**

   - Validate all user inputs
   - Sanitize filenames and paths
   - Prevent path traversal attacks
   - Rate limit API calls per user

4. **Data Privacy**
   - Don't log sensitive data
   - Don't expose tokens in error messages
   - Securely delete tokens on disconnect
   - Comply with data retention policies

### Browser Compatibility

- Target: Chrome 140+ (Manifest V3)
- Use native Fetch API
- Use native Crypto API for encryption
- Use chrome.storage for local token caching
- Use chrome.identity for OAuth (if available)

### Provider-Specific Considerations

#### Google Drive

- Use resumable upload API for large files
- Support shared drives
- Handle file versioning
- Use batch API for multiple operations

#### OneDrive

- Use chunked upload for files >4MB
- Support personal and business accounts
- Handle conflict resolution via API
- Use delta API for efficient syncing

#### Dropbox

- Use upload sessions for large files
- Support team folders
- Handle file conflicts
- Use batch API for multiple operations

#### Box

- Use chunked upload for files >20MB
- Support enterprise accounts
- Handle file versioning
- Use batch API for multiple operations

#### Google Sheets

- Use batchUpdate API for multiple operations
- Support multiple worksheets
- Handle cell formatting
- Respect API quotas (100 requests/100 seconds)

#### Smartsheet

- Use bulk operations API
- Support cell linking
- Handle column types
- Respect API rate limits

#### Airtable

- Use batch create/update APIs
- Support multiple bases
- Handle field types
- Respect API rate limits (5 requests/second)

### Code Organization

```
extension/pipelines/
├── models/
│   └── configs/
│       └── output/
│           ├── DriveUploadConfig.js (new)
│           └── SheetExportConfig.js (new)
├── services/
│   ├── cloud/
│   │   ├── DriveApiHandler.js (new)
│   │   ├── SheetApiHandler.js (new)
│   │   ├── OAuthService.js (new)
│   │   └── providers/
│   │       ├── GoogleDriveAdapter.js (new)
│   │       ├── OneDriveAdapter.js (new)
│   │       ├── DropboxAdapter.js (new)
│   │       ├── BoxAdapter.js (new)
│   │       ├── GoogleSheetsAdapter.js (new)
│   │       ├── SmartsheetAdapter.js (new)
│   │       └── AirtableAdapter.js (new)
├── components/
│   └── editor/
│       └── nodes/
│           └── output/
│               ├── drive-upload-node.js (new)
│               ├── sheet-export-node.js (new)
│               ├── folder-picker.js (new)
│               ├── sheet-picker.js (new)
│               └── column-mapping-editor.js (new)
└── pages/
    └── oauth-callback.html (new)

backend/src/modules/
├── cloud-storage/
│   ├── handlers.js (new)
│   ├── service.js (new)
│   ├── repository.js (new)
│   └── encryption.js (new)
└── oauth/
    ├── handlers.js (new)
    ├── service.js (new)
    └── repository.js (new)
```

## UI Design

### DriveUploadNodePopup Layout

```
┌─────────────────────────────────────────────┐
│ ☁️ Upload to Cloud Drive              [×]  │
├─────────────────────────────────────────────┤
│                                             │
│ Provider: [Google Drive ▾]                  │
│                                             │
│ Account: user@gmail.com [Disconnect]        │
│                                             │
│ Destination Folder:                         │
│ ┌─────────────────────────────────────┐    │
│ │ /My Drive/Projects/Data             │[📁]│
│ └─────────────────────────────────────┘    │
│                                             │
│ Filename: [output.json              ]      │
│                                             │
│ Format: [JSON ▾]                            │
│                                             │
│ If file exists: [Replace ▾]                 │
│                                             │
│ ☑ Create folder if missing                 │
│                                             │
│ Preview:                                    │
│ /My Drive/Projects/Data/output.json         │
│                                             │
│ [Save]  [Cancel]                            │
└─────────────────────────────────────────────┘
```

### SheetExportNodePopup Layout

```
┌─────────────────────────────────────────────┐
│ 📊 Export to Spreadsheet              [×]  │
├─────────────────────────────────────────────┤
│                                             │
│ Provider: [Google Sheets ▾]                 │
│                                             │
│ Account: user@gmail.com [Disconnect]        │
│                                             │
│ Spreadsheet:                                │
│ ┌─────────────────────────────────────┐    │
│ │ Sales Data 2024                     │[📋]│
│ └─────────────────────────────────────┘    │
│                                             │
│ Worksheet: [Sheet1 ▾]                       │
│                                             │
│ Operation: [Append rows ▾]                  │
│                                             │
│ ☑ First row is headers                     │
│                                             │
│ Column Mapping: [Edit Mapping...]           │
│                                             │
│ Preview:                                    │
│ ┌─────────────────────────────────────┐    │
│ │ name → Column A                     │    │
│ │ price → Column B                    │    │
│ │ date → Column C                     │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ [Save]  [Cancel]                            │
└─────────────────────────────────────────────┘
```

### FolderPicker Layout

```
┌─────────────────────────────────────────────┐
│ 📁 Select Folder                      [×]  │
├─────────────────────────────────────────────┤
│ [🔄 Refresh]                                │
│                                             │
│ ▼ 📁 My Drive                               │
│   ▼ 📁 Projects                             │
│     ▶ 📁 Code                               │
│     ▼ 📁 Data ✓                             │
│       ▶ 📁 Archive                          │
│   ▶ 📁 Documents                            │
│                                             │
│ Selected: /My Drive/Projects/Data           │
│                                             │
│ [Select]  [Cancel]                          │
└─────────────────────────────────────────────┘
```

### ColumnMappingEditor Layout

```
┌─────────────────────────────────────────────┐
│ 🔗 Map Columns                        [×]  │
├─────────────────────────────────────────────┤
│ [Auto-Map]                                  │
│                                             │
│ Data Fields          →  Sheet Columns      │
│ ┌──────────────────┐   ┌──────────────┐   │
│ │ name             │ → │ Column A ▾   │   │
│ │ price            │ → │ Column B ▾   │   │
│ │ date             │ → │ Column C ▾   │   │
│ │ category         │ → │ (unmapped) ▾ │⚠️ │
│ └──────────────────┘   └──────────────┘   │
│                                             │
│ [+ Add Column]                              │
│                                             │
│ Preview (first 3 rows):                     │
│ ┌─────────────────────────────────────┐    │
│ │ Column A │ Column B │ Column C      │    │
│ │ Product1 │ $10.00   │ 2024-01-15    │    │
│ │ Product2 │ $25.00   │ 2024-01-16    │    │
│ │ Product3 │ $15.00   │ 2024-01-17    │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ [Confirm]  [Cancel]                         │
└─────────────────────────────────────────────┘
```

## Dependencies

### Existing Dependencies

- BaseConfig (for config models)
- PipeNode (for node data)
- ApiClient (for backend communication)
- Pipeline execution engine

### New Dependencies

- None (uses native browser APIs and existing backend)

### Browser APIs Used

- Fetch API (for HTTP requests)
- Crypto API (for encryption/decryption)
- chrome.storage API (for local token caching)
- chrome.identity API (optional, for OAuth)
- Blob API (for file handling)
- FileReader API (for file reading)

### External APIs

- Google Drive API v3
- OneDrive API v1.0
- Dropbox API v2
- Box API v2.0
- Google Sheets API v4
- Smartsheet API v2.0
- Airtable API v0

## Migration Strategy

1. **Phase 1**: Implement configuration models and validation
2. **Phase 2**: Implement OAuth service and token management
3. **Phase 3**: Implement provider adapters for each cloud service
4. **Phase 4**: Implement API handlers with unified interface
5. **Phase 5**: Implement UI components (node popups, pickers)
6. **Phase 6**: Implement backend token storage and encryption
7. **Phase 7**: Add error handling and retry logic
8. **Phase 8**: Add performance optimizations (caching, batching)
9. **Phase 9**: Add comprehensive testing
10. **Phase 10**: Documentation and user guides

## Future Enhancements

1. **Additional Providers**: Add support for iCloud Drive, AWS S3, Azure Blob Storage
2. **Advanced Mapping**: Support formula-based column mapping
3. **Data Transformation**: Transform data before export (filtering, aggregation)
4. **Scheduled Exports**: Schedule automatic exports at intervals
5. **Export Templates**: Save and reuse export configurations
6. **Webhook Integration**: Trigger exports via webhooks
7. **Export History**: Track all exports with rollback capability
8. **Collaborative Editing**: Real-time collaboration on sheet exports
9. **Data Validation Rules**: Apply validation rules to exported data
10. **Custom Formatting**: Apply custom formatting to exported sheets
11. **Multi-Sheet Export**: Export to multiple sheets in one operation
12. **Incremental Sync**: Sync only changed data
13. **Conflict Resolution UI**: Visual diff tool for resolving conflicts
14. **Export Analytics**: Track export performance and usage metrics
15. **Offline Queue**: Queue exports when offline, sync when online
