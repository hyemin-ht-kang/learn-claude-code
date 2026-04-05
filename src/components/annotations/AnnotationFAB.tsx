interface AnnotationFABProps {
  count: number;
  isOpen: boolean;
  onClick: () => void;
}

export default function AnnotationFAB({ count, isOpen, onClick }: AnnotationFABProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? '주석 패널 닫기' : '주석 패널 열기'}
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        width: '3rem',
        height: '3rem',
        borderRadius: '50%',
        background: isOpen ? 'var(--sl-color-gray-4)' : 'var(--sl-color-accent)',
        color: isOpen ? 'var(--sl-color-white)' : 'var(--sl-color-black)',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998,
        transition: 'background 0.2s, transform 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
      }}
    >
      {/* Annotation icon (chat bubble with pencil) */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>

      {/* Badge */}
      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-0.25rem',
            right: '-0.25rem',
            minWidth: '1.25rem',
            height: '1.25rem',
            borderRadius: '0.625rem',
            background: '#f87171',
            color: 'white',
            fontSize: '0.625rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 0.25rem',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
