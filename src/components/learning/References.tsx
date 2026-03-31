interface Reference {
  title: string;
  url: string;
  accessed?: string;
}

export default function References({ items }: { items: Reference[] }) {
  return (
    <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid var(--sl-color-gray-5)', borderRadius: '0.5rem' }}>
      <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--sl-color-white)' }}>참고 자료</h4>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        {items.map((ref, i) => (
          <li key={i} style={{ marginBottom: '0.25rem' }}>
            <a href={ref.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sl-color-accent)' }}>
              {ref.title}
            </a>
            {ref.accessed && <span style={{ color: 'var(--sl-color-gray-4)', fontSize: '0.85rem' }}> (접근: {ref.accessed})</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
