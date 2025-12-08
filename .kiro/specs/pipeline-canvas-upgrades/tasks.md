# Implementation Plan

- [x] 1. Set up viewport service infrastructure

  - Create directory structure for viewport services
  - Set up fast-check testing library
  - Create viewport storage utility for localStorage management
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 2. Implement ZoomController

  - [x] 2.1 Create ZoomController class with discrete zoom levels

    - Implement LEVELS constant array [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0]
    - Implement getNextLevel() method for zoom in/out
    - Implement clamp() method for boundary enforcement
    - Implement toTransform() method for CSS transform generation
    - _Requirements: 1.3, 1.7_

  - [ ]\* 2.2 Write property test for discrete zoom levels

    - **Property 2: Zoom levels are discrete**
    - **Validates: Requirements 1.3**

  - [ ]\* 2.3 Write unit tests for ZoomController
    - Test getNextLevel() with all zoom levels and directions
    - Test clamp() with values below, within, and above range
    - Test toTransform() generates correct CSS strings
    - _Requirements: 1.3, 1.7_

- [x] 3. Implement PanController

  - [x] 3.1 Create PanController class with boundary management

    - Implement constructor accepting canvas element
    - Implement constrainPan() method with boundary checks
    - Implement getBoundaries() method calculating from node positions
    - Implement isWithinBounds() method for position validation
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ]\* 3.2 Write property test for pan boundaries

    - **Property 7: Pan boundaries are enforced**
    - **Validates: Requirements 6.1, 6.2**

  - [ ]\* 3.3 Write unit tests for PanController
    - Test constrainPan() with various boundary scenarios
    - Test getBoundaries() with different node configurations
    - Test isWithinBounds() with edge positions
    - _Requirements: 6.1, 6.2, 6.4_

- [x] 4. Implement CanvasExpansion service

  - [x] 4.1 Create CanvasExpansion class

    - Implement EXPANSION_INCREMENT (500px) constant
    - Implement EXPANSION_THRESHOLD (0.9) constant
    - Implement MAX_HEIGHT (10000px) constant
    - Implement checkAndExpand() method with threshold detection
    - Implement expandTo() method for canvas resizing
    - Implement getCurrentHeight() method
    - _Requirements: 3.1, 3.3, 3.5_

  - [ ]\* 4.2 Write property test for expansion triggers

    - **Property 8: Canvas expansion triggers at threshold**
    - **Validates: Requirements 3.1, 3.5**

  - [ ]\* 4.3 Write property test for expansion preservation

    - **Property 9: Expansion preserves content**
    - **Validates: Requirements 3.4**

  - [ ]\* 4.4 Write unit tests for CanvasExpansion
    - Test checkAndExpand() at various height thresholds
    - Test expandTo() updates canvas height correctly
    - Test maximum height enforcement
    - _Requirements: 3.1, 3.3, 3.5_

- [x] 5. Implement CanvasViewport service

  - [x] 5.1 Create ViewportState data model

    - Implement ViewportState class with zoom, panX, panY, pipelineId properties
    - Implement toJSON() serialization method
    - Implement fromJSON() deserialization method
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 5.2 Create CanvasViewport service class

    - Implement constructor accepting canvas element
    - Integrate ZoomController for zoom operations
    - Integrate PanController for pan operations
    - Implement zoom() method with center point calculation
    - Implement setZoomLevel() method
    - Implement getZoomLevel() method
    - Implement pan() method with boundary constraints
    - Implement reset() method to return to origin
    - Implement getState() and setState() methods
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.5, 2.6_

  - [ ]\* 5.3 Write property test for zoom centering

    - **Property 3: Zoom centers correctly**
    - **Validates: Requirements 1.1**

  - [ ]\* 5.4 Write property test for zoom preserving positions

    - **Property 1: Zoom preserves node absolute positions**
    - **Validates: Requirements 1.4, 2.6**

  - [ ]\* 5.5 Write property test for pan mode preventing node interaction
    - **Property 6: Pan mode prevents node interaction**
    - **Validates: Requirements 2.4**

- [x] 6. Implement viewport storage utility

  - [x] 6.1 Create viewport-storage.js utility

    - Implement saveViewportState() function for localStorage persistence
    - Implement loadViewportState() function for state restoration
    - Implement clearViewportState() function for cleanup
    - Add error handling for storage quota and access errors
    - Add debouncing for write operations (300ms)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]\* 6.2 Write property test for persistence round-trip

    - **Property 13: Zoom persistence round-trip**
    - **Validates: Requirements 5.1, 5.2**

  - [ ]\* 6.3 Write property test for zoom isolation
    - **Property 14: Zoom isolation per pipeline**
    - **Validates: Requirements 5.4**

