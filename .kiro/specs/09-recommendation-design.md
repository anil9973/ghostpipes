# Recommendation UI Design Integration

## Layout Position

### Home Page Structure

```
┌──────────────────────────────────────────────┐
│  GhostPipes                        [Profile] │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  📎 Drop file, paste text, or URL    │ │
│  │  [                                  ] │ │
│  │                                        │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  🔮 Suggested Pipelines                     │ <- NEW
│  ┌────────────────────────────────────────┐ │
│  │  ⭐ CSV Data Processor          85%   │ │
│  │  Processes CSV with aggregation        │ │
│  │  Used 3 times with CSV files           │ │
│  │  [Run Pipeline] [Edit]                 │ │
│  ├────────────────────────────────────────┤ │
│  │  Product Price Tracker          72%   │ │
│  │  ...                                   │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  My Pipelines                               │
│  [Search] [Filter] [Sort]                   │
│  ┌────────────────────────────────────────┐ │
│  │  Data Processor     ┊  Modified 2h ago │ │
│  │  ...                                   │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

## Component States

### Loading State

```
┌────────────────────────────────────────────┐
│  🔮 Finding best pipelines...              │
│  [░░░░░░░░░░░░] Analyzing input            │
└────────────────────────────────────────────┘
```

### Empty State (No Recommendations)

```
┌────────────────────────────────────────────┐
│  💡 No matching pipelines found            │
│                                            │
│  Want to create a pipeline for CSV files? │
│  [Create from Template] [Start from Scratch] │
└────────────────────────────────────────────┘
```

### Recommendation Card (Expanded)

```
┌────────────────────────────────────────────┐
│  ⭐ CSV Data Processor            85%      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 85%       │
│                                            │
│  📋 Processes CSV files with aggregation   │
│  and generates summary statistics          │
│                                            │
│  ✓ Exact MIME type match (text/csv)       │
│  ✓ Has CSV parser configured               │
│  ✓ Used successfully 3 times               │
│  ✓ Last used 2 days ago                    │
│                                            │
│  [🚀 Run Pipeline] [✏️ Edit] [👁️ Preview]  │
└────────────────────────────────────────────┘
```

## CSS Styling (Spooky Theme)

### recommendation-card.css

```css
.recommendations-section {
	margin: 1.5em 0;
	padding: 1em;
	background: var(--bg-secondary);
	border: 0.125em solid var(--border-color);
	border-radius: 0.5em;

	&:empty {
		display: none;
	}
}

.recommendations-header {
	display: flex;
	align-items: center;
	gap: 0.5em;
	margin-bottom: 1em;
	color: var(--text-primary);
	font-size: 1.125em;
	font-weight: 600;

	&::before {
		content: "🔮";
		font-size: 1.25em;
	}
}

.recommendation-card {
	background: var(--bg-primary);
	border: 0.0625em solid var(--border-color);
	border-radius: 0.375em;
	padding: 1em;
	margin-bottom: 0.75em;
	transition: all 0.2s ease;

	&:hover {
		border-color: var(--accent-color);
		box-shadow: 0 0 1em rgba(var(--accent-rgb), 0.3);
	}

	&[data-confidence="high"] {
		border-left: 0.25em solid var(--success-color);
	}

	&[data-confidence="good"] {
		border-left: 0.25em solid var(--accent-color);
	}

	&[data-confidence="possible"] {
		border-left: 0.25em solid var(--warning-color);
	}
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 0.5em;

	h3 {
		margin: 0;
		color: var(--text-primary);
		font-size: 1em;
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	.confidence-badge {
		font-size: 0.875em;
		font-weight: 600;
		color: var(--accent-color);
	}
}

.card-description {
	color: var(--text-secondary);
	font-size: 0.875em;
	margin-bottom: 0.75em;
	line-height: 1.4;
}

.card-reasons {
	list-style: none;
	padding: 0;
	margin: 0.75em 0;
	font-size: 0.8125em;

	li {
		color: var(--text-secondary);
		padding: 0.25em 0;
		display: flex;
		align-items: center;
		gap: 0.5em;

		&::before {
			content: "✓";
			color: var(--success-color);
			font-weight: bold;
		}
	}
}

.card-actions {
	display: flex;
	gap: 0.5em;
	margin-top: 0.75em;

	button {
		flex: 1;
		padding: 0.5em 1em;
		border: 0.0625em solid var(--border-color);
		border-radius: 0.25em;
		background: var(--bg-secondary);
		color: var(--text-primary);
		cursor: pointer;
		font-size: 0.875em;
		transition: all 0.2s;

		&:hover {
			background: var(--accent-color);
			border-color: var(--accent-color);
			color: var(--bg-primary);
		}

		&.primary {
			background: var(--accent-color);
			border-color: var(--accent-color);
			color: var(--bg-primary);
			font-weight: 600;

			&:hover {
				background: var(--accent-hover);
			}
		}
	}
}

.loading-state {
	text-align: center;
	padding: 2em;
	color: var(--text-secondary);

	.spinner {
		display: inline-block;
		width: 2em;
		height: 2em;
		border: 0.25em solid var(--border-color);
		border-top-color: var(--accent-color);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.empty-state {
	text-align: center;
	padding: 2em;

	p {
		color: var(--text-secondary);
		margin-bottom: 1em;
	}

	button {
		margin: 0 0.5em;
	}
}
```

## Animation Timing

### Appearance

- Recommendations fade in after 200ms delay
- Each card staggers by 100ms (card 1 at 200ms, card 2 at 300ms, etc.)
- Smooth height transition when expanding/collapsing

### Interactions

- Hover effects: 200ms ease transition
- Button clicks: Immediate visual feedback
- Loading spinner: Smooth rotation

## Accessibility

### ARIA Labels

```html
<section class="recommendations-section" role="region" aria-label="Suggested pipelines">
	<div class="recommendation-card" role="article" aria-label="Pipeline recommendation: CSV Data Processor">
		<h3>CSV Data Processor</h3>
		<span class="confidence-badge" aria-label="Confidence level: 85 percent"> 85% </span>

		<button class="primary" aria-label="Run CSV Data Processor pipeline">Run Pipeline</button>
	</div>
</section>
```
