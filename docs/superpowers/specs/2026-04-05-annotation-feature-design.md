# Annotation Feature Design Spec

**Date:** 2026-04-05
**Status:** Draft

## Overview

Add a text annotation feature to the Learn Claude Code documentation site. Users select any text on any page, attach a memo via an inline popover, and manage all annotations from a floating panel. Annotations persist in localStorage with JSON/Markdown export and JSON import.

## Architecture

### React Components

| Component | Purpose |
|---|---|
| **AnnotationProvider** | Context provider managing all annotation state for the component tree |
| **HighlightLayer** | Renders `<mark>` wrappers over annotated text on the current page |
| **MemoPopover** | Inline floating box at the selection point for create/edit/delete |
| **AnnotationPanel** | Slide-out panel listing all annotations with breadcrumbs and navigation |
| **AnnotationFAB** | Floating action button (bottom-right) to toggle the panel |

### Core Logic Modules (pure TypeScript, no React dependency)

| Module | Purpose |
|---|---|
| **SelectionSerializer** | Converts browser `Range` objects to/from a storable anchor format |
| **HighlightRenderer** | Wraps matched ranges in `<mark>` elements, handles split text nodes |
| **BreadcrumbResolver** | Walks DOM ancestors to build section hierarchy breadcrumbs |
| **StorageManager** | localStorage CRUD with per-page keying and a cross-page index |
| **ExportManager** | Serialize annotations to JSON/Markdown, import from JSON |

### Data Flow

1. User selects text on the page
2. `MemoPopover` appears at the selection position
3. User writes a memo and clicks Save
4. `SelectionSerializer` serializes the `Range` to an anchor object
5. `BreadcrumbResolver` computes the section hierarchy breadcrumb
6. `StorageManager` persists the annotation to localStorage
7. `HighlightRenderer` wraps the selected text in a `<mark>` element

## Data Model

```typescript
interface Annotation {
  id: string;                  // crypto.randomUUID()
  pageUrl: string;             // location.pathname
  selectedText: string;        // the actual selected text
  memo: string;                // user's memo
  anchor: {
    startContainerSelector: string;  // CSS selector to start node's parent element
    startOffset: number;             // text offset within start container
    endContainerSelector: string;    // CSS selector to end node's parent element
    endOffset: number;               // text offset within end container
    contextBefore: string;           // ~30 chars before selection for fuzzy re-anchoring
    contextAfter: string;            // ~30 chars after selection for fuzzy re-anchoring
  };
  breadcrumb: string[];        // e.g., ["Core Architecture", "Main Loop", "paragraph 3"]
  createdAt: string;           // ISO 8601 timestamp
  updatedAt: string;           // ISO 8601 timestamp
}
```

## Storage

- **localStorage key pattern:** `annotations:<pathname>` — one entry per page holding `Annotation[]`
- **Cross-page index:** `annotations:index` key stores `{ pathname: string; count: number; lastUpdated: string }[]` for the panel's "All pages" view
- Index is updated on every create/update/delete operation

## Selection Serialization & Re-anchoring

### Serialization (on save)

1. From the browser `Range`, find the nearest ancestor element with an `id` or compute a unique CSS selector path for both start and end containers
2. Record text offsets within those containers
3. Capture ~30 characters before and after the selection as context anchors

### Deserialization (on page load)

1. Query start/end containers using stored CSS selectors
2. Apply text offsets to create a new `Range`
3. Validate: check that text at the restored range matches `selectedText`
4. If mismatch: use `contextBefore`/`contextAfter` to fuzzy-search nearby text nodes and re-anchor

### Failure handling

If re-anchoring fails completely (content heavily rewritten), the annotation remains in the panel with a "could not locate" visual indicator. It is never silently deleted. The user can manually delete it or read the selected text preserved in the panel.

## UI Design

### 1. Text Highlight

- `<mark>` elements wrapping selected text nodes
- Each `<mark>` carries `data-annotation-id` for click targeting
- Colors cycle through a palette (gold, green, purple, blue) to distinguish annotations visually
- Selections spanning multiple elements: each text node segment is wrapped individually

