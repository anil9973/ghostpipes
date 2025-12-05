# Requirements Document

## Introduction

This feature involves converting static HTML node configuration cards in the pipeline builder canvas into reactive Om.js web components. The node cards represent different pipeline operations (filter, transform, HTTP fetch, etc.) and need to be converted from static HTML to dynamic, reactive web components that support two-way data binding and proper state management.

## Glossary

- **Node Card**: A UI component representing a pipeline operation node with configuration options
- **Om.js**: The reactive framework used for building web components with automatic two-way binding
- **Pipeline Canvas**: The main workspace where users build and configure data pipelines
- **Node Configuration**: The settings and parameters for a specific pipeline node
- **Popover**: A floating UI element that displays node configuration options
- **Reactive State**: Data that automatically updates the UI when changed

## Requirements

### Requirement 1

**User Story:** As a developer, I want node configuration cards to be reactive web components, so that UI updates automatically when configuration data changes.

#### Acceptance Criteria

1. WHEN a node configuration is modified THEN the system SHALL update the UI automatically without manual DOM manipulation
2. WHEN a NodeData object is passed to a component THEN the system SHALL make it reactive using Om.js react() function
3. WHEN configuration properties change THEN the system SHALL reflect changes in all bound UI elements immediately
4. WHEN a component is instantiated THEN the system SHALL accept NodeData as a constructor parameter
5. WHEN rendering form fields THEN the system SHALL use arrow functions for reactive binding (e.g., .value=${() => this.nodeData.config.propName})

### Requirement 2

**User Story:** As a developer, I want proper component structure following Om.js patterns, so that components are maintainable and follow framework conventions.

#### Acceptance Criteria

1. WHEN defining a web component THEN the system SHALL set popover and className properties directly in the constructor
2. WHEN organizing component code THEN the system SHALL place connectedCallback as the last method in the class
3. WHEN binding event handlers THEN the system SHALL use .bind(this) instead of arrow function wrappers
4. WHEN accessing reactive state THEN the system SHALL avoid destructuring that breaks reactivity
5. WHEN rendering templates THEN the system SHALL not include HTML comments inside html`` template literals

### Requirement 3

**User Story:** As a developer, I want to convert filter node configuration to a web component, so that filter rules can be managed reactively.

#### Acceptance Criteria

1. WHEN creating a FilterDataNodeCard THEN the system SHALL extend HTMLElement
2. WHEN initializing filter configuration THEN the system SHALL create a Rule class with id, enabled, field, operator, and value properties
3. WHEN displaying filter rules THEN the system SHALL render a table with reactive rows using FilterRuleTabRow components
4. WHEN no rules exist THEN the system SHALL display table header and one empty row
5. WHEN rules are present THEN the system SHALL add an empty row at the end for new rule entry
6. WHEN a user completes a row THEN the system SHALL automatically add a new empty row
7. WHEN rendering property options THEN the system SHALL populate datalist elements dynamically from properties array
8. WHEN a rule is removed THEN the system SHALL splice it from the rules array and maintain empty row

### Requirement 4

**User Story:** As a developer, I want to create input node components (manual upload, file watch, HTTP fetch), so that users can configure data input sources.

#### Acceptance Criteria

1. WHEN creating ManualUploadNodeCard THEN the system SHALL provide file type selection using multi-chip-select-field
2. WHEN creating FileWatchNodeCard THEN the system SHALL include directory picker and file type filter
3. WHEN creating HttpFetchNodeCard THEN the system SHALL provide URL input, method selection, and header/query configuration
4. WHEN rendering these components THEN the system SHALL follow the same structure pattern as FilterDataNodeCard
5. WHEN user edits configuration THEN the system SHALL use Om.js two-way binding without manual @input handlers

### Requirement 5

**User Story:** As a developer, I want a reusable NodeConfigHeader component, so that all node cards have consistent header UI.

#### Acceptance Criteria

1. WHEN creating NodeConfigHeader THEN the system SHALL accept icon and title as props
2. WHEN user clicks save button THEN the system SHALL fire an "update" custom event
3. WHEN user clicks close button THEN the system SHALL call hidePopover() on parent element
4. WHEN rendering header THEN the system SHALL display icon, title, and action buttons
5. WHEN firing events THEN the system SHALL use global fireEvent helper instead of dispatchEvent

### Requirement 6

**User Story:** As a developer, I want table row components for dynamic lists, so that rule lists and similar data can be rendered efficiently.

#### Acceptance Criteria

1. WHEN creating FilterRuleTabRow THEN the system SHALL extend HTMLTableRowElement
2. WHEN rendering row cells THEN the system SHALL use reactive bindings for all form inputs
3. WHEN binding select options THEN the system SHALL use .value=${() => item.type} syntax
4. WHEN binding checkboxes THEN the system SHALL use ?checked=${() => item.enabled} syntax
5. WHEN inserting cells THEN the system SHALL use insertCell() method with html`` templates

### Requirement 7

**User Story:** As a developer, I want proper data model classes, so that node configuration has type safety and structure.

#### Acceptance Criteria

1. WHEN defining NodeData class THEN the system SHALL include id, type, title, icon, config, posX, posY, and summary properties
2. WHEN defining Rule class THEN the system SHALL include id, enabled, field, operator, and value properties with defaults
3. WHEN instantiating data models THEN the system SHALL use constructor parameters for initialization
4. WHEN passing data to components THEN the system SHALL wrap in react() for reactivity
5. WHEN accessing nested properties THEN the system SHALL use direct property access to maintain reactivity

### Requirement 8

**User Story:** As a developer, I want to eliminate anti-patterns from the codebase, so that components follow Om.js best practices.

#### Acceptance Criteria

1. WHEN binding events THEN the system SHALL not use arrow function wrappers like @click=${() => this.handler()}
2. WHEN accessing state THEN the system SHALL not destructure reactive objects
3. WHEN rendering templates THEN the system SHALL not include inline styles
4. WHEN using global helpers THEN the system SHALL use fireEvent and $on instead of native APIs
5. WHEN looping over arrays THEN the system SHALL use map() helper from Om.js
