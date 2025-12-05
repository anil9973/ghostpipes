# Requirements Document

## Introduction

The Node Picker Drawer Enhancement feature provides a structured, categorized interface for users to select and add different types of pipeline nodes to the canvas. This feature replaces the basic button implementation with a rich, expandable drawer system that organizes nodes by category (Input Resources, Data Operations, Output Destinations) and displays them with descriptive icons, titles, and subtitles.

## Glossary

- **Node Picker Drawer**: The main container component that displays categorized node options
- **Node Card**: A clickable card component representing a single node type with icon, title, and subtitle
- **Category Section**: An expandable details element grouping related node types (e.g., Input Resources)
- **Pipeline Canvas**: The main workspace where nodes are placed and connected
- **SVG Icon Sprite**: A centralized SVG file containing reusable icon definitions

## Requirements

### Requirement 1

**User Story:** As a pipeline builder user, I want to see all available node types organized by category, so that I can quickly find and add the nodes I need.

#### Acceptance Criteria

1. WHEN the Pipeline Builder loads, THE Node Picker Drawer SHALL display all node categories in a collapsed state
2. WHEN a user clicks on a category header, THE Node Picker Drawer SHALL expand that category to reveal node cards
3. THE Node Picker Drawer SHALL display at least three main categories: Input Resources, Data Operations, and Output Destinations
4. WHEN multiple categories are expanded, THE Node Picker Drawer SHALL maintain the expanded state of all categories simultaneously
5. THE Node Picker Drawer SHALL render within the left sidebar of the Pipeline Builder interface

### Requirement 2

**User Story:** As a pipeline builder user, I want each node option to display a clear icon, title, and description, so that I understand what each node does before adding it.

#### Acceptance Criteria

1. WHEN a node card is rendered, THE Node Card Component SHALL display an SVG icon from the icon sprite
2. WHEN a node card is rendered, THE Node Card Component SHALL display a title text describing the node type
3. WHEN a node card is rendered, THE Node Card Component SHALL display a subtitle text providing additional context
4. THE Node Card Component SHALL use icons that match the reference design in `.kiro/reference/assets/icons.svg`
5. WHERE an icon does not exist in the sprite, THE Node Card Component SHALL add the new icon to `/assets/icons.svg` and reference it using the `<use>` element

### Requirement 3

**User Story:** As a pipeline builder user, I want to click on a node card to add that node to my pipeline, so that I can build my workflow efficiently.

#### Acceptance Criteria

1. WHEN a user clicks on a node card, THE Node Card Component SHALL dispatch a custom event containing the node type information
2. WHEN the custom event is dispatched, THE Pipeline Canvas SHALL receive the event and create a new node instance
3. THE Node Card Component SHALL provide visual feedback on hover to indicate it is clickable
4. THE Node Card Component SHALL maintain accessibility by supporting keyboard navigation
5. WHEN a node is successfully added, THE Pipeline Canvas SHALL position the new node at a default location or near the user's cursor

### Requirement 4

**User Story:** As a developer, I want the category sections to extend HTMLDetailsElement, so that I can leverage native browser functionality for expand/collapse behavior.

#### Acceptance Criteria

1. THE Category Section Component SHALL extend HTMLDetailsElement
2. WHEN a category section is created, THE Category Section Component SHALL use the native `<summary>` element for the header
3. THE Category Section Component SHALL support the native `open` attribute for controlling expanded state
4. THE Category Section Component SHALL emit standard `toggle` events when expanded or collapsed
5. THE Category Section Component SHALL maintain semantic HTML structure for accessibility

### Requirement 5

**User Story:** As a pipeline builder user, I want the node picker drawer to follow the project's spooky theme, so that the interface feels cohesive and polished.

#### Acceptance Criteria

1. THE Node Picker Drawer SHALL use CSS custom properties defined in the project's design system
2. THE Node Card Component SHALL apply hover effects with neon green accent color (#00ff88)
3. THE Category Section Component SHALL use appropriate spacing and typography from the base styles
4. THE Node Picker Drawer SHALL maintain dark theme colors consistent with the rest of the application
5. THE Node Card Component SHALL display icons with proper sizing and color inheritance
