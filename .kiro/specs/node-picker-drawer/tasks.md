# Implementation Plan

- [x] 1. Set up icon sprite file

  - Create `/assets/icons.svg` with SVG sprite structure
  - Copy all icon symbols from `.kiro/reference/assets/icons.svg`
  - Ensure proper namespace and display:none styling
  - _Requirements: 2.4, 2.5_

- [x] 2. Create NodeCard component

- [x] 2.1 Create `pipelines/components/editor/drawer/node-card.js`

  - Define NodeCard class extending HTMLElement
  - Add properties: nodeType, iconId, title, subtitle
  - Implement render() method using Om.js html template
  - Create SVG icon with `<use>` element referencing sprite
  - Add title and subtitle in column layout
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [x] 2.2 Add click event handler

  - Implement handleClick() method
  - Dispatch 'node-selected' CustomEvent with node metadata
  - Bind event handler in render method
  - _Requirements: 3.1, 3.2_

- [x] 2.3 Add hover and accessibility features

  - Add CSS classes for hover states
  - Set tabindex="0" for keyboard navigation
  - Add ARIA labels for screen readers
  - _Requirements: 3.3, 3.4_

- [x] 3. Create category section components

- [x] 3.1 Create base category component structure

  - Create `pipelines/components/editor/drawer/input-resources.js`
  - Define InputResources class extending HTMLDetailsElement
  - Implement render() method with summary and ul elements
  - Add category icon and label in summary
  - _Requirements: 1.1, 1.2, 4.1, 4.2_

- [x] 3.2 Create DataOperations component

  - Create `pipelines/components/editor/drawer/data-operations.js`
  - Extend HTMLDetailsElement
  - Implement render() with data operations icon
  - Add "Show All" nested details for advanced nodes
  - _Requirements: 1.1, 1.2, 4.1_

- [x] 3.3 Create OutputDestinations component

  - Create `pipelines/components/editor/drawer/output-destinations.js`
  - Extend HTMLDetailsElement
  - Implement render() with output icon
  - _Requirements: 1.1, 1.2, 4.1_

- [x] 3.4 Add toggle event handlers

  - Implement handleToggle() method in each category
  - Listen for native 'toggle' event
  - Maintain expanded state
  - _Requirements: 1.4, 4.3, 4.4_

- [x] 4. Update NodePickerDrawer component

- [x] 4.1 Update `pipelines/components/editor/drawer/node-picker-drawer.js`

  - Import Om.js html helper
  - Import NodeCard component
  - Import all category components
  - _Requirements: 1.5_

- [x] 4.2 Implement render method

  - Create AI Piper Witch node card (standalone)
  - Instantiate InputResources category with node cards
  - Instantiate DataOperations category with node cards
  - Instantiate OutputDestinations category with node cards
  - Return array of elements
  - _Requirements: 1.1, 1.3, 1.5_

- [x] 4.3 Add event delegation

  - Implement handleNodeSelected() method
  - Listen for 'node-selected' events from node cards
  - Dispatch 'addnode' CustomEvent to parent
  - Include node metadata in event detail
  - _Requirements: 3.1, 3.2_

- [x] 5. Populate node cards with data

- [x] 5.1 Add Manual Input subcategory nodes

  - Create node card for "Paste text / Upload file"
  - Create node card for "Selected data from extension"
  - Use manual-input and extension-data icons
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 5.2 Add HTTP Request subcategory nodes

  - Create node card for "One-time fetch" (http-fetch icon)
  - Create node card for "Scheduled" (scheduled icon)
  - Create node card for "Conditional" (conditional icon)
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 5.3 Add standalone input nodes

  - Create node card for "File Watch" (file-watch icon)
  - Create node card for "Webhook" (webhook icon)
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 5.4 Add data operations nodes

  - Create node cards for: Filter, Transform, Join, Split, Deduplicate, Validate, Aggregate, Lookup, Condition, Parse, Format
  - Use corresponding icons from sprite
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 5.5 Add advanced data operations (Show All section)

  - Create node cards for: Union/Intersect/Distinct, String operations, Loop, Switch, Until
  - Nest inside "Show All" details element
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 5.6 Add output destination nodes

  - Create node card for "Download" (download icon)
  - Create node card for "File Append" (file-append icon)
  - Create node card for "HTTP POST" (http-post icon)
  - Create node card for "Email" (email icon)
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 6. Style components

- [x] 6.1 Create component styles

  - Add styles for node-card component
  - Add hover effects with neon green accent
  - Add focus indicators for accessibility
  - Use CSS custom properties from design system
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6.2 Style category sections

  - Add styles for details/summary elements
  - Style category icons and labels
  - Add expand/collapse indicators
  - Ensure proper spacing and typography
  - _Requirements: 5.1, 5.3_

- [x] 7. Register custom elements

- [x] 7.1 Register all components

  - Call customElements.define() for NodeCard
  - Call customElements.define() for InputResources
  - Call customElements.define() for DataOperations
  - Call customElements.define() for OutputDestinations
  - Ensure proper element names (kebab-case)
  - _Requirements: 1.5, 2.1, 4.1_

- [x] 8. Integration and testing

- [x] 8.1 Import components in pipeline builder

  - Add script imports to pipeline-builder.html
  - Ensure proper load order
  - _Requirements: 1.5_

- [x] 8.2 Test node selection flow

  - Click node card → verify 'node-selected' event
  - Verify 'addnode' event reaches canvas
  - Test with multiple node types
  - _Requirements: 3.1, 3.2, 3.5_

- [x] 8.3 Test category interactions

  - Expand/collapse categories
  - Test multiple categories open simultaneously
  - Verify state persistence
  - _Requirements: 1.2, 1.4_

- [x] 8.4 Test keyboard navigation

  - Tab through node cards
  - Enter/Space to select nodes
  - Arrow keys for navigation
  - _Requirements: 3.4_

- [x] 8.5 Test icon rendering
  - Verify all icons load from sprite
  - Check icon sizing and colors
  - Test fallback for missing icons
  - _Requirements: 2.4, 2.5_
