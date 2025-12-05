# Pre-Code Generation Checklist

**Run this checklist before generating ANY code for GhostPipes**

---

## 1. Understand the Core Concept

- [ ] I understand this is Yahoo Pipes reborn
- [ ] I understand AI generates pipelines, users supervise
- [ ] I understand pipes must be realistic (10px thick, right angles, SVG)
- [ ] I understand all 35 nodes must be implemented (no skipping)
- [ ] I understand this is extension-first (Phase 1 only for hackathon)

---

## 2. Technology Stack Verification

- [ ] Using Om.js framework (not React, Vue, or others)
- [ ] Using native ES6 modules (no bundler)
- [ ] Using IndexedDB for storage (not localStorage)
- [ ] Using chrome.alarms for scheduling (not setInterval)
- [ ] Using File System Access API with fallback
- [ ] Using SVG for pipes (not canvas)
- [ ] NO npm packages (CDN only)
- [ ] NO build step required

---

## 3. File Organization Rules

- [ ] Maximum 300 lines per file
- [ ] One class per file (except tiny helpers)
- [ ] Files in correct directories:
  - `/core/` for business logic
  - `/nodes/` for pipeline nodes
  - `/ui/` for visual components
- [ ] Naming convention:
  - Class: `PascalCase`
  - File: `kebab-case`
  - Example: `HttpRequestNode` → `http-request-node.js`

---

## 4. Om.js Framework Rules

- [ ] Using `react()` for reactive state
- [ ] Using `html` tagged template literals
- [ ] Using `map()` for lists (not native Array.map)
- [ ] Arrow functions for reactivity: `${() => state.value}`
- [ ] Event binding: `@click=${this.handler.bind(this)}`
- [ ] Properties: `.property=${value}`
- [ ] Boolean attributes: `?checked=${() => state.active}`
- [ ] NO quotes around reactive expressions

---

## 5. Node Implementation Requirements

**For EACH of the 35 nodes:**

- [ ] Extends `BaseNode` class
- [ ] Has static metadata (TYPE, NAME, DESCRIPTION, etc.)
- [ ] Implements `execute(input)` method
- [ ] Implements `validate()` method
- [ ] Has JSDoc documentation
- [ ] Has UI configuration controls (HTML template)
- [ ] Has example usage in comments

**Priority nodes to implement first:**

1. ManualInputNode
2. HttpRequestNode
3. FilterNode
4. TransformNode
5. ParseNode
6. AIProcessorNode
7. ConditionNode
8. DownloadNode

---

## 6. Pipe Rendering Requirements

**SVG pipes must have:**

- [ ] Minimum 10px thickness
- [ ] Right-angle routing ONLY (no curves)
- [ ] Visible joints where pipes connect
- [ ] 10px spacing between parallel pipes
- [ ] Animated data flow particles
- [ ] 3D metallic appearance (gradients)
- [ ] Glow effect on hover/active
- [ ] Cut-out appearance where pipes meet nodes

**DO NOT:**

- ❌ Use curves (Bézier paths)
- ❌ Use dashed lines
- ❌ Use arrows instead of pipes
- ❌ Make pipes thin (< 10px)
- ❌ Overlap pipes without visible joints

---

## 7. AI Integration Checklist

- [ ] All AI prompts in `PromptBuilder` class
- [ ] Prompts are explanatory (not minimal)
- [ ] Include examples in prompts
- [ ] Include all 35 node types in documentation
- [ ] Validate AI responses before execution
- [ ] Handle AI failures gracefully
- [ ] Use structured output format (JSON only)

---

## 8. Code Quality Standards

- [ ] JSDoc for all public functions
- [ ] Type hints in JSDoc: `@param {string}`, `@returns {Promise<void>}`
- [ ] Error handling with try-catch
- [ ] No `var` keyword (use `const`/`let`)
- [ ] Arrow functions for callbacks
- [ ] Async/await (no callbacks)
- [ ] Descriptive variable names
- [ ] Comments for complex logic only

---

## 9. CSS Standards

- [ ] Using `em` units (not `px`)
- [ ] Using CSS custom properties (variables)
- [ ] BEM naming convention
- [ ] Dark theme colors from `/settings/mcp.json`
- [ ] Minimum 44px touch targets
- [ ] Responsive breakpoints defined
- [ ] Animations use custom easing

---

## 10. Extension-Specific Requirements

