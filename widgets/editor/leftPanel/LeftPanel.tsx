'use client';

import { useShallow } from 'zustand/shallow';

import SectionArrow from '@/shared/assets/icons/sectionArrow.svg';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import BulkEdit from './components/BulkEdit';
import Edit from './components/Edit';

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
      {isComponentSelected && (
        <div className="w-full">
          <button
            type="button"
            className={`flex-center relative bg-white rounded-lg ${isEdit ? 'rounded-b-none border-b-0' : 'shadow-edit'} border border-black/5 w-full h-11 transition-default`}
            onClick={() => setIsEdit(!isEdit)}
          >
            <p className="font-semibold text-sm">일괄 편집</p>
            <div
              className={`absolute right-6 ${isEdit ? 'rotate-180' : ''} transition-default`}
            >
              <SectionArrow className="w-[14px] h-[7px]" />
            </div>
          </button>

          <div
            key={`bulk-edit-${isEdit}`}
            className={isEdit ? 'max-h-158 overflow-hidden mt-0' : 'hidden'}
          >
            <div className="overflow-hidden rounded-b-lg">
              <BulkEdit />
            </div>
          </div>
        </div>
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