### 2. Memo Popover

- Appears below the selection (or above if near page bottom)
- Contains:
  - A label ("Add annotation" or "Edit annotation")
  - A textarea for the memo
  - Cancel and Save buttons
  - Delete button (in edit mode only)
- Dismisses on Escape key or clicking outside

### 3. Floating Action Button (FAB)

- Fixed position, bottom-right corner of the viewport
- Blue circle with an annotation/chat icon
- Clicking toggles the annotation panel
- Shows a badge with the annotation count for the current page

### 4. Annotation Panel

- Slides in from the right edge of the viewport
- Header: title "Annotations", Export dropdown, Import button, close button
- Filter tabs: "This page (N)" / "All pages (N)"
- Annotation list items display:
  - Breadcrumb path in small text (e.g., "Core Architecture › Main Loop › p2")
  - Selected text in italics
  - Memo content
  - Relative timestamp
  - Edit and Delete action links
- Clicking an annotation item scrolls the page to that highlight and briefly pulses it
- In "All pages" view, items are grouped by page with the page path as a subheading; clicking navigates to that page

## Export / Import

### JSON Export

- Full fidelity: serializes the complete `Annotation[]` across all pages
- Filename: `annotations-YYYY-MM-DD.json`
- Re-importable

### Markdown Export

- Human-readable, grouped by page then by breadcrumb section
- Format:
  ```markdown
  # Annotations Export — 2026-04-05

  ## /01-core-architecture/main-loop

  ### Core Architecture › Main Loop › p2
  > "tool execution, and response streaming"

  This is where the tool execution pipeline lives...

  *Created: 2026-04-05 14:30*

  ---
  ```
- One-way export only (not re-importable)

### JSON Import

- Validates structure against the `Annotation` interface
- Deduplicates by `id` — existing annotations with the same id are skipped
- Merges with existing annotations
- Annotations targeting pages that exist are re-anchored on next visit
- Annotations targeting non-existent pages are stored but shown with "page not found" indicator

### UI

- Export button in panel header opens a dropdown: "JSON (full)" / "Markdown (readable)"
- Import button opens a native file picker accepting `.json` files

## CRUD Operations

| Operation | Trigger | Behavior |
|---|---|---|
| **Create** | Select text → popover → Save | Serialize range, compute breadcrumb, store, render highlight |
| **Read** | Page load | Deserialize all annotations for current page, render highlights |
| **Update** | Click highlight → popover (edit mode) → Save | Update memo and `updatedAt`, re-render |
| **Delete** | Click highlight → popover → Delete | Remove from storage, remove `<mark>` wrapper, update index |

## Integration with Starlight

- **Injection method:** Use a Starlight layout override component (Astro's `components` config in `astro.config.mjs`) to inject the annotation system into every page. A custom Astro wrapper component will render the `AnnotationProvider`, `HighlightLayer`, `AnnotationFAB`, and `AnnotationPanel` as a React island with `client:load`, targeting the main content area.
- Starlight renders content inside a `<main>` element with predictable heading structure (`h1`–`h4` with `id` attributes), which `BreadcrumbResolver` uses to compute breadcrumbs
- All annotation CSS uses scoped class names to avoid conflicts with Starlight's theme
- The feature respects Starlight's dark/light mode by using its CSS custom properties (`--sl-color-*`)
- The annotation highlight colors are assigned by cycling through the palette in creation order (annotation index % palette length)

## File Structure

```
src/components/annotations/
├── AnnotationProvider.tsx
├── HighlightLayer.tsx
├── MemoPopover.tsx
├── AnnotationPanel.tsx
├── AnnotationFAB.tsx
├── annotations.css
└── lib/
    ├── types.ts
    ├── selection-serializer.ts
    ├── highlight-renderer.ts
    ├── breadcrumb-resolver.ts
    ├── storage-manager.ts
    └── export-manager.ts
```
