'use client';
import { useState } from 'react';

import SectionArrow from '@/shared/assets/icons/sectionArrow.svg';

import Edit from './Edit';
function LeftPanel() {
  const [isEdit, setIsEdit] = useState(false);
  return (
    <div className="w-93.75 ml-15 flex flex-col gap-4">
      <button
        type="button"
        className={`flex-center relative bg-white rounded-lg shadow-edit border border-black/5 ${isEdit ? 'h-203' : 'h-11'} transition-all duration-300 ease-in-out`}
        onClick={() => setIsEdit(!isEdit)}
      >
        <p className="font-semibold">일괄 편집</p>
        <div
          className={`absolute right-6 ${isEdit ? 'rotate-180' : ''} transition-all duration-300 ease-in-out`}
        >
          <SectionArrow className="w-[14px] h-[7px]" />
        </div>
      </button>
      <div
        className={`${isEdit ? 'h-11' : 'h-fit'} flex-center bg-white rounded-lg shadow-edit border border-black/5 transition-all duration-300 ease-in-out`}
      >
        {!isEdit && <Edit />}
      </div>
    </div>
  );
}
export default LeftPanel;
