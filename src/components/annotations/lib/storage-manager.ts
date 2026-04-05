import type { Annotation, PageIndex } from './types';
import { STORAGE_PREFIX, INDEX_KEY } from './types';

export function getAnnotations(pageUrl: string): Annotation[] {
  const raw = localStorage.getItem(`${STORAGE_PREFIX}${pageUrl}`);
  if (!raw) return [];
  return JSON.parse(raw) as Annotation[];
}

export function saveAnnotation(annotation: Annotation): void {
  const existing = getAnnotations(annotation.pageUrl);
  existing.push(annotation);
  localStorage.setItem(`${STORAGE_PREFIX}${annotation.pageUrl}`, JSON.stringify(existing));
  updateIndex(annotation.pageUrl, existing.length);
}

export function updateAnnotation(
  pageUrl: string,
  id: string,
  updates: { memo: string },
): Annotation | null {
  const annotations = getAnnotations(pageUrl);
  const idx = annotations.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  annotations[idx] = {
    ...annotations[idx],
    memo: updates.memo,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(`${STORAGE_PREFIX}${pageUrl}`, JSON.stringify(annotations));
  updateIndex(pageUrl, annotations.length);
  return annotations[idx];
}

export function deleteAnnotation(pageUrl: string, id: string): void {
  const annotations = getAnnotations(pageUrl).filter((a) => a.id !== id);
  if (annotations.length === 0) {
    localStorage.removeItem(`${STORAGE_PREFIX}${pageUrl}`);
  } else {
    localStorage.setItem(`${STORAGE_PREFIX}${pageUrl}`, JSON.stringify(annotations));
  }
  updateIndex(pageUrl, annotations.length);
}

export function getIndex(): PageIndex[] {
  const raw = localStorage.getItem(INDEX_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as PageIndex[];
}

export function getAllAnnotations(): Annotation[] {
  const index = getIndex();
  const all: Annotation[] = [];
  for (const entry of index) {
    all.push(...getAnnotations(entry.pathname));
  }
  return all;
}

function updateIndex(pathname: string, count: number): void {
  const index = getIndex();
  const existing = index.findIndex((e) => e.pathname === pathname);

  if (count === 0) {
    if (existing !== -1) index.splice(existing, 1);
  } else if (existing !== -1) {
    index[existing] = { pathname, count, lastUpdated: new Date().toISOString() };
  } else {
    index.push({ pathname, count, lastUpdated: new Date().toISOString() });
  }

  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}
