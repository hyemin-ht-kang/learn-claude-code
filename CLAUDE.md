# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Korean-language documentation site for deep-diving into Claude Code's source code, built with Astro Starlight. Deployed to GitHub Pages at `https://hyemin-ht-kang.github.io/learn-claude-code/`.

## Commands

- `pnpm dev` — start dev server
- `pnpm build` — production build (output: `dist/`)
- `pnpm test` — run all tests (vitest)
- `pnpm test:watch` — run tests in watch mode
- `pnpm exec vitest run tests/storage-manager.test.ts` — run a single test file

## Architecture

**Astro Starlight + React + Tailwind CSS v4**

- Content lives in `src/content/docs/` as `.mdx` files organized into 10 numbered chapters (01–10)
- Content schema extended in `src/content.config.ts` with optional fields: `learning_objectives`, `prerequisites`, `estimated_minutes`, `references`
- Sidebar auto-generated from directory structure (configured in `astro.config.mjs`)
- Base path is `/learn-claude-code` — all assets and links must account for this

**Annotation System** (`src/components/annotations/`): Client-side text annotation feature using React (loaded via `client:load`). Users can highlight text on any doc page and attach memos. Data stored in localStorage with `annotations:` prefix. Key modules:
- `AnnotationRoot.tsx` — top-level React component injected via Starlight `MarkdownContent` component override (`src/components/overrides/MarkdownContent.astro`)
- `lib/storage-manager.ts` — CRUD operations for annotations in localStorage
- `lib/selection-serializer.ts` — serializes DOM selections to stable anchors
- `lib/export-manager.ts` — JSON/Markdown export/import
- `lib/highlight-renderer.ts` — renders highlight overlays on the DOM

**Learning Components** (`src/components/learning/`): React components for interactive educational elements (ConceptCard, Quiz, References) used within MDX content.

## Key Conventions

- Primary language for docs and UI text is Korean
- React components use TSX with `react-jsx` transform (no React import needed)
- Tests are in `tests/` at project root (not co-located), using vitest with node environment
- CI deploys via GitHub Actions on push to `main` (pnpm 10, Node 22)
