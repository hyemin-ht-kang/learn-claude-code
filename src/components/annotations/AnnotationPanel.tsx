import { useState, useRef } from 'react';
import type { Annotation } from './lib/types';
import { exportToJson, exportToMarkdown, importFromJson } from './lib/export-manager';
import { getAllAnnotations } from './lib/storage-manager';

interface AnnotationPanelProps {
  currentPageAnnotations: Annotation[];
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (annotation: Annotation) => void;
  onEdit: (annotation: Annotation) => void;
  onDelete: (annotation: Annotation) => void;
  onImport: (annotations: Annotation[]) => void;
}

type Tab = 'current' | 'all';

export default function AnnotationPanel({
  currentPageAnnotations,
  isOpen,
  onClose,
  onNavigate,
  onEdit,
  onDelete,
  onImport,
}: AnnotationPanelProps) {
  const [tab, setTab] = useState<Tab>('current');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allAnnotations = tab === 'all' ? getAllAnnotations() : [];
  const displayAnnotations = tab === 'current' ? currentPageAnnotations : allAnnotations;

  // Group by page for "all" tab
  const groupedByPage = tab === 'all'
    ? displayAnnotations.reduce<Record<string, Annotation[]>>((acc, a) => {
        (acc[a.pageUrl] ??= []).push(a);
        return acc;
      }, {})
    : { current: displayAnnotations };

  function handleExport(format: 'json' | 'markdown') {
    const annotations = getAllAnnotations();
    const content = format === 'json' ? exportToJson(annotations) : exportToMarkdown(annotations);
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = format === 'json' ? `annotations-${date}.json` : `annotations-${date}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imported = importFromJson(reader.result as string);
      if (imported.length > 0) onImport(imported);
    };
    reader.readAsText(file);
    // Reset so the same file can be re-imported
    e.target.value = '';
  }

  function formatTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '방금';
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  }

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '22rem',
    height: '100vh',
    background: 'var(--sl-color-gray-7)',
    borderLeft: '1px solid var(--sl-color-gray-5)',
    boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.2)',
    zIndex: 9997,
    display: 'flex',
    flexDirection: 'column',
    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.25s ease-in-out',
  };

  return (
    <>
      <div style={panelStyle}>
        {/* Header */}
        <div
          style={{
            padding: '1rem',
            borderBottom: '1px solid var(--sl-color-gray-5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--sl-color-white)', fontSize: '0.875rem' }}>
            주석
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.6875rem',
                  background: 'var(--sl-color-gray-6)',
                  color: 'var(--sl-color-gray-3)',
                  border: '1px solid var(--sl-color-gray-5)',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                }}
              >
                내보내기
              </button>
              {showExportMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.25rem',
                    background: 'var(--sl-color-gray-6)',
                    border: '1px solid var(--sl-color-gray-5)',
                    borderRadius: '0.25rem',
                    overflow: 'hidden',
                    zIndex: 10,
                  }}
                >
                  <button
                    onClick={() => handleExport('json')}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.6875rem',
                      color: 'var(--sl-color-white)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--sl-color-gray-5)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    JSON (전체)
                  </button>
                  <button
                    onClick={() => handleExport('markdown')}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.6875rem',
                      color: 'var(--sl-color-white)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--sl-color-gray-5)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    Markdown (읽기용)
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={handleImportClick}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.6875rem',
                background: 'var(--sl-color-gray-6)',
                color: 'var(--sl-color-gray-3)',
                border: '1px solid var(--sl-color-gray-5)',
                borderRadius: '0.25rem',
                cursor: 'pointer',
              }}
            >
              가져오기
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--sl-color-gray-3)',
                cursor: 'pointer',
                fontSize: '1.25rem',
                padding: '0 0.25rem',
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--sl-color-gray-6)', padding: '0.5rem 1rem', gap: '0.5rem' }}>
          <button
            onClick={() => setTab('current')}
            style={{
              padding: '0.25rem 0.625rem',
              fontSize: '0.6875rem',
              borderRadius: '0.25rem',
              border: tab === 'current' ? '1px solid var(--sl-color-accent)' : '1px solid transparent',
              background: tab === 'current' ? 'color-mix(in srgb, var(--sl-color-accent) 15%, transparent)' : 'transparent',
              color: tab === 'current' ? 'var(--sl-color-accent)' : 'var(--sl-color-gray-3)',
              cursor: 'pointer',
            }}
          >
            이 페이지 ({currentPageAnnotations.length})
          </button>
          <button
            onClick={() => setTab('all')}
            style={{
              padding: '0.25rem 0.625rem',
              fontSize: '0.6875rem',
              borderRadius: '0.25rem',
              border: tab === 'all' ? '1px solid var(--sl-color-accent)' : '1px solid transparent',
              background: tab === 'all' ? 'color-mix(in srgb, var(--sl-color-accent) 15%, transparent)' : 'transparent',
              color: tab === 'all' ? 'var(--sl-color-accent)' : 'var(--sl-color-gray-3)',
              cursor: 'pointer',
            }}
          >
            전체 페이지
          </button>
        </div>

        {/* Annotation list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          {displayAnnotations.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--sl-color-gray-4)', fontSize: '0.8125rem' }}>
              {tab === 'current' ? '이 페이지에 주석이 없습니다' : '주석이 없습니다'}
            </div>
          )}

          {Object.entries(groupedByPage).map(([pageUrl, annotations]) => (
            <div key={pageUrl}>
              {tab === 'all' && (
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.6875rem',
                    color: 'var(--sl-color-gray-4)',
                    fontFamily: 'var(--sl-font-mono)',
                    borderBottom: '1px solid var(--sl-color-gray-6)',
                    marginTop: '0.5rem',
                  }}
                >
                  {pageUrl}
                </div>
              )}
              {annotations.map((annotation) => (
                <div
                  key={annotation.id}
                  onClick={() => onNavigate(annotation)}
                  style={{
                    padding: '0.75rem',
                    margin: '0.25rem 0',
                    background: 'var(--sl-color-gray-6)',
                    borderRadius: '0.5rem',
                    borderLeft: '3px solid var(--sl-color-accent)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--sl-color-gray-5)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--sl-color-gray-6)';
                  }}
                >
                  {/* Breadcrumb */}
                  <div style={{ fontSize: '0.625rem', color: 'var(--sl-color-gray-4)', marginBottom: '0.375rem' }}>
                    {annotation.breadcrumb.join(' › ')}
                  </div>
                  {/* Selected text */}
                  <div style={{ fontSize: '0.75rem', color: 'var(--sl-color-gray-3)', marginBottom: '0.375rem', fontStyle: 'italic' }}>
                    "{annotation.selectedText.length > 60
                      ? annotation.selectedText.slice(0, 60) + '…'
                      : annotation.selectedText}"
                  </div>
                  {/* Memo */}
                  <div style={{ fontSize: '0.75rem', color: 'var(--sl-color-white)' }}>
                    {annotation.memo}
                  </div>
                  {/* Footer */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '0.5rem',
                      fontSize: '0.625rem',
                      color: 'var(--sl-color-gray-4)',
                    }}
                  >
                    <span>{formatTime(annotation.updatedAt)}</span>
                    <span style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(annotation);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--sl-color-gray-3)',
                          cursor: 'pointer',
                          fontSize: '0.625rem',
                          padding: 0,
                        }}
                      >
                        수정
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(annotation);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#f87171',
                          cursor: 'pointer',
                          fontSize: '0.625rem',
                          padding: 0,
                        }}
                      >
                        삭제
                      </button>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Backdrop for click-outside-to-close */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9996,
            background: 'rgba(0, 0, 0, 0.1)',
          }}
        />
      )}
    </>
  );
}
