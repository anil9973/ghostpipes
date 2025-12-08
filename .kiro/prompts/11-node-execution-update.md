## TASK 4: Node Execution Engine Update

**Objective:** Ensure all node types execute correctly in the background worker.

**Requirements:**

1. **Execution Audit**

   - Review all configs in `/extension/pipelines/models/configs/`
   - Check corresponding executors in `/extension/background/execution/`
   - Identify missing executors
   - Identify incomplete executors

2. **File Append Execution**

   - Get fileHandle from IndexedDB: `getFileHandleById` in `/extension/pipelines/db/filehandle-db.js`
   - Check file write permission
   - If permission denied, request from user

3. **Permission Request Flow**

   - Service worker sends message to options page
   - If options page not open, open it automatically
   - Show permission dialog in options page:
     ```html
     <dialog id="file-permission">
     	<h2>Permission Required</h2>
     	<p>🔏 Permission required to write <br /><var>filename.csv</var></p>
     	<button>Grant Permission</button>
     </dialog>
     ```
   - Implement message handler in `/extension/options/index.html`:
     ```javascript
     chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
     	if (request.command === "requestPermission") {
     		// Implementation as provided in context
     	}
     });
     ```
   - Return permission result to service worker
   - Resume execution after permission granted

4. **File System Observer Implementation**

   - **Problem:** FileSystemObserver not available in service workers
   - **Solution:** Run observer in persistent page (options or dedicated page)
   - Options:

     - A) Use existing `/extension/options/index.html`
     - B) Create new `/extension/index.html` (hidden background page)
     - C) Create `/extension/pipelines/index.html` (dedicated observer page)

   - Implement observer:

     ```javascript
     const observer = new FileSystemObserver(watchCallback);
     await observer.observe(directoryHandle, { recursive: true });

     function watchCallback(records, observer) {
     	// Detect file changes
     	// Trigger pipeline execution
     	// Send to service worker
     }
     ```

   - Communication flow:
     - Observer page detects file change
     - Sends message to service worker
     - Service worker triggers pipeline execution

5. **Missing Node Executors**
   - Audit and implement executors for:
     - All input nodes (manual, http, webhook, scheduled, file watch)
     - All processing nodes (filter, transform, parse, etc.)
     - All output nodes (download, append, drive, sheet, email)
   - Ensure proper error handling
   - Add execution logging
   - Support for async operations
   - Handle node timeouts

**Questions for Specs:**

- Should file permission requests be batched?
- How to handle permission denial (retry, skip, fail pipeline)?
- Best page for FileSystemObserver (options vs dedicated)?
- Should observer page stay open or close after setup?
- How to reconnect observer after browser restart?
- Execution retry strategy for failed nodes?

---

## Additional Considerations

**Agent Hooks / MCP Servers:**
Please analyze if the following would benefit the implementation:

1. File system operations agent (for File System Access API)
2. OAuth flow agent (for drive/sheet authentication)
3. Cloud storage MCP server (unified API for drives)
4. Spreadsheet MCP server (unified API for sheets)
5. Pipeline execution orchestrator
6. Permission management agent

**Testing Requirements:**

- How to test File System Access API in different browsers?
- How to mock OAuth flows for testing?
- How to test FileSystemObserver reliably?
- How to test service worker message passing?
