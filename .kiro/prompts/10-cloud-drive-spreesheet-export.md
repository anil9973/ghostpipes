## TASK 3: Cloud Storage & Spreadsheet Export

**Objective:** Add export nodes for cloud drives and spreadsheet services.

**Requirements:**

### Part A: Drive Upload Node

1. **Config Model**

   - Review `/extension/pipelines/models/configs/output/DriveUploadConfig.js`
   - Support providers: Google Drive, OneDrive, Dropbox, Box
   - Should append-to-file be supported? (vs always creating new files)

2. **Unified Drive API Handler**

   - Create single class/function to switch between drive providers
   - OAuth flow for each provider
   - File upload implementation for each
   - Folder creation/selection
   - Conflict resolution (rename, replace, version)

3. **Drive Node UI**
   - Provider selector dropdown
   - Folder picker (browse or path input)
   - Filename configuration
   - Format selector
   - Conflict handling options
   - "Connect Account" button with OAuth flow

### Part B: Spreadsheet Export Node

1. **Config Model**

   - Create `/extension/pipelines/models/configs/output/SheetExportConfig.js`
   - Support providers: Google Sheets, Smartsheet, Airtable
   - Options:
     - Create new sheet
     - Append to existing sheet (sheet picker)
     - Replace existing data
     - Insert at specific row

2. **Unified Sheet API Handler**

   - Create single class/function to switch between sheet providers
   - OAuth flow for each provider
   - Sheet creation/selection
   - Data append/insert operations
   - Column mapping/transformation

3. **Sheet Node UI**
   - Provider selector dropdown
   - Sheet picker (browse existing or create new)
   - Worksheet/tab selector (for multi-tab sheets)
   - Column mapping interface
   - Header row options
   - Data validation rules

### Part C: OAuth & Token Management

1. **OAuth Redirect Handler**

   - Create redirect HTML page for OAuth callbacks
   - Handle authorization codes
   - Exchange for access/refresh tokens
   - Store tokens securely

2. **Database Schema**

   - Update `/backend/src/db/migrations/001_users.js`
   - Add tables for:
     - Drive tokens (user_id, provider, access_token, refresh_token, expires_at)
     - Sheet tokens (user_id, provider, access_token, refresh_token, expires_at)
     - Connected accounts (user_id, provider, account_email, connected_at)

3. **Token Refresh**
   - Auto-refresh expired tokens
   - Handle refresh failures (prompt re-auth)
   - Store refresh tokens encrypted

**Questions for Specs:**

- Should file append in drives create versions or overwrite?
- How to handle large file uploads (chunking)?
- Should sheet exports validate data types before writing?
- Rate limiting for API calls?
- Offline queue for failed exports?
