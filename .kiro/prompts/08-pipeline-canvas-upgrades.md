## TASK 1: Pipeline Canvas Editor Upgrades

**Objective:** Enhance the visual pipeline editor with zoom, pan, and dynamic canvas features.

**Requirements:**

1. **Zoom Controls**

   - Add zoom in/out functionality (mouse wheel + buttons)
   - Support zoom levels: 25%, 50%, 75%, 100%, 125%, 150%, 200%
   - Zoom centered on mouse cursor position
   - Maintain node positions relative to zoom
   - Show current zoom level indicator

2. **Canvas Panning**

   - Click and drag empty canvas space to pan
   - Use spacebar + drag as alternative
   - Show visual feedback during drag (cursor change)
   - Prevent accidental node selection during pan
   - Reset pan position button

3. **Dynamic Canvas Growth**

   - Auto-expand canvas height when node placed at 90% of current height
   - Expand by 500px increments
   - Show visual indicator when expansion occurs
   - Prevent infinite expansion (max height limit)

4. **Node Deletion**
   - Add delete icon to each node card
   - Use existing icon sprite: `<svg class="icon"><use href="/assets/icons.svg#delete"></use></svg>`
   - Show confirmation dialog for nodes with connections
   - Clean up connections when node deleted
   - Support keyboard shortcut (Delete key when node selected)

**Existing Code to Review:**

- Canvas rendering logic
- Node positioning system
- SVG pipe connections
- Event handlers

**Questions for Specs:**

- Should zoom persist across sessions?
- Should there be canvas bounds/limits for panning?
- How to handle zoom with existing pipe connections?
- Should deletion support undo/redo?

read `extension/pipelines/services/Plumbing/*` js files and `extension/pipelines/components/editor/pipeline-canvas.js` to upgrade functionality
