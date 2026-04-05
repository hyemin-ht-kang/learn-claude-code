import { useState, useEffect, useRef } from 'react';

interface MemoPopoverProps {
  position: { x: number; y: number };
  initialMemo: string;
  isEditing: boolean;
  onSave: (memo: string) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export default function MemoPopover({
  position,
  initialMemo,
  isEditing,
  onSave,
  onDelete,
  onCancel,
}: MemoPopoverProps) {
  const [memo, setMemo] = useState(initialMemo);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMemo(initialMemo);
    // Focus textarea on mount
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [initialMemo]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };
    // Delay to avoid closing on the same click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onCancel]);

  // Calculate position: ensure popover stays within viewport
  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 320),
    top: position.y + 8,
    zIndex: 9999,
    width: 300,
    background: 'var(--sl-color-gray-6)',
    border: '1px solid var(--sl-color-gray-5)',
    borderRadius: '0.5rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    padding: '0.75rem',
  };

  // Flip above if too close to bottom
  if (position.y + 200 > window.innerHeight) {
    style.top = position.y - 180;
  }

  return (
    <div ref={popoverRef} style={style}>
      <div style={{ fontSize: '0.75rem', color: 'var(--sl-color-gray-3)', marginBottom: '0.5rem' }}>
        {isEditing ? '메모 수정' : '메모 추가'}
      </div>
      <textarea
        ref={textareaRef}
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="메모를 입력하세요..."
        style={{
          width: '100%',
          minHeight: '4rem',
          padding: '0.5rem',
          background: 'var(--sl-color-gray-7)',
          border: '1px solid var(--sl-color-gray-5)',
          borderRadius: '0.375rem',
          color: 'var(--sl-color-white)',
          fontSize: '0.875rem',
          fontFamily: 'var(--sl-font)',
          resize: 'vertical',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--sl-color-accent)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--sl-color-gray-5)';
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
        {isEditing && onDelete && (
          <button
            onClick={onDelete}
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '0.75rem',
              background: 'transparent',
              color: '#f87171',
              border: '1px solid #f87171',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              marginRight: 'auto',
            }}
          >
            삭제
          </button>
        )}
        <button
          onClick={onCancel}
          style={{
            padding: '0.375rem 0.75rem',
            fontSize: '0.75rem',
            background: 'transparent',
            color: 'var(--sl-color-gray-3)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          취소
        </button>
        <button
          onClick={() => {
            if (memo.trim()) onSave(memo.trim());
          }}
          disabled={!memo.trim()}
          style={{
            padding: '0.375rem 0.75rem',
            fontSize: '0.75rem',
            background: memo.trim() ? 'var(--sl-color-accent)' : 'var(--sl-color-gray-5)',
            color: memo.trim() ? 'var(--sl-color-black)' : 'var(--sl-color-gray-3)',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: memo.trim() ? 'pointer' : 'not-allowed',
            fontWeight: 600,
          }}
        >
          저장
        </button>
      </div>
    </div>
  );
}
