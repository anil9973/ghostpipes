# Requirements Document

## Introduction

The GhostPipes Homepage is the primary entry point for users to create, manage, and execute data automation pipelines. The homepage enables users to describe their automation needs in natural language, leveraging AI to generate pipeline configurations, while providing quick access to existing pipelines and execution controls.

## Glossary

- **Pipeline**: A sequence of connected nodes that process data from input to output
- **Node**: A single operation in a pipeline (e.g., filter, transform, HTTP request)
- **Trigger**: The mechanism that initiates pipeline execution (manual, webhook, or scheduled)
- **Prompt Input Field**: The text area where users describe their automation requirements
- **Pipeline Card**: A visual representation of a pipeline showing its flow
- **Drawer Panel**: A slide-out panel displaying all user pipelines
- **Action Menu**: A dropdown menu with pipeline operations (edit, delete, run)
- **Pipeline Diagram**: A mini visualization showing the sequence of nodes in a pipeline

## Requirements

### Requirement 1

**User Story:** As a user, I want to describe my automation needs in natural language, so that AI can generate a pipeline for me without requiring technical knowledge.

#### Acceptance Criteria

1. WHEN the homepage loads, THE Prompt Input Field SHALL display a contenteditable text area with placeholder text
2. WHEN a user types in the prompt field, THE System SHALL capture the text input in real-time
3. THE Prompt Input Field SHALL provide trigger configuration options (Manual, Webhook, Schedule)
4. WHEN a user selects webhook trigger, THE System SHALL display a URL input field
5. WHEN a user selects schedule trigger, THE System SHALL display frequency and time selection controls
6. WHEN a user clicks the send button, THE System SHALL validate that at least one trigger is selected and prompt text is not empty
7. WHEN validation passes, THE System SHALL call the PipelineGenerator with the user's intent and trigger configuration

### Requirement 2

**User Story:** As a user, I want to see my existing pipelines that match my current input, so that I can reuse or modify them instead of creating duplicates.

#### Acceptance Criteria

1. WHEN pipelines are matched or generated, THE Pipeline Container SHALL become visible
2. THE Pipeline Action Bar SHALL display the count of matched pipelines
3. WHEN no pipeline is selected, THE Pipeline Action Bar SHALL show a "Create Pipeline" button
4. WHEN a pipeline is selected, THE Pipeline Action Bar SHALL show "Edit" and "Run" buttons
5. THE Pipeline List SHALL display pipeline cards in a responsive grid layout
6. WHEN a user clicks a pipeline card, THE System SHALL mark it as selected with visual feedback
7. THE Pipeline Card SHALL display the pipeline name and a mini diagram of its flow

### Requirement 3

**User Story:** As a user, I want to access all my saved pipelines from a drawer panel, so that I can quickly find and manage my automation workflows.

#### Acceptance Criteria

1. WHEN a user clicks the "My Pipes" button in the header, THE Pipelines Drawer Panel SHALL slide in from the left
2. THE Pipelines Drawer Panel SHALL load all pipelines from IndexedDB
3. THE Drawer SHALL provide a search input to filter pipelines by name
4. WHEN a user types in the search field, THE System SHALL filter the pipeline list in real-time
5. THE Drawer SHALL display pipeline cards with action menus
6. WHEN a user clicks the action menu, THE System SHALL show Edit and Delete options
7. WHEN a user clicks outside the drawer or presses Escape, THE Drawer SHALL close

### Requirement 4

**User Story:** As a user, I want to see a visual representation of each pipeline's flow, so that I can quickly understand what operations it performs.

#### Acceptance Criteria

1. THE Pipeline Diagram SHALL display up to 4 nodes in sequence
2. WHEN a pipeline has more than 4 nodes, THE Diagram SHALL show first node, collapsed middle nodes count, and last node
3. THE Diagram SHALL display arrows (⬇︎) between nodes to indicate flow direction
4. THE Diagram SHALL show node type names (e.g., "HTTP Request", "Filter", "Download")
5. THE Diagram SHALL use existing CSS classes for styling without inline styles

### Requirement 5

**User Story:** As a user, I want to perform quick actions on pipelines (edit, run, delete), so that I can manage my automations efficiently.

#### Acceptance Criteria

1. WHEN a user clicks the Edit button, THE System SHALL navigate to the pipeline builder with the selected pipeline loaded
2. WHEN a user clicks the Run button, THE System SHALL execute the selected pipeline immediately
3. WHEN a user clicks Delete in the action menu, THE System SHALL remove the pipeline from IndexedDB
4. WHEN a pipeline is deleted, THE System SHALL update the pipeline list to reflect the change
5. THE System SHALL dispatch custom events for all actions to enable parent component handling

### Requirement 6

**User Story:** As a user, I want the homepage to be responsive and accessible, so that I can use it on any device and with assistive technologies.

#### Acceptance Criteria

1. THE Homepage SHALL display in a 3-column grid on desktop (>1024px)
2. THE Homepage SHALL display in a 2-column grid on tablet (768px-1024px)
3. THE Homepage SHALL display in a single column on mobile (<768px)
4. THE Homepage SHALL support keyboard navigation with Tab, Enter, Space, and Escape keys
5. THE Homepage SHALL provide ARIA labels for all interactive elements
6. THE Homepage SHALL announce state changes to screen readers
7. THE Drawer Panel SHALL be 400px wide on desktop and full-screen on mobile

### Requirement 7

**User Story:** As a user, I want clear error messages when something goes wrong, so that I can understand and fix the issue.

#### Acceptance Criteria

1. WHEN prompt validation fails, THE System SHALL display an error message below the input field
2. WHEN AI generation fails, THE System SHALL display a user-friendly error message
3. WHEN network errors occur, THE System SHALL inform the user to check their connection
4. THE System SHALL auto-dismiss success messages after 5 seconds
5. THE System SHALL keep validation error messages visible until the user corrects the input
6. THE Error messages SHALL use red text with an icon for visibility

### Requirement 8

**User Story:** As a user, I want the interface to follow Om.js reactive patterns, so that the UI updates automatically when data changes.

#### Acceptance Criteria

1. THE System SHALL use Om.js `react()` for all component state
2. THE System SHALL wrap all reactive expressions in arrow functions: `${() => state.value}`
3. THE System SHALL use `.bind(this)` for all event handlers
4. THE System SHALL use Om.js `map()` helper for rendering lists
5. THE System SHALL place `connectedCallback()` as the last method in every component class
6. THE System SHALL use two-way binding with `.value` property for form inputs
7. THE System SHALL NOT use inline styles or Tailwind classes
