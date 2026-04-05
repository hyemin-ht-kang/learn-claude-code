import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAnnotations,
  saveAnnotation,
  updateAnnotation,
  deleteAnnotation,
  getIndex,
  getAllAnnotations,
} from '../src/components/annotations/lib/storage-manager';
import type { Annotation } from '../src/components/annotations/lib/types';

const mockAnnotation: Annotation = {
  id: 'test-id-1',
  pageUrl: '/learn-claude-code/01-core-architecture/01-overview',
  selectedText: 'hello world',
  memo: 'test memo',
  anchor: {
    startContainerSelector: '#content > p:nth-child(1)',
    startOffset: 0,
    endContainerSelector: '#content > p:nth-child(1)',
    endOffset: 11,
    contextBefore: '',
    contextAfter: ' is a test',
  },
  breadcrumb: ['Core Architecture', 'Overview', 'p1'],
  createdAt: '2026-04-05T10:00:00.000Z',
  updatedAt: '2026-04-05T10:00:00.000Z',
};

const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};

beforeEach(() => {
  localStorageMock.clear();
  Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });
});

describe('StorageManager', () => {
  it('getAnnotations returns empty array for unknown page', () => {
    expect(getAnnotations('/unknown')).toEqual([]);
  });

  it('saveAnnotation stores and retrieves an annotation', () => {
    saveAnnotation(mockAnnotation);
    const result = getAnnotations(mockAnnotation.pageUrl);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('test-id-1');
    expect(result[0].memo).toBe('test memo');
  });

  it('saveAnnotation updates the index', () => {
    saveAnnotation(mockAnnotation);
    const index = getIndex();
    expect(index).toHaveLength(1);
    expect(index[0].pathname).toBe(mockAnnotation.pageUrl);
    expect(index[0].count).toBe(1);
  });

  it('updateAnnotation changes memo and updatedAt', () => {
    saveAnnotation(mockAnnotation);
    updateAnnotation(mockAnnotation.pageUrl, 'test-id-1', { memo: 'updated memo' });
    const result = getAnnotations(mockAnnotation.pageUrl);
    expect(result[0].memo).toBe('updated memo');
    expect(result[0].updatedAt).not.toBe(mockAnnotation.updatedAt);
  });

  it('deleteAnnotation removes the annotation', () => {
    saveAnnotation(mockAnnotation);
    deleteAnnotation(mockAnnotation.pageUrl, 'test-id-1');
    expect(getAnnotations(mockAnnotation.pageUrl)).toEqual([]);
  });

  it('deleteAnnotation updates the index count', () => {
    saveAnnotation(mockAnnotation);
    deleteAnnotation(mockAnnotation.pageUrl, 'test-id-1');
    const index = getIndex();
    expect(index).toHaveLength(0);
  });

  it('getAllAnnotations collects from multiple pages', () => {
    saveAnnotation(mockAnnotation);
    const second = { ...mockAnnotation, id: 'test-id-2', pageUrl: '/other-page' };
    saveAnnotation(second);
    const all = getAllAnnotations();
    expect(all).toHaveLength(2);
  });
});
