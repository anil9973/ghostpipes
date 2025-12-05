# First prompt

## READ

- .kiro/README.md
- UI frame docs : .kiro/specs/ui-framework.md
- Architecture : .kiro/specs/02-architecture.md
- Overview : .kiro/specs/01-product-overview.md
- all files in this folder: .kiro/reference/
- web-component : .kiro/steering/03-web-component-patterns.md
- Then Find `node-picker-drawer` in `.kiro/reference/pipeline-builder.html`.
  Create `node-card` web-component inside `pipelines/components/editor/drawer`.
  Create input-resources,data-operations, output-destinations extends HTMLDetailsElement web-component. Match svg icon available in `.kiro/reference/assets/icons.svg`. If not insert `svg class=icon` into `/assets/icon.svg` and replace svg with this `<svg class="icon"><use href="/assets/icons.svg#icon-id" /></svg>`. Write addEvent on element and event function inside web-component class

# Prompt 2

- `ai-plumber-node-card` in `.kiro/reference/pipeline-builder.html` and write web-component in `pipelines/components/editor/nodes`

- Learn how i write web-component `pipelines/components/editor/drawer/input-resources.js`. Generate ui component feature like this.
- Follow `.kiro/specs/04-ai-prompt-templates.md` specs
  implement this
  ai/
  │ ├── pipeline-generator.js # AI pipeline creation
  │ ├── prompt-builder.js # Structured prompts

- When ai generate pipeplie, preview generated new pipeline in dialog box. Add button `Insert` to insert generated new pipeline in pipeline-canvas

# Prompt 3

```

# Prompt 4

- Refactor nodes config in pipelines
- First read `pipelines/models/PipeNode.js` and `pipelines/models/NodeConfig.js`
- Your Task: Write `jsdoc` on class property and Write more validate if required (check first if required or not)Split NodeConfig.js class in file files `input`, `processing` and `output` inside models

- Come at `pipelines/components/editor/nodes` folder.
  Make sure you read `.kiro/steering/04-omjs-framework-rules.md`
  This is some problem which you need to fix:

1. config property mismatch
2. select option or datalist option is static. Loop based on config data
3. Get validation rule from nodeconfig and write validation logic on input & change DOM event
4. Replace PipeNode's properties with inputSchema
   this.inputs
5. Read `pipelines/db/db.js` file and when node property update, write function to update in db

First write `requirements.md`, `design.md` and `tasks.md`
```
