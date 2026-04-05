import type { AnnotationAnchor } from './types';

function buildSelector(element: Element): string {
  if (element.id) return `#${CSS.escape(element.id)}`;

  const parts: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.documentElement) {
    if (current.id) {
      parts.unshift(`#${CSS.escape(current.id)}`);
      break;
    }

    const parent: Element | null = current.parentElement;
    if (!parent) {
      parts.unshift(current.tagName.toLowerCase());
      break;
    }

    const siblings = Array.from(parent.children).filter(
      (c: Element) => c.tagName === current!.tagName,
    );

    if (siblings.length === 1) {
      parts.unshift(current.tagName.toLowerCase());
    } else {
      const index = siblings.indexOf(current) + 1;
      parts.unshift(`${current.tagName.toLowerCase()}:nth-of-type(${index})`);
    }

    current = parent;
  }

  return parts.join(' > ');
}

function getElementContainer(node: Node): { element: Element; textOffset: number } {
  if (node.nodeType === Node.ELEMENT_NODE) {
    return { element: node as Element, textOffset: 0 };
  }

  const parent = node.parentElement;
  if (!parent) throw new Error('Cannot serialize: node has no parent element');

  let textOffset = 0;
  for (const child of Array.from(parent.childNodes)) {
    if (child === node) break;
    if (child.nodeType === Node.TEXT_NODE) {
      textOffset += (child.textContent ?? '').length;
    }
  }

  return { element: parent, textOffset };
}

function getContext(container: Node, offset: number, direction: 'before' | 'after'): string {
  const fullText = container.textContent ?? '';
  if (direction === 'before') {
    const start = Math.max(0, offset - 30);
    return fullText.slice(start, offset);
  }
  return fullText.slice(offset, offset + 30);
}

export function serializeSelection(range: Range): {
  anchor: AnnotationAnchor;
  selectedText: string;
} {
  const selectedText = range.toString();

  const start = getElementContainer(range.startContainer);
  const end = getElementContainer(range.endContainer);

  const startSelector = buildSelector(start.element);
  const endSelector = buildSelector(end.element);

  const startOffset = start.textOffset + range.startOffset;
  const endOffset = end.textOffset + range.endOffset;

  const contextBefore = getContext(range.startContainer, range.startOffset, 'before');
  const contextAfter = getContext(range.endContainer, range.endOffset, 'after');

  return {
    anchor: {
      startContainerSelector: startSelector,
      startOffset,
      endContainerSelector: endSelector,
      endOffset,
      contextBefore,
      contextAfter,
    },
    selectedText,
  };
}

export function deserializeAnchor(
  anchor: AnnotationAnchor,
  expectedText: string,
): Range | null {
  try {
    const startEl = document.querySelector(anchor.startContainerSelector);
    const endEl = document.querySelector(anchor.endContainerSelector);
    if (!startEl || !endEl) return null;

    const range = document.createRange();

    const startNode = findTextNodeAtOffset(startEl, anchor.startOffset);
    const endNode = findTextNodeAtOffset(endEl, anchor.endOffset);
    if (!startNode || !endNode) return null;

    range.setStart(startNode.node, startNode.offset);
    range.setEnd(endNode.node, endNode.offset);

    if (range.toString() === expectedText) return range;

    return fuzzySearch(startEl, expectedText);
  } catch {
    return null;
  }
}

function findTextNodeAtOffset(
  element: Element,
  targetOffset: number,
): { node: Text; offset: number } | null {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let accumulated = 0;
  let node: Text | null;

  while ((node = walker.nextNode() as Text | null)) {
    const len = node.textContent?.length ?? 0;
    if (accumulated + len >= targetOffset) {
      return { node, offset: targetOffset - accumulated };
    }
    accumulated += len;
  }

  return null;
}

function fuzzySearch(root: Element, searchText: string): Range | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node: Text | null;

  while ((node = walker.nextNode() as Text | null)) {
    textNodes.push(node);
  }

  let fullText = '';
  const nodeOffsets: { node: Text; start: number }[] = [];

  for (const tn of textNodes) {
    nodeOffsets.push({ node: tn, start: fullText.length });
    fullText += tn.textContent ?? '';
  }

  const idx = fullText.indexOf(searchText);
  if (idx === -1) return null;

  const startPos = idx;
  const endPos = idx + searchText.length;

  const startNode = findNodeAtPosition(nodeOffsets, startPos);
  const endNode = findNodeAtPosition(nodeOffsets, endPos);
  if (!startNode || !endNode) return null;

  const range = document.createRange();
  range.setStart(startNode.node, startNode.offset);
  range.setEnd(endNode.node, endNode.offset);
  return range;
}

function findNodeAtPosition(
  nodeOffsets: { node: Text; start: number }[],
  position: number,
): { node: Text; offset: number } | null {
  for (let i = nodeOffsets.length - 1; i >= 0; i--) {
    if (nodeOffsets[i].start <= position) {
      return { node: nodeOffsets[i].node, offset: position - nodeOffsets[i].start };
    }
  }
  return null;
}
