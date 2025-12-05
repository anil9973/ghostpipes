# Implementation Plan

- [ ] 1. Set up project structure and data models

  - Create directory structure for pipeline builder components
  - Implement Pipeline, NodeData, PipeData, and ConnectionPoint data model classes
  - Add JSDoc type annotations for all data models
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 1.1 Write property test for data model serialization

  - **Property 19: Round trip preserves pipeline structure**
  - **Validates: Requirements 8.1, 8.2, 9.1, 9.2**

- [ ] 2. Implement PathCalculator class

  - Create PathCalculator class with orthogonal path calculation algorithm
  - Implement generateSVGPath method to convert waypoints to SVG path strings with cubic bezier corners
  - Implement checkCollision method to detect path-node intersections
  - Implement calculateAvoidancePath method for routing around obstacles
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 4.2, 4.4_

- [ ] 2.1 Write property test for orthogonal path generation

  - **Property 8: Pipe paths use only orthogonal segments**
  - **Validates: Requirements 4.4**

- [ ] 2.2 Write property test for cubic bezier corners

  - **Property 9: Pipe corners use cubic bezier curves**
  - **Validates: Requirements 4.2**

- [ ] 2.3 Write property test for collision avoidance

  - **Property 10: Collision avoidance produces non-intersecting paths**
  - **Validates: Requirements 6.1, 6.2**

- [ ] 2.4 Write property test for optimal path selection

  - **Property 11: Optimal path selection minimizes waypoints**
  - **Validates: Requirements 6.3**

- [ ] 3. Implement ConnectionTracker class

  - Create ConnectionTracker class to manage connection point allocation
  - Implement registerConnection and unregisterConnection methods
  - Implement getConnectionPoint method with spacing calculation (minimum 30px)
  - Implement even distribution algorithm across node edges
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 3.1 Write property test for connection point spacing

  - **Property 6: Connection point spacing maintains minimum distance**
  - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ] 3.2 Write property test for even distribution

  - **Property 7: Connection points distribute evenly**
  - **Validates: Requirements 5.4**

- [ ] 4. Implement PipeNode web component

  - Create PipeNode custom element extending HTMLElement
  - Implement connection point display logic (show on hover)
  - Implement position getter and setter methods
  - Implement getBounds method for collision detection
  - Add CSS styling for nodes, connection points, and hover states
  - _Requirements: 2.1, 1.5_

- [ ] 5. Implement NodeManager class

  - Create NodeManager class to handle node lifecycle
  - Implement createNode method to instantiate PipeNode elements
  - Implement moveNode method to update node positions
  - Implement deleteNode method with cleanup
  - Implement getNodeBounds method for collision detection
  - _Requirements: 1.1, 1.4, 1.5_

- [ ] 5.1 Write property test for node positioning

  - **Property 3: Nodes can be positioned freely**
  - **Validates: Requirements 1.5**

- [ ] 5.2 Write property test for position persistence

  - **Property 2: Node position persists after drag**
  - **Validates: Requirements 1.4**

- [ ] 6. Implement PipeManager class

  - Create PipeManager class to handle pipe lifecycle
  - Implement startPipeCreation method for temporary pipe rendering
  - Implement updateTempPipe method to follow mouse cursor
  - Implement finishPipeCreation method with automatic side detection
  - Implement deletePipe method with cleanup
  - Implement redrawPipe and redrawNodePipes methods
  - Create SVG layer structure with proper z-index and pointer-events
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 7.2, 7.3, 7.4, 7.5_

- [ ] 6.1 Write property test for automatic side detection

  - **Property 4: Connection side determination is automatic and consistent**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [ ] 6.2 Write property test for side updates on position change

  - **Property 5: Connection side updates when positions change**
  - **Validates: Requirements 3.5**

- [ ] 6.3 Write property test for pipe deletion cleanup

  - **Property 13: Pipe deletion cleans up all references**
  - **Validates: Requirements 7.3, 7.4, 7.5**

