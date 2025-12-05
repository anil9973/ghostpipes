# Requirements Document

## Introduction

The Pipeline Builder is a visual drag-and-drop interface for designing automation pipelines in the GhostPipes Chrome extension. Users can create, connect, and configure nodes to build data processing workflows with realistic industrial-style pipe connections rendered in SVG. The system provides an intuitive interface that automatically handles connection logic, collision avoidance, and smooth real-time updates.

## Glossary

- **Pipeline Builder**: The visual canvas interface where users design automation workflows
- **Node**: An HTML element representing a single operation in the pipeline (e.g., HTTP request, filter, transform)
- **Pipe**: An SVG-rendered connection between two nodes showing data flow direction
- **Connection Point**: A clickable area on a node's edge where pipes can attach
- **Canvas**: The main container holding both the SVG layer for pipes and HTML layer for nodes
- **Waypoint**: A coordinate point in a pipe's path used for routing calculations
- **Orthogonal Path**: A pipe route using only 90-degree angles (horizontal and vertical segments)
- **Collision Avoidance**: The algorithm that routes pipes around nodes to prevent visual overlap
- **Connection Tracker**: The system component that manages which pipes connect to which node sides

## Requirements

### Requirement 1

**User Story:** As a user, I want to drag nodes onto the canvas and position them freely, so that I can organize my pipeline visually.

#### Acceptance Criteria

1. WHEN a user drags a node from the palette and drops it on the canvas THEN the system SHALL create a new node instance at the drop coordinates
2. WHEN a user clicks and drags an existing node THEN the system SHALL update the node position at 60 frames per second using requestAnimationFrame
3. WHEN a node is being dragged THEN the system SHALL update all connected pipe paths in real-time
4. WHEN a user releases a dragged node THEN the system SHALL persist the new position to the data model
5. WHEN multiple nodes exist on the canvas THEN the system SHALL allow independent positioning without grid constraints

### Requirement 2

**User Story:** As a user, I want to create pipe connections between nodes by clicking connection points, so that I can define the data flow in my pipeline.

#### Acceptance Criteria

1. WHEN a user hovers over a node edge THEN the system SHALL display a connection point indicator at the center of that edge
2. WHEN a user clicks a connection point THEN the system SHALL initiate pipe creation mode with a temporary pipe following the mouse cursor
3. WHEN the user hovers over a valid target node during pipe creation THEN the system SHALL highlight the appropriate connection edge
4. WHEN the user clicks a valid target connection point THEN the system SHALL create a permanent pipe with calculated orthogonal path
5. WHEN the user clicks outside any node during pipe creation THEN the system SHALL cancel pipe creation and remove the temporary pipe

### Requirement 3

**User Story:** As a user, I want pipes to automatically connect to the correct sides of nodes based on their relative positions, so that I don't have to manually specify connection directions.

#### Acceptance Criteria

1. WHEN a source node is positioned above a target node THEN the system SHALL connect the source node bottom edge to the target node top edge
2. WHEN a source node is positioned below a target node THEN the system SHALL connect the source node top edge to the target node bottom edge
3. WHEN a source node is positioned to the left of a target node THEN the system SHALL connect the source node right edge to the target node left edge
4. WHEN a source node is positioned to the right of a target node THEN the system SHALL connect the source node left edge to the target node right edge
5. WHEN a node is moved such that its relative position to connected nodes changes THEN the system SHALL recalculate connection sides and update pipe paths

### Requirement 4

**User Story:** As a user, I want pipes to render with realistic industrial styling including thick lines and smooth corners, so that the interface has a professional appearance.

#### Acceptance Criteria

1. WHEN a pipe is rendered THEN the system SHALL draw the pipe with a stroke width of 10 pixels
2. WHEN a pipe path includes a corner THEN the system SHALL render a cubic bezier curve with 15-20 pixel radius at the corner
3. WHEN a pipe path includes an elbow joint THEN the system SHALL overlay a decorative patch element at the joint location
4. WHEN a pipe is rendered THEN the system SHALL use only 90-degree angle segments between corners
5. WHEN a pipe is rendered THEN the system SHALL apply a drop shadow filter for depth perception

