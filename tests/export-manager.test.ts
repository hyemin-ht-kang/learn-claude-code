import { describe, it, expect } from 'vitest';
import {
  exportToJson,
  exportToMarkdown,
  importFromJson,
} from '../src/components/annotations/lib/export-manager';
import type { Annotation } from '../src/components/annotations/lib/types';

const annotations: Annotation[] = [
  {
    id: 'a1',
    pageUrl: '/learn-claude-code/01-core-architecture/01-overview',
    selectedText: 'hello world',
    memo: 'This is interesting',
    anchor: {
      startContainerSelector: '#content > p',
      startOffset: 0,
      endContainerSelector: '#content > p',
      endOffset: 11,
      contextBefore: '',
      contextAfter: ' end',
    },
    breadcrumb: ['Core Architecture', 'Overview', 'p1'],
    createdAt: '2026-04-05T10:00:00.000Z',
    updatedAt: '2026-04-05T10:00:00.000Z',
  },
  {
    id: 'a2',
    pageUrl: '/learn-claude-code/02-tool-system/01-tool-architecture',
    selectedText: 'tool system',
    memo: 'Remember this',
    anchor: {
      startContainerSelector: '#content > h2',
      startOffset: 0,
      endContainerSelector: '#content > h2',
      endOffset: 11,
      contextBefore: 'the ',
      contextAfter: ' works',
    },
    breadcrumb: ['Tool System', 'Architecture'],
    createdAt: '2026-04-05T11:00:00.000Z',
    updatedAt: '2026-04-05T11:00:00.000Z',
  },
];

describe('ExportManager', () => {
  describe('exportToJson', () => {
    it('returns valid JSON string with all annotations', () => {
      const json = exportToJson(annotations);
      const parsed = JSON.parse(json);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].id).toBe('a1');
      expect(parsed[1].id).toBe('a2');
    });
  });

  describe('exportToMarkdown', () => {
    it('groups annotations by page', () => {
      const md = exportToMarkdown(annotations);
      expect(md).toContain('## /learn-claude-code/01-core-architecture/01-overview');
      expect(md).toContain('## /learn-claude-code/02-tool-system/01-tool-architecture');
    });

    it('includes breadcrumb as section heading', () => {
      const md = exportToMarkdown(annotations);
      expect(md).toContain('### Core Architecture › Overview › p1');
    });

    it('includes selected text as blockquote', () => {
      const md = exportToMarkdown(annotations);
      expect(md).toContain('> "hello world"');
    });

    it('includes memo text', () => {
      const md = exportToMarkdown(annotations);
      expect(md).toContain('This is interesting');
    });
  });

  describe('importFromJson', () => {
    it('parses valid JSON and returns annotations', () => {
      const json = exportToJson(annotations);
      const result = importFromJson(json);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('a1');
    });

    it('returns empty array for invalid JSON', () => {
      expect(importFromJson('not json')).toEqual([]);
    });

    it('filters out entries missing required fields', () => {
      const json = JSON.stringify([{ id: 'x' }, annotations[0]]);
      const result = importFromJson(json);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('a1');
    });
  });
});
