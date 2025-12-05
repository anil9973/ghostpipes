# GhostPipes - Complete Development Guide for Kiro

> **Yahoo Pipes Reborn**: AI-assisted data automation browser extension with realistic pipe visualization

---

## 🎯 Project Overview

**What you're building:**
A Chrome extension that lets users create data automation pipelines by describing what they want in plain English. AI generates the pipeline, users can edit it visually, and it runs automatically.

**Core Innovation:**

- **AI as Plumber**: Users describe intent, AI builds complete pipelines
- **Visual Excellence**: Realistic 10px thick SVG pipes with right-angle routing
- **Offline-First**: Works without internet, syncs when available
- **35 Nodes**: Complete set of operations from input to output

**Target:** AWS Deadline Hackathon - Phase 1 (Extension Only)

---

## 📁 File Structure You'll Create

```
ghostpipes-extension/
├── manifest.json
├── background/background.js
├── lib/
│   └── om.compact.js                    # Already provided
├── core/
│   ├── storage/
│   │   ├── indexeddb-manager.js         # Database operations
│   │   └── sync-engine.js               # (Phase 2 only)
│   ├── execution/
│   │   ├── pipeline-runner.js           # Execute pipelines
│   │   ├── node-executor.js             # Run individual nodes
│   │   └── error-recovery.js            # Handle failures
│   └── ai/
│       ├── pipeline-generator.js        # AI pipeline creation
│       ├── prompt-builder.js            # Structured prompts
│       └── embedding-cache.js           # Template matching
├── pipelines/components/editor/nodes/
│   ├── pipeline-node.js                     # Base class
│   ├── node-registry.js                 # Central registry
│   ├── input/
│   │   ├── manual-input-node.js
│   │   ├── http-request-node.js
│   │   ├── webhook-node.js
│   │   └── file-watch-node.js
│   ├── processing/
│   │   ├── filter-node.js               # Priority node
│   │   ├── transform-node.js            # Priority node
│   │   ├── ai-processor-node.js         # Priority node
│   │   ├── parse-node.js                # Priority node
│   │   ├── condition-node.js            # Priority node
│   │   └── [22 more nodes].js
│   └── output/
│       ├── download-node.js
│       ├── append-file-node.js
│       ├── http-post-node.js
│       └── email-node.js
├── pipelines/
│   │   ├── index.html                   # Home page
│   │   ├── pipeline-builder.html        # Canvas editor
│   ├── components/editor/
│   │   └── data-preview.js              # Eye icon viewer
│   │   └── drawer/node-picker-drawer.js
│   │   └── pipeline-builder-canvas.js
│   │   └──factory-house.js
│   └── styles/
│       ├── base.css                     # Global styles
│       ├── variables.css                # CSS properties
│       ├── home-page.css                # Home styles
│       └── pipeline-builder.css         # Canvas styles
│   ├── scripts/
│   │   ├── selection-mode.js            # Alt+E selection
        ├── floating-menu.js             # Alt+P menu
│   │   └── content-script.js            # Main script
│   └── background/
│       └── alarm-manager.js             # Scheduled execution
└── assets/
    └── icons.svg                        # Icon sprite
```

---

## 📚 Essential Reading Order

**MUST read in this exact order before coding:**

1. `/specs/ui-framework.md` - Understand ui framework
1. `/specs/01-product-overview.md` - Understand the vision
1. `/specs/02-architecture.md` - System design
1. `/specs/03-node-specifications.md` - All 35 nodes
1. `/specs/04-ai-prompt-templates.md` - AI integration
1. `/specs/05-implementation-examples.md` - Code examples
1. `/steering/01-project-rules.md` - Code standards
1. `/steering/02-ui-design-rules.md` - UI patterns
1. `/hooks/pre-code-generation.md` - Pre-flight checklist
1. `/settings/mcp.json` - Configuration
1. `.kiro/reference/*` - Design files (DO NOT MODIFY)

---

## 🚀 Implementation Order

### Day 1: Foundation (8 hours)

1. ✅ Create `manifest.json`
2. ✅ Create `service-worker.js`
3. ✅ Create `/core/storage/indexeddb-manager.js`
4. ✅ Create `/nodes/base-node.js`
5. ✅ Create `/nodes/node-registry.js`
6. ✅ Create `/core/execution/pipeline-runner.js`

✅ Create 5 priority nodes:

- `manual-input-node.js`
- `http-request-node.js`
- `filter-node.js`
- `transform-node.js`
- `download-node.js`

### Day 2: UI Foundation (8 hours)

**Morning (4 hours):**

1. ✅ Create `/ui/styles/base.css`
2. ✅ Create `/ui/styles/variables.css`
3. ✅ Create `/ui/pages/index.html` (using reference)
4. ✅ Create `/ui/pages/index.js`
5. ✅ Create `/ui/components/node-card.js`

**Afternoon (4 hours):** 6. ✅ Create `/ui/components/pipe-canvas.js` 7. ✅ Create `/ui/components/pipe-renderer.js` 8. ✅ Create `/ui/pages/pipeline-builder.html` 9. ✅ Create `/ui/pages/pipeline-builder.js`