### Requirement 5

**User Story:** As a user, I want multiple pipes connecting to the same node side to be visually separated, so that I can distinguish individual connections.

#### Acceptance Criteria

1. WHEN multiple pipes connect to the same node side THEN the system SHALL space connection points with a minimum of 30 pixels between them
2. WHEN a new pipe is added to a node side with existing connections THEN the system SHALL recalculate spacing for all connections on that side
3. WHEN a pipe is removed from a node side THEN the system SHALL recalculate spacing for remaining connections on that side
4. WHEN connection points are calculated THEN the system SHALL distribute them evenly across the node edge width
5. WHEN the number of connections exceeds the available edge space THEN the system SHALL reduce spacing proportionally while maintaining minimum visibility

### Requirement 6

**User Story:** As a user, I want pipes to automatically route around nodes to avoid visual overlap, so that the pipeline remains readable.

#### Acceptance Criteria

1. WHEN a pipe path would intersect a node THEN the system SHALL calculate an alternative path that routes around the node
2. WHEN calculating avoidance paths THEN the system SHALL add waypoints to create orthogonal detours around obstacles
3. WHEN multiple routing options exist THEN the system SHALL select the path with the fewest waypoints
4. WHEN a node is moved THEN the system SHALL recalculate paths for all pipes to check for new collisions
5. WHEN no collision-free path exists THEN the system SHALL render the shortest path and log a warning

### Requirement 7

**User Story:** As a user, I want to delete pipes by clicking a delete icon, so that I can modify my pipeline structure.

#### Acceptance Criteria

1. WHEN a user hovers over a pipe THEN the system SHALL display a delete icon near the source connection point
2. WHEN a user clicks the delete icon THEN the system SHALL remove the pipe from the canvas
3. WHEN a pipe is deleted THEN the system SHALL update the connection tracker to remove the pipe reference
4. WHEN a pipe is deleted THEN the system SHALL recalculate connection point spacing for affected node sides
5. WHEN a pipe is deleted THEN the system SHALL remove all associated SVG elements from the DOM

### Requirement 8

**User Story:** As a user, I want to export my pipeline to JSON format, so that I can save and share my work.

#### Acceptance Criteria

1. WHEN a user triggers export THEN the system SHALL serialize all nodes with their IDs, types, positions, and configurations
2. WHEN a user triggers export THEN the system SHALL serialize all pipes with source, target, sides, and calculated paths
3. WHEN a user triggers export THEN the system SHALL generate valid JSON conforming to the pipeline schema
4. WHEN a user triggers export THEN the system SHALL include pipeline metadata such as ID and title
5. WHEN exported JSON is generated THEN the system SHALL ensure all node and pipe IDs are unique and valid

### Requirement 9

**User Story:** As a user, I want to import a pipeline from JSON format, so that I can load previously saved work.

#### Acceptance Criteria

1. WHEN a user imports valid pipeline JSON THEN the system SHALL create all nodes at their specified positions
2. WHEN a user imports valid pipeline JSON THEN the system SHALL create all pipes with their specified connections
3. WHEN a user imports valid pipeline JSON THEN the system SHALL recalculate pipe paths to ensure they match current node positions
4. WHEN a user imports invalid JSON THEN the system SHALL display an error message and maintain the current canvas state
5. WHEN a user imports a pipeline THEN the system SHALL clear the existing canvas before rendering the imported pipeline

### Requirement 10

**User Story:** As a developer, I want the system to use modern JavaScript classes with clear separation of concerns, so that the codebase is maintainable and extensible.

#### Acceptance Criteria

1. WHEN implementing the pipeline builder THEN the system SHALL use a PipelineCanvas class as the main coordinator
2. WHEN implementing node management THEN the system SHALL use a NodeManager class to handle node operations
3. WHEN implementing pipe management THEN the system SHALL use a PipeManager class to handle pipe operations
4. WHEN implementing path calculations THEN the system SHALL use a PathCalculator class with orthogonal routing algorithms
5. WHEN implementing connection tracking THEN the system SHALL use a ConnectionTracker class to manage connection point allocation