- [ ] 7. Implement InteractionHandler class

  - Create InteractionHandler class for user input coordination
  - Implement node drag handlers using requestAnimationFrame for 60fps
  - Implement connection point click handlers for pipe creation
  - Implement keyboard shortcut handlers (Delete, Ctrl+Z)
  - Add debouncing for path recalculation (16ms)
  - _Requirements: 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 7.1 Write property test for 60fps drag performance

  - **Property 1: Node drag triggers pipe recalculation at 60fps**
  - **Validates: Requirements 1.2, 1.3**

- [ ] 7.2 Write property test for collision rechecking on move

  - **Property 12: Node movement triggers collision rechecking**
  - **Validates: Requirements 6.4**

- [ ] 8. Implement PipelineCanvas coordinator class

  - Create PipelineCanvas class as main coordinator
  - Initialize all subsystems (NodeManager, PipeManager, ConnectionTracker, PathCalculator, InteractionHandler)
  - Implement addNode and createPipe public API methods
  - Implement deleteNode and deletePipe public API methods
  - Wire up event communication between subsystems
  - _Requirements: 1.1, 2.4, 7.2_

- [ ] 9. Implement export functionality

  - Add export method to PipelineCanvas
  - Serialize all nodes with IDs, types, positions, and configurations
  - Serialize all pipes with source, target, sides, and paths
  - Include pipeline metadata (ID, title, timestamps)
  - Validate unique IDs in exported JSON
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 9.1 Write property test for export completeness

  - **Property 14: Export serializes complete pipeline data**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

- [ ] 9.2 Write property test for unique ID generation

  - **Property 15: Export generates unique IDs**
  - **Validates: Requirements 8.5**

- [ ] 10. Implement import functionality

  - Add import method to PipelineCanvas
  - Clear existing canvas before import
  - Parse and validate JSON structure
  - Create nodes from imported data
  - Create pipes from imported data
  - Recalculate all pipe paths to match node positions
  - Handle invalid JSON with error messages
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 10.1 Write property test for import structure creation

  - **Property 16: Import creates complete pipeline structure**
  - **Validates: Requirements 9.1, 9.2**

- [ ] 10.2 Write property test for path recalculation on import

  - **Property 17: Import recalculates pipe paths**
  - **Validates: Requirements 9.3**

- [ ] 10.3 Write property test for canvas clearing

  - **Property 18: Import clears existing canvas**
  - **Validates: Requirements 9.5**

- [ ] 11. Add pipe styling and visual effects

  - Implement CSS for 10px stroke width pipes
  - Add drop shadow filter for depth perception
  - Add decorative joint overlay elements at elbows
  - Implement hover effects (color change, delete icon display)
  - Add smooth transitions for visual feedback
  - _Requirements: 4.1, 4.3, 4.5, 7.1_

- [ ] 12. Implement performance optimizations

  - Add viewport culling for off-screen pipes
  - Implement connection point position caching
  - Implement SVG path string caching
  - Add frame rate monitoring and throttling
  - _Requirements: 1.2_

- [ ] 13. Add error handling and validation

  - Implement node creation error handling (invalid type, position clamping)
  - Implement pipe creation error handling (self-connection, duplicate detection)
  - Implement path calculation fallbacks (timeout, invalid waypoints)
  - Implement import error handling (invalid JSON, missing fields)
  - Add user-facing error messages
  - _Requirements: All error scenarios from design document_

- [ ] 14. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Add integration tests

  - Test full pipeline creation flow (create nodes, connect pipes, verify output)
  - Test drag and drop with position updates and pipe recalculation
  - Test export-import round trip with structure verification
  - Test performance with large pipelines (50+ nodes)

- [ ] 16. Add visual regression tests

  - Capture baseline screenshots of various pipeline configurations
  - Test pipe rendering (corners, joints, shadows)
  - Test node positioning and connection points
  - Set up automated visual comparison

- [ ] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
