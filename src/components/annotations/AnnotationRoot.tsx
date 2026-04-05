import AnnotationProvider, { useAnnotations } from './AnnotationProvider';
import HighlightLayer from './HighlightLayer';
import MemoPopover from './MemoPopover';
import AnnotationFAB from './AnnotationFAB';
import AnnotationPanel from './AnnotationPanel';

function AnnotationUI() {
  const {
    annotations,
    popover,
    panelOpen,
    setPanelOpen,
    closePopover,
    handleSaveMemo,
    handleDeleteAnnotation,
    handleEditAnnotation,
    handleNavigate,
    handleImport,
  } = useAnnotations();

  return (
    <>
      <HighlightLayer />

      {popover && (
        <MemoPopover
          position={popover.position}
          initialMemo={popover.editingAnnotation?.memo ?? ''}
          isEditing={!!popover.editingAnnotation}
          onSave={handleSaveMemo}
          onDelete={
            popover.editingAnnotation
              ? () => handleDeleteAnnotation(popover.editingAnnotation!)
              : undefined
          }
          onCancel={closePopover}
        />
      )}

      <AnnotationFAB
        count={annotations.length}
        isOpen={panelOpen}
        onClick={() => setPanelOpen(!panelOpen)}
      />

      <AnnotationPanel
        currentPageAnnotations={annotations}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        onNavigate={handleNavigate}
        onEdit={handleEditAnnotation}
        onDelete={handleDeleteAnnotation}
        onImport={handleImport}
      />
    </>
  );
}

export default function AnnotationRoot() {
  return (
    <AnnotationProvider>
      <AnnotationUI />
    </AnnotationProvider>
  );
}
