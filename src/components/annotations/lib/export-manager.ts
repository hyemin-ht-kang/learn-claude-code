import type { Annotation } from './types';

export function exportToJson(annotations: Annotation[]): string {
  return JSON.stringify(annotations, null, 2);
}

export function exportToMarkdown(annotations: Annotation[]): string {
  const byPage = new Map<string, Annotation[]>();
  for (const a of annotations) {
    const list = byPage.get(a.pageUrl) ?? [];
    list.push(a);
    byPage.set(a.pageUrl, list);
  }

  const today = new Date().toISOString().slice(0, 10);
  const lines: string[] = [`# Annotations Export — ${today}`, ''];

  for (const [pageUrl, pageAnnotations] of byPage) {
    lines.push(`## ${pageUrl}`, '');

    for (const a of pageAnnotations) {
      const breadcrumb = a.breadcrumb.join(' › ');
      lines.push(`### ${breadcrumb}`);
      lines.push(`> "${a.selectedText}"`, '');
      lines.push(a.memo, '');
      lines.push(`*Created: ${a.createdAt.slice(0, 16).replace('T', ' ')}*`, '');
      lines.push('---', '');
    }
  }

  return lines.join('\n');
}

export function importFromJson(jsonString: string): Annotation[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  return parsed.filter(isValidAnnotation) as Annotation[];
}

function isValidAnnotation(obj: unknown): boolean {
  if (typeof obj !== 'object' || obj === null) return false;
  const a = obj as Record<string, unknown>;
  return (
    typeof a.id === 'string' &&
    typeof a.pageUrl === 'string' &&
    typeof a.selectedText === 'string' &&
    typeof a.memo === 'string' &&
    typeof a.anchor === 'object' &&
    a.anchor !== null &&
    Array.isArray(a.breadcrumb) &&
    typeof a.createdAt === 'string' &&
    typeof a.updatedAt === 'string'
  );
}
