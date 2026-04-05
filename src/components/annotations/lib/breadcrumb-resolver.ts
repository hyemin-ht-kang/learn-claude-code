const HEADING_LEVELS = ['h1', 'h2', 'h3', 'h4'] as const;

export function resolveBreadcrumb(node: Node): string[] {
  const contentRoot = findContentRoot(node);
  if (!contentRoot) return [];

  const headings = Array.from(
    contentRoot.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4'),
  );

  if (headings.length === 0) return [];

  const nodePosition = getNodePosition(node, contentRoot);
  const precedingHeadings: HTMLHeadingElement[] = [];

  for (const h of headings) {
    if (getNodePosition(h, contentRoot) <= nodePosition) {
      precedingHeadings.push(h);
    }
  }

  const hierarchy: Map<number, string> = new Map();
  for (const h of precedingHeadings) {
    const level = headingLevel(h);
    hierarchy.set(level, h.textContent?.trim() ?? '');
    for (const [key] of hierarchy) {
      if (key > level) hierarchy.delete(key);
    }
  }

  const breadcrumb: string[] = [];
  for (const level of [1, 2, 3, 4]) {
    const text = hierarchy.get(level);
    if (text) breadcrumb.push(text);
  }

  const suffix = getPositionalSuffix(node, contentRoot);
  if (suffix) breadcrumb.push(suffix);

  return breadcrumb;
}

function findContentRoot(node: Node): Element | null {
  let current: Node | null = node;
  while (current) {
    if (
      current instanceof Element &&
      current.classList.contains('sl-markdown-content')
    ) {
      return current;
    }
    current = current.parentNode;
  }
  return document.querySelector('.sl-markdown-content');
}

function getNodePosition(node: Node, root: Element): number {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL);
  let position = 0;
  while (walker.nextNode()) {
    position++;
    if (walker.currentNode === node || walker.currentNode.contains?.(node)) {
      return position;
    }
  }
  return position;
}

function headingLevel(heading: HTMLHeadingElement): number {
  return parseInt(heading.tagName[1], 10);
}

function getPositionalSuffix(node: Node, contentRoot: Element): string {
  let el: Element | null =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement;

  while (el && el !== contentRoot) {
    const tag = el.tagName.toLowerCase();

    if (tag === 'pre' || tag === 'code') {
      const codeBlocks = Array.from(contentRoot.querySelectorAll('pre'));
      const idx = codeBlocks.indexOf(el.closest('pre')!);
      return idx >= 0 ? `code block ${idx + 1}` : 'code block';
    }

    if (tag === 'p') {
      const paragraphs = Array.from(contentRoot.querySelectorAll('p'));
      const idx = paragraphs.indexOf(el as HTMLParagraphElement);
      return idx >= 0 ? `p${idx + 1}` : 'paragraph';
    }

    if (tag === 'li') {
      return 'list item';
    }

    if (tag === 'table' || tag === 'td' || tag === 'th') {
      return 'table';
    }

    if (HEADING_LEVELS.includes(tag as (typeof HEADING_LEVELS)[number])) {
      return 'heading';
    }

    el = el.parentElement;
  }

  return '';
}
