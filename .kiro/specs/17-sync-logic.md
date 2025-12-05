# Extension-Server Sync Logic

## Sync Strategy: Optimistic UI + Server Reconciliation

## IndexedDB Schema (Extension)

### Store: pipelines

```javascript
{
  pipelineId: 'uuid', // Primary key
  name: 'string',
  description: 'string',
  pipelineData: {}, // Full Pipeline object
  version: 1,
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  lastSyncedAt: 'timestamp',
  syncStatus: 'synced' | 'pending' | 'conflict',
  isDirty: boolean // Has local changes not synced
}
```

### Store: syncQueue

```javascript
{
  queueId: 'uuid',
  pipelineId: 'uuid',
  action: 'create' | 'update' | 'delete',
  data: {}, // Pipeline data
  timestamp: 'timestamp',
  retryCount: 0
}
```

## Sync Triggers

### 1. Auto-Sync (Every 10-20 seconds)

```javascript
let syncInterval;

function startAutoSync() {
	if (!isUserLoggedIn()) return;

	syncInterval = setInterval(async () => {
		await syncPipelines();
	}, 15000); // 15 seconds
}

function stopAutoSync() {
	clearInterval(syncInterval);
}
```

### 2. Manual Sync

- When user explicitly clicks "Sync Now"
- After login
- Before critical operations

### 3. On Change Debounced

```javascript
let syncTimeout;

function onPipelineChange(pipelineId) {
  const pipeline = await db.pipelines.get(pipelineId);
  pipeline.isDirty = true;
  pipeline.updatedAt = new Date().toISOString();
  await db.pipelines.put(pipeline);

  // Debounce sync
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    syncPipelines();
  }, 2000);
}
```

## Sync Algorithm

### Step 1: Collect Dirty Pipelines

```javascript
async function syncPipelines() {
	if (!isUserLoggedIn()) return;

	const dirtyPipelines = await db.pipelines.where("isDirty").equals(true).toArray();

	if (dirtyPipelines.length === 0) return;

	try {
		const result = await fetch("https://api.ghostpipes.com/api/pipelines/sync", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				pipelines: dirtyPipelines.map((p) => ({
					pipelineId: p.pipelineId,
					name: p.name,
					description: p.description,
					pipelineData: p.pipelineData,
					version: p.version,
					clientUpdatedAt: p.updatedAt,
				})),
			}),
		});

		const data = await result.json();

		// Handle successful syncs
		for (const pipelineId of data.synced) {
			await db.pipelines.update(pipelineId, {
				isDirty: false,
				lastSyncedAt: new Date().toISOString(),
				syncStatus: "synced",
			});
		}

		// Handle conflicts
		for (const conflict of data.conflicts) {
			await handleSyncConflict(conflict);
		}
	} catch (error) {
		console.error("Sync failed:", error);
		// Will retry on next interval
	}
}
```

### Step 2: Conflict Resolution

```javascript
async function handleSyncConflict(conflict) {
	const localPipeline = await db.pipelines.get(conflict.pipelineId);

	// Fetch server version
	const response = await fetch(`https://api.ghostpipes.com/api/pipelines/${conflict.pipelineId}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	const serverPipeline = await response.json();

	// Show conflict dialog to user
	const resolution = await showConflictDialog(localPipeline, serverPipeline.data);

	if (resolution === "keep_local") {
		// Force push local version
		await fetch(`https://api.ghostpipes.com/api/pipelines/${conflict.pipelineId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				...localPipeline,
				forceUpdate: true,
			}),
		});

		await db.pipelines.update(conflict.pipelineId, {
			isDirty: false,
			syncStatus: "synced",
		});
	} else if (resolution === "keep_server") {
		// Accept server version
		await db.pipelines.put({
			...serverPipeline.data,
			isDirty: false,
			syncStatus: "synced",
			lastSyncedAt: new Date().toISOString(),
		});
	} else if (resolution === "merge") {
		// Merge logic (complex, optional for hackathon)
		const merged = mergePipelines(localPipeline, serverPipeline.data);
		await db.pipelines.put(merged);
	}
}
```

## Initial Sync (After Login)

### Download All Pipelines

```javascript
async function initialSync() {
	const response = await fetch("https://api.ghostpipes.com/api/pipelines", {
		headers: { Authorization: `Bearer ${token}` },
	});
	const data = await response.json();

	for (const pipeline of data.data.pipelines) {
		// Fetch full pipeline data
		const detailResponse = await fetch(`https://api.ghostpipes.com/api/pipelines/${pipeline.pipelineId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const detail = await detailResponse.json();

		// Check if exists locally
		const localPipeline = await db.pipelines.get(pipeline.pipelineId);

		if (!localPipeline) {
			// New pipeline from server
			await db.pipelines.add({
				...detail.data,
				isDirty: false,
				syncStatus: "synced",
				lastSyncedAt: new Date().toISOString(),
			});
		} else if (localPipeline.isDirty) {
			// Has local changes, check for conflict
			if (new Date(detail.data.updatedAt) > new Date(localPipeline.updatedAt)) {
				await handleSyncConflict({
					pipelineId: pipeline.pipelineId,
					serverVersion: detail.data.version,
					clientVersion: localPipeline.version,
				});
			}
		} else {
			// Update with server version
			await db.pipelines.put({
				...detail.data,
				isDirty: false,
				syncStatus: "synced",
				lastSyncedAt: new Date().toISOString(),
			});
		}
	}
}
```

## Offline Support

### Queue Operations

```javascript
async function savePipelineOffline(pipeline) {
	// Save to IndexedDB
	await db.pipelines.put({
		...pipeline,
		isDirty: true,
		syncStatus: "pending",
		updatedAt: new Date().toISOString(),
	});

	// Add to sync queue
	await db.syncQueue.add({
		queueId: crypto.randomUUID(),
		pipelineId: pipeline.pipelineId,
		action: "update",
		data: pipeline,
		timestamp: new Date().toISOString(),
		retryCount: 0,
	});
}

async function processOfflineQueue() {
	const queue = await db.syncQueue.toArray();

	for (const item of queue) {
		try {
			await syncPipelines();
			await db.syncQueue.delete(item.queueId);
		} catch (error) {
			// Increment retry count
			await db.syncQueue.update(item.queueId, {
				retryCount: item.retryCount + 1,
			});

			// Remove after 5 failed attempts
			if (item.retryCount >= 5) {
				await db.syncQueue.delete(item.queueId);
				console.error("Max retries reached for:", item);
			}
		}
	}
}
```

## Sync Status Indicator (UI)

### Show Sync Status

```javascript
function updateSyncIndicator(status) {
	const indicator = document.getElementById("sync-status");

	switch (status) {
		case "synced":
			indicator.innerHTML = "✓ Synced";
			indicator.className = "sync-status synced";
			break;
		case "syncing":
			indicator.innerHTML = "↻ Syncing...";
			indicator.className = "sync-status syncing";
			break;
		case "pending":
			indicator.innerHTML = "• Pending";
			indicator.className = "sync-status pending";
			break;
		case "error":
			indicator.innerHTML = "✗ Sync Failed";
			indicator.className = "sync-status error";
			break;
		case "offline":
			indicator.innerHTML = "⚠ Offline";
			indicator.className = "sync-status offline";
			break;
	}
}
```

## Best Practices

1. Always mark local changes as dirty
2. Sync frequently but debounce user actions
3. Handle network errors gracefully
4. Show sync status to user
5. Preserve user work during conflicts
6. Clear sync queue after successful sync
