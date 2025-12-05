Here is the coding patterns steering file. Save this as `.kiro/steering/coding_patterns.md`.

````markdown
# JavaScript Coding Patterns & Steering

**Target Environment:** Chrome 140+ (No polyfills/transpilation required).
**Philosophy:** Concise, Object-Oriented, Modern, and readable.

## 1. Global Shorthands

Assume these are globally available. Do not re-declare them.

```javascript
// Dispatch Custom Event
globalThis.fireEvent = (target, eventName, detail) =>
	target.dispatchEvent(detail ? new CustomEvent(eventName, { detail }) : new CustomEvent(eventName));

// Event Listener
globalThis.$on = (target, type, callback) => target.addEventListener(type, callback);
globalThis.$onO = (target, type, callback) => target.addEventListener(type, callback, { once: true });

// DOM Select
globalThis.$ = (selector, scope) => (scope || document).querySelector(selector);

// UI Notifications
globalThis.toast = (msg, isErr);
globalThis.notify = (message, (type = "success")); // type: "success"|"error"|"warn"
```
````

## 2. No `switch` Statements

Replace `switch/case` blocks with **Object Lookups** or **Classes** (Strategy Pattern).

**❌ Avoid:**

```javascript
switch (type) {
	case "download":
		handleDownload();
		break;
	case "upload":
		handleUpload();
		break;
}
```

**✅ Use Object Literal:**

```javascript
const handlers = {
	download: handleDownload,
	upload: handleUpload,
};
handlers[type]?.();
```

## 3. Data Structures: Classes over `@typedef`

Do not use JSDoc `@typedef` to define complex shapes. Use JavaScript Classes to define schemas and enclose logic.

**❌ Avoid:**

```javascript
/**
 * @typedef {Object} NodeConfig
 * @property {string} id
 * @property {string} type
 */
```

**✅ Use Class:**

```javascript
export class NodeConfig {
	/** @param {Object} init */
	constructor(init = {}) {
		this.id = init.id || crypto.randomUUID();
		this.type = init.type || "default";
	}
}
```

## 4. Control Flow & Conciseness

### Single-statement `if`

Omit curly braces `{}` for single-line statements.

**❌ Avoid:**

```javascript
if (count === 0) {
	console.log("empty");
}
```

**✅ Use:**

```javascript
if (count === 0) console.log("empty");
```

### Ternary & Short-circuiting

Prefer ternary operators (`? :`), logical AND (`&&`), and logical OR (`||`) over verbose `if-else` blocks for assignment or execution.

**❌ Avoid:**

```javascript
let status;
if (isActive) {
	status = "active";
} else {
	status = "idle";
}

if (isValid) {
	save();
}
```

**✅ Use:**

```javascript
const status = isActive ? "active" : "idle";
isValid && save();
```

## 5. Documentation (JSDoc)

Keep JSDoc concise. Prefer **one-liners**.

Generate JSDoc using the following style:

- One-liner JSDoc everywhere except constructor param lists.
- Keep @enum, @returns, and @type.
- No blank lines or "\*"-only lines.
- Short and direct text, no long descriptions.
- No @default, no prose paragraphs.

**✅ Use:**

```javascript
/** @param {string} id - Unique node identifier */
getNode(id) { ... }
```

### ❌ Forbidden

- No multiline descriptions
- No empty JSDoc lines
- No duplicate information
- No `@default` tag (defaults described in code only)
- No excessive prose (keep concise)

## 6. Architecture

- **Separation of Concern:** Use Classes to separate Data Models from UI Components.
- **Web Components:** Extend specific HTML elements where appropriate (e.g., `extends HTMLTableRowElement` for rows).
- **Reactivity:** Use the `om.js` reactive primitives (read .kiro/steering/04-omjs-framework-rules.md).

## 7. Modern Chrome 140+ Features

- Don't Use private class fields (`#privateField`) or underscore property name (\_).
- Use top-level `await`.
- Use `Object.groupBy`.
- Use `array.at(-1)` instead of `length - 1`.
- No need for legacy browser workarounds.

## 8.

- Use modern js shorter syntax like ??, || instead of if else, use object instead of switch, not too nest depth block. if(if()if())

