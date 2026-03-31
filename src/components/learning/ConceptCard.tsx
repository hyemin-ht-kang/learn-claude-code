import type { ReactNode } from 'react';

interface ConceptCardProps {
  title: string;
  children: ReactNode;
}

export default function ConceptCard({ title, children }: ConceptCardProps) {
  return (
    <details className="concept-card">
      <summary>{title}</summary>
      <div style={{ marginTop: '0.5rem', color: 'var(--sl-color-gray-2)' }}>
        {children}
      </div>
    </details>
  );
}