- [x] 7. Integrate viewport into PipelineCanvas

  - [x] 7.1 Modify PipelineCanvas component

    - Import CanvasViewport service
    - Initialize CanvasViewport in connectedCallback
    - Add zoom UI indicator element to render()
    - Add zoom in/out buttons to render()
    - Add reset viewport button to render()
    - Load saved viewport state on pipeline load
    - Apply CSS transforms for zoom and pan
    - _Requirements: 1.2, 1.6, 2.5, 5.2_

  - [x] 7.2 Implement mouse wheel zoom handler

    - Add wheel event listener to canvas
    - Calculate mouse position relative to canvas
    - Call CanvasViewport.zoom() with mouse position as center
    - Update zoom UI indicator
    - Save viewport state to storage
    - Trigger pipe re-rendering
    - _Requirements: 1.1, 1.4, 1.5_

  - [x] 7.3 Implement pan drag handlers

    - Add pointerdown handler for empty canvas detection
    - Add pointermove handler for pan delta calculation
    - Add pointerup handler for pan completion
    - Implement spacebar key detection for pan mode
    - Update cursor styles during pan (grab/grabbing)
    - Call CanvasViewport.pan() with delta
    - Trigger pipe re-rendering
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_

  - [ ]\* 7.4 Write property test for pipes following nodes

    - **Property 4: Pipes follow nodes through transformations**
    - **Validates: Requirements 1.5**

  - [ ]\* 7.5 Write property test for zoom UI reflection
    - **Property 5: Zoom UI reflects actual state**
    - **Validates: Requirements 1.6**

- [x] 8. Implement keyboard shortcuts

  - [x] 8.1 Add keyboard event handlers to PipelineCanvas

    - Add keydown listener for Ctrl+Plus (zoom in)
    - Add keydown listener for Ctrl+Minus (zoom out)
    - Add keydown listener for Ctrl+0 (reset zoom)
    - Add keydown listener for Spacebar (pan mode toggle)
    - Add keydown listener for Delete (node deletion)
    - Prevent default browser behavior for shortcuts
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 4.6_

  - [ ]\* 8.2 Write property test for keyboard shortcuts

    - **Property 15: Keyboard shortcuts modify state correctly**
    - **Validates: Requirements 7.1, 7.2, 7.3**

  - [ ]\* 8.3 Write property test for delete key
    - **Property 16: Delete key triggers deletion**
    - **Validates: Requirements 4.6**

- [x] 9. Integrate canvas expansion

  - [x] 9.1 Add expansion logic to PipelineEditor

    - Import CanvasExpansion service
    - Initialize CanvasExpansion in constructor
    - Call checkAndExpand() in handleNodeDrop()
    - Call checkAndExpand() during node drag (nodedrag event)
    - Display expansion notification when expansion occurs
    - _Requirements: 3.1, 3.2, 3.5_

  - [x] 9.2 Update PipelineCanvas to support dynamic height
    - Remove fixed height constraints from CSS
    - Set initial canvas height to 3000px
    - Allow canvas to grow via CanvasExpansion service
    - _Requirements: 3.1, 3.3_

- [x] 10. Implement enhanced node deletion

  - [x] 10.1 Add delete icon to PipelineNodeBox

    - Import icon sprite reference
    - Add delete button to render() method
    - Style delete button with hover effects
    - Position delete button in top-right corner of node
    - Use existing icon: `<use href="/assets/icons.svg#delete"></use>`
    - _Requirements: 4.1_

  - [x] 10.2 Create NodeDeletionHandler service

    - Implement constructor accepting PipelineEditor instance
    - Implement hasConnections() method checking node pipes
    - Implement confirmDeletion() method showing dialog
    - Implement deleteNode() method with confirmation logic
    - Add database deletion via pipedb.removePipeNode()
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [x] 10.3 Wire up deletion handlers

    - Add click handler to delete icon in PipelineNodeBox
    - Call NodeDeletionHandler.deleteNode() on click
    - Emit nodedelete event on confirmation
    - Update PipelineEditor.deleteNode() to use NodeDeletionHandler
    - Add visual feedback (red border) on delete hover
    - _Requirements: 4.1, 4.2, 4.3, 4.7_

  - [ ]\* 10.4 Write property test for deletion cleanup

    - **Property 10: Node deletion cleans up connections**
    - **Validates: Requirements 4.4, 4.7**

  - [ ]\* 10.5 Write property test for deletion confirmation

    - **Property 11: Deletion confirmation for connected nodes**
    - **Validates: Requirements 4.3**

  - [ ]\* 10.6 Write property test for database synchronization
    - **Property 12: Database synchronization on deletion**
    - **Validates: Requirements 4.5**

