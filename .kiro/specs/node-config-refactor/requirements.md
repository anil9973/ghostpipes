# Requirements Document

## Introduction

This document specifies the requirements for refactoring the pipeline canvas node configuration system. The current implementation uses static HTML elements for node configuration cards. This refactor will convert all node configuration cards to reactive web components using the Om.js framework, enabling better state management, reactivity, and maintainability.

## Glossary

- **Node Configuration Card**: A popover UI component that allows users to configure settings for a specific pipeline node
- **Om.js**: The reactive UI framework used in GhostPipes for building web components
- **NodeData**: A reactive data class that holds node configuration state including id, position, and config properties
- **Rule**: A data structure representing a single filter/validation rule with fields like enabled, field, operator, and value
- **Dual Binding**: Om.js feature where input values automatically sync with state without explicit event handlers
- **Reactivity**: The ability of UI components to automatically update when underlying data changes

## Requirements

### Requirement 1

**User Story:** As a developer, I want node configuration cards to be reactive web components, so that state changes automatically update the UI without manual DOM manipulation.

#### Acceptance Criteria

1. WHEN a node configuration card is instantiated THEN the system SHALL create a web component with reactive state using Om.js
2. WHEN node configuration data changes THEN the system SHALL automatically update all bound UI elements
3. WHEN a user modifies an input field THEN the system SHALL update the NodeData configuration through dual binding
4. WHEN the component renders THEN the system SHALL use arrow functions for all reactive expressions in templates
5. WHEN event handlers are bound THEN the system SHALL use `.bind(this)` syntax instead of arrow function wrappers

### Requirement 2

**User Story:** As a developer, I want a standardized NodeData class structure, so that all node configurations follow a consistent data model.

#### Acceptance Criteria

1. WHEN a NodeData instance is created THEN the system SHALL include properties for id, posX, posY, summary, and config
2. WHEN NodeData is passed to a component constructor THEN the system SHALL wrap it with `react()` to enable reactivity
3. WHEN accessing NodeData properties in templates THEN the system SHALL use direct property access without destructuring
4. WHEN NodeData is modified THEN the system SHALL trigger reactive updates in all bound components
5. WHEN serializing NodeData THEN the system SHALL produce valid JSON for storage and transmission

### Requirement 3

**User Story:** As a developer, I want a Rule class for filter configurations, so that rule data has a consistent structure across all filter nodes.

#### Acceptance Criteria

1. WHEN a Rule instance is created THEN the system SHALL initialize with properties: id, enabled, field, operator, and value
2. WHEN a Rule is added to a filter THEN the system SHALL assign a unique timestamp-based id
3. WHEN a Rule is created THEN the system SHALL set enabled to true by default
4. WHEN a Rule is created THEN the system SHALL initialize field, operator, and value with empty or default values
5. WHEN Rules are stored in an array THEN the system SHALL maintain reactivity for array operations

### Requirement 4

**User Story:** As a developer, I want to convert manual-upload, file-watch, and http-fetch node cards to web components, so that input nodes follow the new reactive pattern.

#### Acceptance Criteria

1. WHEN converting a node card THEN the system SHALL create a web component extending HTMLElement
2. WHEN the component constructor is called THEN the system SHALL set popover and className properties directly
3. WHEN the component is initialized THEN the system SHALL accept NodeData as a constructor parameter
4. WHEN rendering form fields THEN the system SHALL bind input values using `.value=${() => this.props.config.propName}` syntax
5. WHEN the component is connected to DOM THEN the system SHALL place connectedCallback as the last method in the class

### Requirement 5

**User Story:** As a developer, I want a reusable NodeConfigHeader component, so that all node configuration cards have consistent header UI and behavior.

#### Acceptance Criteria

1. WHEN NodeConfigHeader is instantiated THEN the system SHALL accept icon and title as props
2. WHEN the save button is clicked THEN the system SHALL dispatch an "update" custom event
3. WHEN the close button is clicked THEN the system SHALL call hidePopover on the parent element
4. WHEN rendering the header THEN the system SHALL display an icon, title, and action buttons
5. WHEN action buttons are rendered THEN the system SHALL include save (check-all icon) and close (close icon) buttons

### Requirement 6

**User Story:** As a developer, I want filter rule tables to use reactive table row components, so that rule lists update efficiently when data changes.

#### Acceptance Criteria

1. WHEN creating a table row THEN the system SHALL extend HTMLTableRowElement
2. WHEN a row is instantiated THEN the system SHALL accept rowData as a constructor parameter
3. WHEN rendering table cells THEN the system SHALL use dual binding for input and select elements
4. WHEN checkbox state changes THEN the system SHALL update the rule's enabled property automatically
5. WHEN select values change THEN the system SHALL update the corresponding rule properties automatically

### Requirement 7

**User Story:** As a developer, I want to eliminate inline styles from components, so that styling is managed through CSS classes.

#### Acceptance Criteria

1. WHEN rendering components THEN the system SHALL use className properties instead of inline style attributes
2. WHEN components need styling THEN the system SHALL reference external CSS files
3. WHEN dynamic styling is needed THEN the system SHALL toggle CSS classes rather than manipulate style properties
4. WHEN popover elements are created THEN the system SHALL set className to "node-config-popup"
5. WHEN components are initialized THEN the system SHALL set popover property to empty string for manual popover mode