- [ ] Manifest v3 format
- [ ] Service worker (not background page)
- [ ] Content scripts for selection mode
- [ ] chrome.alarms for scheduling
- [ ] chrome.storage.local fallback
- [ ] chrome.notifications for alerts
- [ ] chrome.downloads for file saving
- [ ] Permissions minimized (only what's needed)

---

## 11. Security Checklist

- [ ] Sanitize all user input
- [ ] Validate URLs before fetching
- [ ] Content Security Policy defined
- [ ] No eval() or Function() constructor
- [ ] No inline event handlers
- [ ] Escape HTML in templates
- [ ] Validate pipeline JSON before execution

---

## 12. Performance Optimization

- [ ] Lazy load nodes (dynamic imports)
- [ ] Virtual scrolling for large pipelines
- [ ] Debounce user input (300ms)
- [ ] Cache API responses
- [ ] Cache AI embeddings
- [ ] Minimize DOM updates
- [ ] Use IndexedDB transactions properly

---

## 13. Accessibility Requirements

- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation support
- [ ] Focus management for modals
- [ ] Screen reader announcements
- [ ] Minimum contrast ratios
- [ ] Skip links for navigation
- [ ] Alt text for icons

---

## 14. Reference Design Integration

- [ ] Read `.kiro/reference/home-page.html`
- [ ] Read `.kiro/reference/pipeline-builder.html`
- [ ] Read `.kiro/reference/base.css`
- [ ] Enhance design (don't alter completely)
- [ ] Follow existing spacing/sizing
- [ ] Use existing color variables
- [ ] Match existing icon style

---

## 15. Testing Strategy

**Before writing code, know how to test:**

- [ ] Unit tests for each node
- [ ] Integration tests for pipeline execution
- [ ] UI component tests
- [ ] Extension manifest validation
- [ ] Manual testing plan documented

---

## 16. Documentation Requirements

**Each file must have:**

- [ ] File header with `@fileoverview`
- [ ] Module dependencies listed
- [ ] Class documentation with examples
- [ ] Complex algorithms explained
- [ ] TODOs marked clearly

---

## 17. Git Commit Strategy

- [ ] Atomic commits (one feature per commit)
- [ ] Descriptive commit messages
- [ ] Branch naming: `feature/node-implementation`
- [ ] Never commit secrets/API keys

---

## 18. Browser Compatibility

- [ ] Chrome 140+ minimum
- [ ] Feature detection for File System APIs
- [ ] Graceful degradation for unsupported features
- [ ] Fallback UI for missing features
- [ ] No polyfills for complex APIs

---

## 19. Phase 1 Scope Discipline

**DO implement:**

- ✅ Extension functionality
- ✅ Offline-first storage
- ✅ AI pipeline generation
- ✅ Visual pipeline editor
- ✅ Selection mode (Alt+E, Alt+P)
- ✅ All 35 nodes

**DO NOT implement (Phase 2 only):**

- ❌ Backend server
- ❌ User authentication
- ❌ Cloud sync
- ❌ Template marketplace
- ❌ Team collaboration

---

## 20. Critical Path Validation

**Ask before coding:**

1. Does this file belong in Phase 1?
2. Is this file under 300 lines?
3. Does this follow the Om.js pattern?
4. Are pipes rendered correctly (10px, right angles)?
5. Are all nodes implemented (not stubbed)?
6. Does this work offline?
7. Is this compatible with Chrome 140+?
8. Have I read the specs and steering docs?

---

## Final Verification

Before starting code generation:

```
I have read:
- /specs/01-product-overview.md
- /specs/02-architecture.md
- /specs/03-node-specifications.md
- /steering/01-project-rules.md
- /steering/02-ui-design-rules.md
- /settings/mcp.json
- .kiro/reference/* (all design files)

I understand:
- This is Phase 1 (extension only)
- All 35 nodes must be implemented
- Pipes are SVG, 10px thick, right angles
- AI generates pipelines from user prompts
- Om.js is the UI framework
- No build step required
- Offline-first architecture

I commit to:
- Following all specifications exactly
- Not skipping any nodes
- Maintaining realistic pipe design
- Writing complete documentation
- Ensuring Chrome 140+ compatibility
```

---

## Emergency Checklist

**If something feels wrong during coding:**

1. Stop immediately
2. Re-read relevant specs
3. Check if file is too large (> 300 lines)
4. Verify Om.js patterns are correct
5. Ensure pipes are realistic (not thin lines)
6. Confirm node implementation is complete
7. Validate against reference design

---

## Code Generation Order

**Generate code in this exact order:**

1. **Core Foundation** (Day 1)

   - `/core/storage/IndexedDBManager.js`
   - `/core/execution/PipelineRunner.js`
   - `/nodes/BaseNode.js`
   - `/nodes/NodeRegistry.js`

2. **Priority Nodes** (Day 1-2)

   - ManualInputNode
   - HttpRequestNode
   - FilterNode
   - TransformNode
   - ParseNode

3. **UI Components** (Day 2)

   - `/ui/components/NodeCard.js`
   - `/ui/components/PipeCanvas.js`
   - `/ui/pages/HomePage.js`
   - `/ui/pages/PipelineBuilder.js`

4. **AI Integration** (Day 2-3)

   - `/core/ai/PromptBuilder.js`
   - `/core/ai/PipelineGenerator.js`
   - `/core/ai/EmbeddingCache.js`

5. **Remaining Nodes** (Day 3-4)

   - All 30 remaining nodes
   - One file per node
   - Follow same pattern as priority nodes

6. **Extension Features** (Day 4-5)

   - `/extension/content-scripts/SelectionMode.js`
   - `/extension/content-scripts/FloatingMenu.js`
   - `/extension/background/AlarmManager.js`
   - `/service-worker.js`

7. **Polish & Testing** (Day 5)
   - Animations
   - Error states
   - Loading states
   - Manual testing

---

**ONLY proceed with code generation after ALL checkboxes are checked.**
