export interface AnnotationAnchor {
  startContainerSelector: string;
  startOffset: number;
  endContainerSelector: string;
  endOffset: number;
  contextBefore: string;
  contextAfter: string;
}

export interface Annotation {
  id: string;
  pageUrl: string;
  pageTitle?: string;
  selectedText: string;
  memo: string;
  anchor: AnnotationAnchor;
  breadcrumb: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PageIndex {
  pathname: string;
  count: number;
  lastUpdated: string;
}

export const STORAGE_PREFIX = 'annotations:';
export const INDEX_KEY = 'annotations:index';

export const HIGHLIGHT_COLORS = [
  { bg: 'rgba(250, 204, 21, 0.3)', border: 'rgb(250, 204, 21)' },
  { bg: 'rgba(74, 222, 128, 0.3)', border: 'rgb(74, 222, 128)' },
  { bg: 'rgba(168, 85, 247, 0.3)', border: 'rgb(168, 85, 247)' },
  { bg: 'rgba(96, 165, 250, 0.3)', border: 'rgb(96, 165, 250)' },
] as const;
