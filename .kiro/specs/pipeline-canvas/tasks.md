# Implementation Plan

- [x] 1. Create shared data model classes

  - Create NodeData and Rule classes in shared directory
  - Implement constructor with initialization parameters
  - Add default values for all properties
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 1.1 Write property test for NodeData structure

  - **Property 10: NodeData structure completeness**
  - **Validates: Requirements 7.1**

- [x] 1.2 Write property test for Rule structure

  - **Property 3: Rule data model structure**
  - **Validates: Requirements 3.2, 7.2**

- [x] 1.3 Write property test for data model initialization

  - **Property 11: Data model initialization**
  - **Validates: Requirements 7.3**

- [x] 2. Create NodeConfigHeader component

  - Implement reusable header component extending HTMLElement
  - Add icon and title props handling
  - Implement save and close button handlers
  - Use fireEvent for custom events
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x]\* 2.1 Write property test for NodeConfigHeader props

  - **Property 7: NodeConfigHeader props acceptance**
  - **Validates: Requirements 5.1, 5.4**

- [x]\* 2.2 Write property test for save button event

  - **Property 8: Save button event firing**
  - **Validates: Requirements 5.2**

- [x]\* 2.3 Write property test for close button behavior

  - **Property 9: Close button behavior**
  - **Validates: Requirements 5.3**

- [x] 3. Create FilterRuleTabRow component

  - Extend HTMLTableRowElement for table row rendering
  - Implement reactive bindings for checkbox, inputs, and select
  - Add remove button handler
  - Use insertCell() for cell creation
  - _Requirements: 6.1, 6.2, 6.5_

- [x] 4. Create FilterDataNodeCard component

  - Extend HTMLElement with popover and className setup
  - Wrap NodeData in react() for reactivity
  - Implement ensureEmptyRow() logic
  - Render mode and matchType selects with reactive bindings
  - Render rule table using map() helper
  - Render datalist with dynamic properties
  - Add NodeConfigHeader to component
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 3.1, 3.2, 3.3, 3.7_

- [x]\* 4.1 Write property test for reactive data propagation

  - **Property 1: Reactive data propagation**
  - **Validates: Requirements 1.1, 1.2, 1.3, 7.4**

- [x]\* 4.2 Write property test for component constructor API

  - **Property 2: Component constructor API**
  - **Validates: Requirements 1.4**

- [x]\* 4.3 Write property test for empty row maintenance

  - **Property 4: Empty row maintenance**
  - **Validates: Requirements 3.5, 3.6**

- [x]\* 4.4 Write property test for rule removal

  - **Property 5: Rule removal preserves invariants**
  - **Validates: Requirements 3.8**

- [x]\* 4.5 Write property test for datalist population

  - **Property 6: Datalist population**
  - **Validates: Requirements 3.7**

- [x]\* 4.6 Write unit tests for FilterDataNodeCard

  - Test empty rule list edge case (3.4)
  - Test component structure (3.3)
  - Test error handling for invalid data

- [x] 5. Create ManualUploadNodeCard component

  - Extend HTMLElement with popover and className
  - Wrap NodeData in react()
  - Implement file type selection using MultiChipSelectField
  - Add NodeConfigHeader
  - Use reactive bindings for configuration
  - _Requirements: 4.1, 4.5_

- [x]\* 5.1 Write unit test for ManualUploadNodeCard structure

  - Test component has MultiChipSelectField
  - Test file type configuration
  - **Validates: Requirements 4.1**

- [x] 6. Create FileWatchNodeCard component

  - Extend HTMLElement with popover and className
  - Wrap NodeData in react()
  - Implement directory picker UI
  - Implement file type filter using MultiChipSelectField
  - Add NodeConfigHeader
  - Use reactive bindings for configuration
  - _Requirements: 4.2, 4.5_

- [x]\* 6.1 Write unit test for FileWatchNodeCard structure

  - Test component has directory picker
  - Test component has file type filter
  - **Validates: Requirements 4.2**

- [x] 7. Create HttpFetchNodeCard component

  - Extend HTMLElement with popover and className
  - Wrap NodeData in react()
  - Implement URL input with method select
  - Implement TabularCarousel for headers and query params
  - Add dynamic table rows for headers and query parameters
  - Add NodeConfigHeader
  - Use reactive bindings for all configuration
  - _Requirements: 4.3, 4.5_

- [x]\* 7.1 Write unit test for HttpFetchNodeCard structure

  - Test component has URL input
  - Test component has method selection
  - Test component has header/query configuration
  - **Validates: Requirements 4.3**

- [x] 8. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Integrate components into pipeline builder

  - Import all node card components
  - Update pipeline builder to use new components
  - Replace static HTML with component instantiation
  - Wire up event handlers for save/close actions
  - Test component rendering on canvas
  - _Requirements: All_

- [x]\* 9.1 Write integration tests

  - Test filter node workflow (add/remove rules)
  - Test component communication (save/close events)
  - Test reactive updates across components

- [x] 10. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
