import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Annotation } from './lib/types';
import {
  getAnnotations,
  saveAnnotation,
  updateAnnotation,
  deleteAnnotation as deleteFromStorage,
} from './lib/storage-manager';
import { serializeSelection } from './lib/selection-serializer';
import { resolveBreadcrumb } from './lib/breadcrumb-resolver';

interface PopoverState {
  position: { x: number; y: number };
  range: Range | null;
  editingAnnotation: Annotation | null;
}

interface AnnotationContextType {
  annotations: Annotation[];
  popover: PopoverState | null;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  closePopover: () => void;
  handleSaveMemo: (memo: string) => void;
  handleDeleteAnnotation: (annotation: Annotation) => void;
  handleEditAnnotation: (annotation: Annotation) => void;
  handleNavigate: (annotation: Annotation) => void;
  handleImport: (imported: Annotation[]) => void;
  reload: () => void;
}

const AnnotationContext = createContext<AnnotationContextType | null>(null);

export function useAnnotations() {
  const ctx = useContext(AnnotationContext);
  if (!ctx) throw new Error('useAnnotations must be used within AnnotationProvider');
  return ctx;
}

export default function AnnotationProvider({ children }: { children: React.ReactNode }) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '';

  const reload = useCallback(() => {
    setAnnotations(getAnnotations(pageUrl));
  }, [pageUrl]);

  // Load annotations on mount
  useEffect(() => {
    reload();
  }, [reload]);

  // Listen for text selection
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      const text = range.toString().trim();
      if (!text) return;

      // Only annotate within the content area
      const contentRoot = document.querySelector('.sl-markdown-content');
      if (!contentRoot || !contentRoot.contains(range.commonAncestorContainer)) return;

      // Don't trigger on clicks inside our own UI
      const target = range.startContainer.parentElement;
      if (target?.closest('[data-annotation-ui]')) return;

      const rect = range.getBoundingClientRect();
      setPopover({
        position: { x: rect.left, y: rect.bottom },
        range,
        editingAnnotation: null,
      });
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Listen for clicks on existing highlights
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const mark = (e.target as Element).closest?.('mark[data-annotation-id]');
      if (!mark) return;

      const id = mark.getAttribute('data-annotation-id');
      const annotation = annotations.find((a) => a.id === id);
      if (!annotation) return;

      e.preventDefault();
      e.stopPropagation();

      const rect = mark.getBoundingClientRect();
      setPopover({
        position: { x: rect.left, y: rect.bottom },
        range: null,
        editingAnnotation: annotation,
      });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [annotations]);

  const closePopover = useCallback(() => {
    setPopover(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  const handleSaveMemo = useCallback(
    (memo: string) => {
      if (!popover) return;

      if (popover.editingAnnotation) {
        // Update existing
        updateAnnotation(pageUrl, popover.editingAnnotation.id, { memo });
      } else if (popover.range) {
        // Create new
        const { anchor, selectedText } = serializeSelection(popover.range);
        const breadcrumb = resolveBreadcrumb(popover.range.startContainer);

        const pageTitle = resolvePageTitle();

        const annotation: Annotation = {
          id: crypto.randomUUID(),
          pageUrl,
          pageTitle,
          selectedText,
          memo,
          anchor,
          breadcrumb,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        saveAnnotation(annotation);
      }

      closePopover();
      reload();
    },
    [popover, pageUrl, closePopover, reload],
  );

  const handleDeleteAnnotation = useCallback(
    (annotation: Annotation) => {
      deleteFromStorage(annotation.pageUrl, annotation.id);
      closePopover();
      reload();
    },
    [closePopover, reload],
  );

  const handleEditAnnotation = useCallback(
    (annotation: Annotation) => {
      const mark = document.querySelector(`mark[data-annotation-id="${annotation.id}"]`);
      if (mark) {
        const rect = mark.getBoundingClientRect();
        setPopover({
          position: { x: rect.left, y: rect.bottom },
          range: null,
          editingAnnotation: annotation,
        });
      }
    },
    [],
  );

  const handleNavigate = useCallback(
    (annotation: Annotation) => {
      // If on a different page, navigate
      if (annotation.pageUrl !== pageUrl) {
        window.location.href = annotation.pageUrl;
        return;
      }

      // Scroll to the highlight
      const mark = document.querySelector(`mark[data-annotation-id="${annotation.id}"]`);
      if (mark) {
        mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Pulse animation
        mark.classList.add('annotation-pulse');
        setTimeout(() => mark.classList.remove('annotation-pulse'), 1500);
      }
    },
    [pageUrl],
  );

  const handleImport = useCallback(
    (imported: Annotation[]) => {
      // Deduplicate by id
      const existingIds = new Set(getAllAnnotationsIds());
      for (const a of imported) {
        if (!existingIds.has(a.id)) {
          saveAnnotation(a);
        }
      }
      reload();
    },
    [reload],
  );

  const value: AnnotationContextType = {
    annotations,
    popover,
    panelOpen,
    setPanelOpen,
    closePopover,
    handleSaveMemo,
    handleDeleteAnnotation,
    handleEditAnnotation,
    handleNavigate,
    handleImport,
    reload,
  };

  return (
    <AnnotationContext.Provider value={value}>
      <div data-annotation-ui>
        {children}
      </div>
    </AnnotationContext.Provider>
  );
}

function resolvePageTitle(): string {
  const activeLink = document.querySelector('a[aria-current="page"]');
  const pageLabel = activeLink?.querySelector('span')?.textContent?.trim() || '';

  // Walk up to the parent <details> group to get the section name
  const group = activeLink?.closest('ul')?.closest('li')?.querySelector(':scope > details > summary .group-label .large');
  const sectionLabel = group?.textContent?.trim() || '';

  if (sectionLabel && pageLabel) return `${sectionLabel} › ${pageLabel}`;
  return pageLabel || document.querySelector('h1')?.textContent?.trim() || '';
}

function getAllAnnotationsIds(): string[] {
  const index = JSON.parse(localStorage.getItem('annotations:index') ?? '[]');
  const ids: string[] = [];
  for (const entry of index) {
    const raw = localStorage.getItem(`annotations:${entry.pathname}`);
    if (raw) {
      const anns = JSON.parse(raw) as Annotation[];
      ids.push(...anns.map((a) => a.id));
    }
  }
  return ids;
}