- [x] 11. Implement visual feedback

  - [x] 11.1 Add CSS transitions for zoom

    - Add transition property to canvas transform (200ms)
    - Add easing function for smooth zoom
    - _Requirements: 8.1_

  - [x] 11.2 Add cursor styles for pan mode

    - Set cursor to 'grab' when pan mode active
    - Set cursor to 'grabbing' during pan drag
    - Reset cursor when pan mode exits
    - _Requirements: 2.3, 8.2, 8.3_

  - [x] 11.3 Add visual feedback for node deletion

    - Add red border on delete icon hover
    - Add red border on node when delete is pending
    - Change delete icon color on hover
    - _Requirements: 8.5, 8.6_

  - [ ]\* 11.4 Write property test for visual feedback

    - **Property 17: Visual feedback matches state**
    - **Validates: Requirements 2.3, 8.2, 8.3, 8.5, 8.6**

  - [ ]\* 11.5 Write property test for animation timing
    - **Property 18: Zoom animation timing is consistent**
    - **Validates: Requirements 8.1**

- [x] 12. Add error handling

  - [x] 12.1 Add error handling to CanvasViewport

    - Handle invalid zoom levels (clamp to valid range)
    - Handle NaN/Infinity in calculations (reset to defaults)
    - Handle CSS transform application failures (log and maintain state)
    - _Requirements: All zoom/pan requirements_

  - [x] 12.2 Add error handling to CanvasExpansion

    - Handle maximum height exceeded (cap and warn)
    - Handle height calculation errors (use default)
    - Handle expansion during zoom (queue for later)
    - _Requirements: 3.1, 3.3_

  - [x] 12.3 Add error handling to NodeDeletionHandler

    - Handle node not found (log warning)
    - Handle database deletion failure (show error notification)
    - Handle pipe cleanup failure (log but complete deletion)
    - Handle dialog blocked (default to confirmation required)
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [x] 12.4 Add error handling to viewport storage
    - Handle localStorage full (clear old states and retry)
    - Handle storage access denied (use in-memory only)
    - Handle corrupted state data (reset to defaults)
    - _Requirements: 5.1, 5.2_

- [x] 13. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Add accessibility features

  - [x] 14.1 Add ARIA labels to zoom controls

    - Add aria-label to zoom in button
    - Add aria-label to zoom out button
    - Add aria-label to reset button
    - Add aria-label to zoom level indicator
    - _Requirements: 1.2, 1.6, 2.5_

  - [x] 14.2 Add screen reader announcements

    - Announce zoom level changes via aria-live region
    - Announce canvas expansion via aria-live region
    - Announce node deletion via aria-live region
    - _Requirements: 1.1, 1.2, 3.2, 4.2_

  - [x] 14.3 Ensure keyboard focus management
    - Maintain focus on canvas during keyboard operations
    - Ensure delete confirmation dialog is keyboard accessible
    - Add focus indicators for zoom buttons
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 4.6_

- [x] 15. Update CSS styles

  - [x] 15.1 Add viewport control styles

    - Style zoom in/out buttons
    - Style reset button
    - Style zoom level indicator
    - Add hover states for all buttons
    - _Requirements: 1.2, 1.6, 2.5_

  - [x] 15.2 Add cursor styles

    - Define grab cursor for pan mode
    - Define grabbing cursor for active pan
    - Ensure cursors work in high contrast mode
    - _Requirements: 2.3, 8.2, 8.3_

  - [x] 15.3 Add delete icon styles

    - Style delete button in node header
    - Add hover effect (red color)
    - Add red border for deletion pending state
    - Ensure visibility in high contrast mode
    - _Requirements: 4.1, 8.5, 8.6_

  - [x] 15.4 Add transition styles
    - Add 200ms transition for canvas transform
    - Add easing function for smooth animations
    - _Requirements: 8.1_

- [x] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
