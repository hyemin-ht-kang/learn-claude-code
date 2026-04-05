import { useEffect } from 'react';
import { useAnnotations } from './AnnotationProvider';
import { deserializeAnchor } from './lib/selection-serializer';
import { applyHighlight, clearAllHighlights } from './lib/highlight-renderer';

export default function HighlightLayer() {
  const { annotations } = useAnnotations();

  useEffect(() => {
    // Clear existing highlights and re-apply from annotations
    clearAllHighlights();

    for (let i = 0; i < annotations.length; i++) {
      const annotation = annotations[i];
      const range = deserializeAnchor(annotation.anchor, annotation.selectedText);
      if (range) {
        applyHighlight(range, annotation.id, i);
      }
    }

    // Cleanup on unmount
    return () => clearAllHighlights();
  }, [annotations]);

  return null;
}
