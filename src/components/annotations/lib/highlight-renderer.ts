import { HIGHLIGHT_COLORS } from './types';

export function applyHighlight(range: Range, annotationId: string, colorIndex: number): void {
  const color = HIGHLIGHT_COLORS[colorIndex % HIGHLIGHT_COLORS.length];

  const textNodes = getTextNodesInRange(range);

  for (let i = 0; i < textNodes.length; i++) {
    const { node, startOffset, endOffset } = textNodes[i];
    const text = node.textContent ?? '';

    const mark = document.createElement('span');
    mark.setAttribute('data-annotation-id', annotationId);
    mark.style.backgroundColor = color.bg;
    mark.style.borderBottom = `2px solid ${color.border}`;
    mark.style.borderRadius = '2px';
    mark.style.padding = '1px 0';
    mark.style.cursor = 'pointer';

    if (startOffset > 0) {
      node.splitText(startOffset);
      const newNode = node.nextSibling as Text;
      if (endOffset < text.length) {
        newNode.splitText(endOffset - startOffset);
      }
      wrapTextNode(newNode, mark);
    } else if (endOffset < text.length) {
      node.splitText(endOffset);
      wrapTextNode(node, mark);
    } else {
      wrapTextNode(node, mark);
    }
  }
}

export function removeHighlight(annotationId: string): void {
  const marks = document.querySelectorAll(`span[data-annotation-id="${annotationId}"]`);
  for (const mark of marks) {
    const parent = mark.parentNode;
    if (!parent) continue;

    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark);
    }
    parent.removeChild(mark);

    parent.normalize();
  }
}

export function clearAllHighlights(): void {
  const marks = document.querySelectorAll('span[data-annotation-id]');
  for (const mark of marks) {
    const parent = mark.parentNode;
    if (!parent) continue;
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark);
    }
    parent.removeChild(mark);
    parent.normalize();
  }
}

function wrapTextNode(textNode: Text, mark: HTMLElement): void {
  const parent = textNode.parentNode;
  if (!parent) return;
  parent.insertBefore(mark, textNode);
  mark.appendChild(textNode);
}

function getTextNodesInRange(range: Range): { node: Text; startOffset: number; endOffset: number }[] {
  const results: { node: Text; startOffset: number; endOffset: number }[] = [];

  if (
    range.startContainer === range.endContainer &&
    range.startContainer.nodeType === Node.TEXT_NODE
  ) {
    results.push({
      node: range.startContainer as Text,
      startOffset: range.startOffset,
      endOffset: range.endOffset,
    });
    return results;
  }

  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
  );

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (!range.intersectsNode(node)) continue;

    let startOffset = 0;
    let endOffset = node.textContent?.length ?? 0;

    if (node === range.startContainer) {
      startOffset = range.startOffset;
    }
    if (node === range.endContainer) {
      endOffset = range.endOffset;
    }

    if (startOffset < endOffset) {
      results.push({ node, startOffset, endOffset });
    }
  }

  return results;
}
