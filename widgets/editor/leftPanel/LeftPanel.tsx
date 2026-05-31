'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useShallow } from 'zustand/shallow';

import SectionArrow from '@/shared/assets/icons/sectionArrow.svg';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import BulkEdit from './components/BulkEdit';
import Edit from './components/Edit';

function LeftPanel() {
  const { isEdit, setIsEdit} = useEditorStore(
    useShallow(state => ({ isEdit: state.isEdit, setIsEdit: state.setIsEdit }))
  );
  
  return (
    <div
      className="w-93.75 max-h-[810px] ml-5 min-[1540px]:ml-15 flex flex-col gap-4"
      data-editor-left-panel
    >
      <div className="w-full">
        <button
          type="button"
          className={`flex-center relative bg-white rounded-lg ${isEdit ? 'rounded-b-none border-b-0' : 'shadow-edit'} border border-black/5 w-full h-11 transition-all duration-300 ease-in-out`}
          onClick={() => setIsEdit(!isEdit)}
        >
          <p className="font-semibold">일괄 편집</p>
          <div
            className={`absolute right-6 ${isEdit ? 'rotate-180' : ''} transition-all duration-300 ease-in-out`}
          >
            <SectionArrow className="w-[14px] h-[7px]" />
          </div>
        </button>

        <AnimatePresence>
          {isEdit && (
            <motion.div
              key="bulk-edit-container"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <BulkEdit />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className={`flex flex-col bg-white rounded-lg shadow-edit border border-black/5 transition-all duration-300 ease-in-out ${
          isEdit ? 'h-11' : ''
        }`}
      >
        <AnimatePresence mode="wait">
          {isEdit ? (
            <motion.button
              key="detail-edit-placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              type="button"
              className="flex-center relative w-full h-full"
              onClick={() => setIsEdit(false)}
            >
              <p className="font-semibold">상세 편집</p>
              
            </motion.button>
          ) : (
            <motion.div
              key="edit-container"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full overflow-hidden max-h-[750px]"
            >
              <Edit />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default LeftPanel;