### Requirement 8

**User Story:** As a developer, I want to use Om.js dual binding for form inputs, so that I don't need to write manual input event handlers.

#### Acceptance Criteria

1. WHEN binding input values THEN the system SHALL use `.value=${() => this.props.config.property}` syntax
2. WHEN input values change THEN the system SHALL automatically update the bound property
3. WHEN checkbox states change THEN the system SHALL use `?checked=${() => this.props.config.property}` syntax
4. WHEN select options change THEN the system SHALL automatically update the bound property
5. WHEN textarea content changes THEN the system SHALL automatically update the bound property

### Requirement 9

**User Story:** As a developer, I want dynamic property lists in datalist elements, so that users see relevant autocomplete options based on available data.

#### Acceptance Criteria

1. WHEN rendering a datalist THEN the system SHALL use the `map()` helper to iterate over properties
2. WHEN properties are passed to a node THEN the system SHALL make them available in the datalist
3. WHEN the properties array changes THEN the system SHALL reactively update the datalist options
4. WHEN rendering datalist options THEN the system SHALL use the template syntax `html\`<option value=${prop}></option>\``
5. WHEN multiple datalists exist THEN the system SHALL assign unique id attributes for proper association

### Requirement 10

**User Story:** As a developer, I want filter nodes to automatically manage empty rows, so that users always have a row available for adding new rules.

#### Acceptance Criteria

1. WHEN a filter node is initialized THEN the system SHALL call ensureEmptyRow to add an empty rule if needed
2. WHEN all rules have values THEN the system SHALL append a new empty Rule instance to the array
3. WHEN a user inputs data in the last row THEN the system SHALL trigger ensureEmptyRow to add another empty row
4. WHEN a rule is removed THEN the system SHALL call ensureEmptyRow to maintain at least one empty row
5. WHEN saving configuration THEN the system SHALL filter out empty rules before persisting

### Requirement 11

**User Story:** As a developer, I want to avoid destructuring reactive state in render methods, so that reactivity is preserved throughout the component lifecycle.

#### Acceptance Criteria

1. WHEN accessing reactive properties THEN the system SHALL use direct property access like `this.props.config.mode`
2. WHEN rendering templates THEN the system SHALL NOT destructure state objects with `const { config } = this.props`
3. WHEN binding to template expressions THEN the system SHALL use arrow functions that access properties directly
4. WHEN passing data to child components THEN the system SHALL pass reactive objects without destructuring
5. WHEN reading nested properties THEN the system SHALL use dot notation throughout the property chain

### Requirement 12

**User Story:** As a developer, I want event handlers to use proper Om.js binding syntax, so that components follow framework conventions and maintain correct context.

#### Acceptance Criteria

1. WHEN binding click events THEN the system SHALL use `@click=${this.handleMethod.bind(this)}` syntax
2. WHEN binding input events THEN the system SHALL use `@input=${this.handleMethod.bind(this)}` syntax only when custom logic is needed
3. WHEN passing parameters to handlers THEN the system SHALL use `@click=${this.handleMethod.bind(this, param)}` syntax
4. WHEN binding events THEN the system SHALL NOT use arrow function wrappers like `@click=${() => this.handleMethod()}`
5. WHEN event handlers receive parameters THEN the system SHALL receive the event object as the last parameter

### Requirement 13

**User Story:** As a developer, I want to use the global fireEvent helper, so that custom event dispatching is consistent across all components.

#### Acceptance Criteria

1. WHEN dispatching custom events THEN the system SHALL use `fireEvent(this, 'event-name', detail)` syntax
2. WHEN events don't need detail data THEN the system SHALL call `fireEvent(this, 'event-name')`
3. WHEN events need detail data THEN the system SHALL pass an object as the third parameter
4. WHEN components dispatch events THEN the system SHALL NOT use `this.dispatchEvent()` directly
5. WHEN events bubble up THEN the system SHALL rely on fireEvent's default bubbling behavior

### Requirement 14

**User Story:** As a developer, I want MultiChipSelectField component for selecting multiple properties, so that users can easily manage multi-value selections with visual chips.

#### Acceptance Criteria

1. WHEN MultiChipSelectField is instantiated THEN the system SHALL accept dataList and selected arrays as parameters
2. WHEN a user selects an item THEN the system SHALL add it to the selected array and display it as a chip
3. WHEN a user clicks a chip's close icon THEN the system SHALL remove the item from the selected array
4. WHEN a user types in the input field THEN the system SHALL filter the datalist to show matching items
5. WHEN a user presses Enter THEN the system SHALL add the input value to selected and clear the input field

### Requirement 15

**User Story:** As a developer, I want all node configuration components to follow a consistent structure, so that the codebase is maintainable and predictable.

#### Acceptance Criteria

1. WHEN creating a component THEN the system SHALL define constructor, event handlers, render method, and connectedCallback in that order
2. WHEN the constructor is defined THEN the system SHALL set popover and className properties before creating reactive state
3. WHEN event handlers are defined THEN the system SHALL place them between constructor and render method
4. WHEN the render method is defined THEN the system SHALL place it before connectedCallback
5. WHEN connectedCallback is defined THEN the system SHALL place it as the last method in the class
