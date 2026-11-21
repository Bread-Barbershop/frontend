'use client';

import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import BulkEdit from './components/BulkEdit';
import Edit from './components/Edit';
import { SectionStyleControls } from './components/SectionStyleControls';
import { StylePanelSection } from './components/StylePanelSection';

function LeftPanel() {
  const { isEdit, setIsEdit, selectedId } = useEditorStore(
    useShallow(state => ({
      isEdit: state.isEdit,
      setIsEdit: state.setIsEdit,
      selectedId: state.selectedId,
    }))
  );

  const isComponentSelected =
    !!selectedId && selectedId !== 'mainPoster' && selectedId !== 'shareUrl';

  return (
    <div
      className="w-93.75 max-h-[810px] ml-5 min-[1540px]:ml-15 flex flex-col gap-4"
      data-editor-left-panel
    >
      <StylePanelSection
        title="전체 스타일"
        expanded={isEdit}
        onToggle={() => setIsEdit(!isEdit)}
      >
        <div key={`bulk-edit-${isEdit}`} className="max-h-158 overflow-hidden">
          <div className="overflow-hidden rounded-b-lg">
            <BulkEdit />
          </div>
        </div>
      </StylePanelSection>

      {isComponentSelected && !isEdit && (
        <SectionStyleControls key={selectedId} selectedId={selectedId!} />
      )}

      <div
        className={`flex flex-col bg-white rounded-lg shadow-edit border border-black/5 transition-default ${
          isEdit ? 'h-11' : ''
        }`}
      >
        {isEdit ? (
          <button
            type="button"
            className="flex-center relative w-full h-full font-semibold"
            onClick={() => setIsEdit(false)}
          >
            상세 편집
          </button>
        ) : (
          <div
            key={`edit-${isEdit}`}
            className={!isEdit ? 'overflow-hidden' : 'hidden'}
          >
            <div className="w-full">
              <Edit />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeftPanel;