### Day 3: AI & Nodes (8 hours)

**Morning (4 hours):**

1. ✅ Create `/core/ai/prompt-builder.js`
2. ✅ Create `/core/ai/pipeline-generator.js`
3. ✅ Integrate AI into home page

**Afternoon (4 hours):** 4. ✅ Create 10 more processing nodes:

- `parse-node.js`
- `ai-processor-node.js`
- `condition-node.js`
- `join-node.js`
- `deduplicate-node.js`
- `validate-node.js`
- `aggregate-node.js`
- `split-node.js`
- `loop-node.js`
- `switch-node.js`

<!-- ### Day 4: Complete Nodes & Extension (8 hours)

**Morning (4 hours):**

1. ✅ Create remaining 17 processing nodes
2. ✅ Create 3 remaining output nodes

**Afternoon (4 hours):** 3. ✅ Create `/extension/content-scripts/selection-mode.js` 4. ✅ Create `/extension/content-scripts/content-script.js` 5. ✅ Create `/extension/background/alarm-manager.js` 6. ✅ Test selection mode (Alt+E, Alt+P)

### Day 5: Polish & Testing (8 hours)

**Morning (4 hours):**

1. ✅ Add animations (pipe drawing, data flow)
2. ✅ Add error states & recovery
3. ✅ Add loading states
4. ✅ Implement data preview (eye icon)

**Afternoon (4 hours):** 5. ✅ Manual testing all features 6. ✅ Fix bugs 7. ✅ Create demo video 8. ✅ Submit to hackathon

---

## ⚠️ Critical Requirements

### 1. Pipe Rendering (NON-NEGOTIABLE)

**Pipes MUST be:**

- ✅ 10px thick (minimum)
- ✅ SVG paths (not canvas, not divs)
- ✅ Right-angle routing ONLY (no curves!)
- ✅ Metallic gradient appearance
- ✅ Animated data flow particles
- ✅ Visible joints where pipes connect
- ✅ 10px spacing between parallel pipes

**DO NOT:**

- ❌ Use thin lines (< 10px)
- ❌ Use curves or Bézier paths
- ❌ Use dashed lines
- ❌ Use arrows instead of pipes

### 2. All 35 Nodes (NO SKIPPING)

**Input (4):** manual_input, http_request, webhook, file_watch
**Processing (27):** filter, transform, ai_processor, parse, condition, join, deduplicate, validate, aggregate, split, loop, switch, until, format, regex, union, intersect, distinct, web_search, lookup, rate_limit, batch, cache, custom_code, string_operations, schema, sleep
**Output (4):** download, append_file, http_post, email -->

### 3. Om.js Framework Rules

**Reactivity:**

```javascript
// ✅ Reactive (arrow function)
html`<div>${() => state.count}</div>`;

// ❌ Static (evaluated once)
html`<div>${state.count}</div>`;
```

**Event Binding:**

```javascript
// ✅ Always bind 'this'
@click=${this.handleClick.bind(this)}

// ❌ Wrong
@click=${this.handleClick}
```

**Lists:**

```javascript
// ✅ Use map() helper
${map(items, item => html`<li>${item}</li>`)}

// ❌ Don't use native map
${items.map(item => html`<li>${item}</li>`)}
```

### 4. File Organization

- Maximum 200 lines per file
- One class per file
- File naming: `kebab-case.js`
- Class naming: `PascalCase`
- Example: `HttpRequestNode` → `http-request-node.js`

### 5. Security

- Sanitize ALL user input
- Validate URLs before fetching
- No eval() or Function() constructor
- Content Security Policy enforced
- Escape HTML in templates

---

## 🎨 Design Guidelines

### Colors (from variables.css)

```css
--color-bg: #0a0a0a; /* Primary background */
--color-bg-secondary: #1a1a1a; /* Secondary background */
--color-accent: #00ff88; /* Neon green */
--color-accent-purple: #8844ff; /* Purple highlights */
--color-text: #e0e0e0; /* Primary text */
```

### Spacing

```css
--spacing-sm: 0.5em;
--spacing-md: 1em;
--spacing-lg: 2em;
--spacing-xl: 3em;
```

### Typography

- Use `em` units (not `px`)
- Minimum 44px touch targets
- BEM naming for CSS classes

### Animations

```css
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--easing: cubic-bezier(0.19, 1, 0.22, 1);
```

---

## 🧪 Testing Checklist

### Manual Tests

**Home Page:**

- [ ] File upload works
- [ ] Text paste works
- [ ] AI generates pipeline from description
- [ ] Template cards are clickable
- [ ] Templates load correct pipeline

**Pipeline Builder:**

- [ ] Nodes can be dragged from library
- [ ] Nodes can be positioned on canvas
- [ ] Pipes draw between nodes (10px thick, right angles)
- [ ] Eye icon shows data preview
- [ ] Edit button opens node config
- [ ] Run button executes pipeline
- [ ] Canvas pans and zooms

**Extension:**

