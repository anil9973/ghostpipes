# Implementation Plan

- [x] 1. Create core data model classes

  - Create NodeData and Rule classes with proper initialization and serialization
  - Implement toJSON methods for persistence
  - _Requirements: 2.1, 2.5, 3.1, 3.2, 3.3, 3.4_

- [x] 1.1 Write property test for NodeData completeness

  - **Property 3: NodeData completeness**
  - **Validates: Requirements 2.1**

- [x] 1.2 Write property test for NodeData serialization round-trip

  - **Property 4: NodeData serialization round-trip**
  - **Validates: Requirements 2.5**

- [x] 1.3 Write property test for Rule completeness

  - **Property 5: Rule completeness**
  - **Validates: Requirements 3.1**

- [x] 1.4 Write property test for Rule ID uniqueness

  - **Property 6: Rule ID uniqueness**
  - **Validates: Requirements 3.2**

- [x] 2. Create NodeConfigHeader reusable component

  - Implement header component with icon, title, and action buttons
  - Add save and close event handlers
  - Wire up fireEvent for custom events
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 13.1, 13.3_

- [x] 2.1 Write property test for save button event dispatch

  - **Property 8: Save button event dispatch**
  - **Validates: Requirements 5.2**

- [x] 2.2 Write property test for event detail propagation

  - **Property 17: Event detail propagation**
  - **Validates: Requirements 13.3**

- [x] 2.3 Write property test for event bubbling

  - **Property 18: Event bubbling**
  - **Validates: Requirements 13.5**

- [x] 3. Create FilterRuleTabRow table row component

  - Extend HTMLTableRowElement for filter rules
  - Implement dual binding for checkbox, select, and input elements
  - Add remove button with event handler
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 8.2, 8.4_

- [x] 3.1 Write property test for checkbox dual binding

  - **Property 9: Checkbox dual binding**
  - **Validates: Requirements 6.4**

- [x] 3.2 Write property test for select dual binding

  - **Property 10: Select dual binding**
  - **Validates: Requirements 6.5, 8.4**

- [x] 4. Create FilterDataNodeCard component

  - Implement filter node configuration with reactive state
  - Add mode and matchType selects with dual binding
  - Implement dynamic rule table with FilterRuleTabRow components
  - Add ensureEmptyRow logic for automatic empty row management
  - Implement validation and save logic
  - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 7.4, 7.5, 9.1, 9.2, 9.3, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5, 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 4.1 Write property test for component reactivity

  - **Property 1: Component reactivity**
  - **Validates: Requirements 1.2, 2.4**

- [x] 4.2 Write property test for dual binding round-trip

  - **Property 2: Dual binding round-trip**
  - **Validates: Requirements 1.3, 6.3, 8.2**

- [x] 4.3 Write property test for array reactivity preservation

  - **Property 7: Array reactivity preservation**
  - **Validates: Requirements 3.5**

- [x] 4.4 Write property test for datalist reactivity

  - **Property 12: Datalist reactivity**
  - **Validates: Requirements 9.2, 9.3**

- [x] 4.5 Write property test for datalist ID uniqueness

  - **Property 13: Datalist ID uniqueness**
  - **Validates: Requirements 9.5**

- [x] 4.6 Write property test for empty row invariant

  - **Property 14: Empty row invariant**
  - **Validates: Requirements 10.1, 10.2, 10.4**

- [x] 4.7 Write property test for dynamic row addition

  - **Property 15: Dynamic row addition**
  - **Validates: Requirements 10.3**

- [x] 4.8 Write property test for empty rule filtering on save

  - **Property 16: Empty rule filtering on save**
  - **Validates: Requirements 10.5**

- [x] 5. Create MultiChipSelectField component

  - Implement multi-select with chip visualization
  - Add selection and removal handlers
  - Implement filtering logic for datalist
  - Add keyboard support for Enter key
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 5.1 Write property test for MultiChipSelectField selection

  - **Property 19: MultiChipSelectField selection**
  - **Validates: Requirements 14.2**

- [x] 5.2 Write property test for MultiChipSelectField removal

  - **Property 20: MultiChipSelectField removal**
  - **Validates: Requirements 14.3**

- [x] 5.3 Write property test for MultiChipSelectField filtering

  - **Property 21: MultiChipSelectField filtering**
  - **Validates: Requirements 14.4**

- [x] 5.4 Write property test for MultiChipSelectField keyboard entry

  - **Property 22: MultiChipSelectField keyboard entry**
  - **Validates: Requirements 14.5**

- [x] 6. Create ManualUploadNodeCard component

  - Implement manual input node configuration
  - Add file upload and text paste options
  - Use dual binding for all form fields
  - Wire up NodeConfigHeader
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 7.4, 7.5, 8.1, 8.2, 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 6.1 Write property test for textarea dual binding

  - **Property 11: Textarea dual binding**
  - **Validates: Requirements 8.5**

- [x] 7. Create FileWatchNodeCard component

  - Implement file watch node configuration
  - Add path, pattern, and recursive options
  - Add event type multi-select
  - Use dual binding for all form fields
  - Wire up NodeConfigHeader
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 7.4, 7.5, 8.1, 8.2, 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 8. Create HttpFetchNodeCard component

  - Implement HTTP request node configuration
  - Add URL, method, headers, and body fields
  - Add timeout configuration
  - Use dual binding for all form fields
  - Wire up NodeConfigHeader
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 7.4, 7.5, 8.1, 8.2, 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 9. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Update pipeline canvas to use new components

  - Replace static HTML node cards with web components
  - Update event listeners to handle new custom events
  - Test popover behavior with new components
  - Verify data persistence works with NodeData serialization
  - _Requirements: 1.1, 1.2, 1.3, 2.4, 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 11. Add error handling and validation

  - Implement validation logic in FilterDataNodeCard
  - Add error event dispatching
  - Add try-catch blocks in event handlers
  - Display validation errors to users
  - _Requirements: All error handling requirements_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
