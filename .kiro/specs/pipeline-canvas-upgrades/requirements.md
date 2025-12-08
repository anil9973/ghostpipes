# Requirements Document

## Introduction

This document specifies the requirements for enhancing the GhostPipes visual pipeline editor with zoom, pan, dynamic canvas expansion, and improved node deletion capabilities. The enhancements will improve user experience when working with complex pipelines by providing better navigation, workspace management, and node manipulation features.

## Glossary

- **Canvas**: The visual workspace where pipeline nodes and connections are displayed and manipulated
- **Node**: A visual component representing a pipeline operation (e.g., HTTP Request, Filter, Transform)
- **Pipe**: A visual connection line between nodes showing data flow
- **Zoom Level**: The magnification factor of the canvas view, expressed as a percentage (25% to 200%)
- **Pan**: The action of moving the visible viewport across the canvas by dragging
- **Port**: A connection point on a node where pipes can attach (top or bottom)
- **PipelineEditor**: The service class managing node and pipe operations
- **PipelineCanvas**: The web component hosting the visual editor

## Requirements

### Requirement 1: Zoom Functionality

**User Story:** As a pipeline designer, I want to zoom in and out of the canvas, so that I can view detailed node configurations or see the entire pipeline structure at once.

#### Acceptance Criteria

1. WHEN the user scrolls the mouse wheel over the canvas THEN the Canvas SHALL zoom in or out centered on the mouse cursor position
2. WHEN the user clicks zoom in or zoom out buttons THEN the Canvas SHALL zoom centered on the viewport center
3. THE Canvas SHALL support zoom levels of 25%, 50%, 75%, 100%, 125%, 150%, and 200%
4. WHEN the zoom level changes THEN the Canvas SHALL maintain node positions relative to their original coordinates
5. WHEN the zoom level changes THEN the Canvas SHALL update all pipe connections to match the new scale
6. THE Canvas SHALL display the current zoom level percentage in the UI
7. WHEN the zoom level reaches minimum (25%) or maximum (200%) THEN the Canvas SHALL prevent further zooming in that direction

### Requirement 2: Canvas Panning

**User Story:** As a pipeline designer, I want to pan across the canvas, so that I can navigate large pipelines without losing context.

#### Acceptance Criteria

1. WHEN the user clicks and drags on empty canvas space THEN the Canvas SHALL pan the viewport in the drag direction
2. WHEN the user holds spacebar and drags anywhere on the canvas THEN the Canvas SHALL pan the viewport regardless of what is under the cursor
3. WHEN panning is active THEN the Canvas SHALL change the cursor to indicate pan mode
4. WHEN the user drags over a node during pan mode THEN the Canvas SHALL not select or move the node
5. WHEN the user clicks a reset button THEN the Canvas SHALL return the viewport to the origin position (0, 0)
6. WHEN panning occurs THEN the Canvas SHALL update the visible area without affecting node absolute positions

### Requirement 3: Dynamic Canvas Expansion

**User Story:** As a pipeline designer, I want the canvas to automatically expand when I place nodes near the edge, so that I have unlimited workspace without manual resizing.

#### Acceptance Criteria

1. WHEN a node is placed at 90% or more of the current canvas height/width THEN the Canvas SHALL expand its height/width by 500 pixels
2. WHEN canvas expansion occurs THEN the Canvas SHALL display a visual indicator showing the expansion
3. THE Canvas SHALL enforce a maximum height limit of 10,000 pixels to prevent infinite expansion
4. WHEN the canvas expands THEN the Canvas SHALL maintain all existing node positions and pipe connections
5. WHEN a node is dragged near the bottom edge THEN the Canvas SHALL trigger expansion before the node reaches the absolute edge

### Requirement 4: Enhanced Node Deletion

**User Story:** As a pipeline designer, I want to delete nodes with clear visual feedback and safety checks, so that I can remove unwanted components without accidentally breaking my pipeline.

#### Acceptance Criteria

1. WHEN a node is rendered THEN the Node SHALL display a delete icon using the existing icon sprite
2. WHEN the user clicks the delete icon on a node with no connections THEN the Canvas SHALL immediately remove the node
3. WHEN the user clicks the delete icon on a node with connections THEN the Canvas SHALL display a confirmation dialog
4. WHEN the user confirms deletion of a connected node THEN the Canvas SHALL remove the node and all connected pipes
5. WHEN a node is deleted THEN the Canvas SHALL update the database to persist the deletion
6. WHEN the user presses the Delete key while a node is selected THEN the Canvas SHALL trigger the deletion process for that node
7. WHEN a node is deleted THEN the Canvas SHALL notify connected nodes to free their port connections

### Requirement 5: Zoom Persistence

**User Story:** As a pipeline designer, I want my zoom level to be remembered, so that I don't have to readjust it every time I open a pipeline.

#### Acceptance Criteria

1. WHEN the user changes the zoom level THEN the Canvas SHALL store the zoom level in browser local storage
2. WHEN the user opens a pipeline THEN the Canvas SHALL restore the previously saved zoom level
3. WHEN no saved zoom level exists THEN the Canvas SHALL default to 100% zoom
4. THE Canvas SHALL store zoom level per pipeline ID to support different zoom levels for different pipelines

### Requirement 6: Pan Boundaries

**User Story:** As a pipeline designer, I want reasonable boundaries when panning, so that I don't lose track of my pipeline content.

#### Acceptance Criteria

1. WHEN panning left or up THEN the Canvas SHALL allow panning up to 500 pixels beyond the origin (0, 0)
2. WHEN panning right or down THEN the Canvas SHALL allow panning up to 500 pixels beyond the furthest node position
3. WHEN the user attempts to pan beyond boundaries THEN the Canvas SHALL provide elastic resistance feedback
4. WHEN the canvas contains no nodes THEN the Canvas SHALL limit panning to a 2000x2000 pixel area centered on origin

### Requirement 7: Keyboard Shortcuts

**User Story:** As a pipeline designer, I want keyboard shortcuts for common operations, so that I can work more efficiently.

#### Acceptance Criteria

1. WHEN the user presses Ctrl+Plus THEN the Canvas SHALL zoom in one level
2. WHEN the user presses Ctrl+Minus THEN the Canvas SHALL zoom out one level
3. WHEN the user presses Ctrl+0 THEN the Canvas SHALL reset zoom to 100%
4. WHEN the user presses Delete key with a node selected THEN the Canvas SHALL trigger deletion for that node
5. WHEN the user presses Spacebar THEN the Canvas SHALL enter pan mode until the key is released

### Requirement 8: Visual Feedback

**User Story:** As a pipeline designer, I want clear visual feedback for all canvas operations, so that I understand what the system is doing.

#### Acceptance Criteria

1. WHEN zoom changes THEN the Canvas SHALL animate the transition smoothly over 200 milliseconds
2. WHEN pan mode is active THEN the Canvas SHALL display a grab cursor
3. WHEN panning is in progress THEN the Canvas SHALL display a grabbing cursor
4. WHEN canvas expansion occurs THEN the Canvas SHALL show a brief notification indicating the new canvas size
5. WHEN a node is selected for deletion THEN the Node SHALL highlight with a red border
6. WHEN hovering over the delete icon THEN the Icon SHALL change color to indicate interactivity