- [ ] Alt+E enters selection mode
- [ ] Elements get green border on hover
- [ ] Elements are selected on click
- [ ] Alt+P shows floating menu
- [ ] Templates are suggested based on selection
- [ ] Pipeline opens with pre-filled data

**Scheduled Pipelines:**

- [ ] chrome.alarms schedules correctly
- [ ] Notification shows when complete
- [ ] Results are stored in IndexedDB

---

## 🐛 Common Pitfalls

### 1. Om.js Reactivity

**Problem:** State changes don't update UI
**Solution:** Always use arrow functions: `${() => state.value}`

### 2. Event Handler Context

**Problem:** `this` is undefined in handlers
**Solution:** Always bind: `@click=${this.handler.bind(this)}`

### 3. Pipe Rendering

**Problem:** Pipes are thin or curved
**Solution:** Use 10px stroke-width and only `L` commands (not `C`)

### 4. Node Implementation

**Problem:** Skipping nodes to save time
**Solution:** ALL 35 nodes MUST be implemented (no shortcuts)

### 5. File Size

**Problem:** Files become too large (> 300 lines)
**Solution:** Split into smaller, focused files

---

## 📝 Documentation Standards

### JSDoc for Functions

```javascript
/**
 * Execute pipeline with error recovery
 * @param {Object} pipeline - Pipeline configuration
 * @param {string} pipeline.id - Unique identifier
 * @param {Array<Node>} pipeline.nodes - Pipeline nodes
 * @param {Object} [options] - Execution options
 * @param {boolean} [options.dryRun=false] - Test mode
 * @returns {Promise<ExecutionResult>} Result object
 * @throws {PipelineExecutionError} If pipeline fails
 */
async function executePipeline(pipeline, options = {}) {
	// Implementation
}
```

### File Headers

```javascript
/**
 * @fileoverview Pipeline execution engine
 * @module core/execution/pipeline-runner
 * @requires core/storage/indexeddb-manager
 * @requires nodes/base-node
 */
```

---

## 🎯 Success Criteria

### Must Have (MVP)

- ✅ All 35 nodes implemented
- ✅ AI pipeline generation works
- ✅ Visual pipeline editor functional
- ✅ Pipes are realistic (10px, right angles)
- ✅ Extension selection mode (Alt+E, Alt+P)
- ✅ Scheduled execution works
- ✅ Offline-first storage
- ✅ Data preview (eye icon)

### Nice to Have (If Time)

- ⭐ Error recovery (partial pipeline success)
- ⭐ Pipeline versioning
- ⭐ Template marketplace preview
- ⭐ Advanced animations
- ⭐ Undo/redo

### Excluded (Phase 2)

- ❌ Backend server
- ❌ User authentication
- ❌ Cloud sync
- ❌ Team collaboration
- ❌ Web app version

---

## 🚨 Before You Start Coding

**Run this checklist:**

- [ ] I have read ALL specs (01-05)
- [ ] I have read BOTH steering docs
- [ ] I have read the pre-code-generation hook
- [ ] I have reviewed the reference design files
- [ ] I understand this is Phase 1 (extension only)
- [ ] I understand all 35 nodes must be implemented
- [ ] I understand pipes are 10px thick with right angles
- [ ] I understand Om.js reactivity patterns
- [ ] I understand file size limit (300 lines)
- [ ] I am ready to follow all specifications exactly

---

## 💡 Key Insights

### Why This Project is Different

**Most automation tools:**

- Force users to learn complex interfaces
- Show 100+ operations upfront
- Require technical knowledge
- Abstract away the data flow

**GhostPipes:**

- AI builds everything from description
- Visual debugging (see data flow in pipes)
- Progressive disclosure (simple → advanced)
- Realistic metaphor (pipes, not flowcharts)

### Design Philosophy

1. **AI as Plumber**: AI does heavy lifting, users supervise
2. **Visual First**: See data flowing through realistic pipes
3. **Offline First**: Works without internet
4. **Progressive Complexity**: Simple for beginners, powerful for experts

---

## 📞 Questions During Development?

### Re-read these sections:

**If unsure about:**

- Node implementation → `/specs/03-node-specifications.md`
- Pipe rendering → `/steering/02-ui-design-rules.md` + examples
- Om.js patterns → `/specs/05-implementation-examples.md`
- File structure → `/specs/02-architecture.md`
- AI prompts → `/specs/04-ai-prompt-templates.md`

---

## 🎬 Final Checklist Before Submission

- [ ] All 35 nodes exist as separate files
- [ ] Pipes are 10px thick with right angles
- [ ] AI pipeline generation works end-to-end
- [ ] Extension selection mode (Alt+E, Alt+P) works
- [ ] Scheduled pipelines run via chrome.alarms
- [ ] Demo video recorded (3-5 minutes)
- [ ] README.md with installation instructions
- [ ] manifest.json has correct permissions
- [ ] Code is commented with JSDoc
- [ ] No console errors in production
- [ ] Tested in Chrome 140+

---

**Remember:** Quality over features. A working extension with realistic pipes and AI generation beats a half-finished app with 50% of nodes.

**Good luck! 👻🔧**
