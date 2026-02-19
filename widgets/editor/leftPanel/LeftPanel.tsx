'use client';
import { useState } from 'react';

import Edit from './Edit';

function LeftPanel() {
  const [isEdit, setIsEdit] = useState(false);
  return (
    <div className="w-93.75 ml-15 flex flex-col gap-4">
      <div
        className={`flex-center relative bg-white rounded-lg shadow-edit font-semibold border border-black/5 ${isEdit ? 'h-203' : 'h-11'} transition-all duration-300 ease-in-out`}
        onClick={() => setIsEdit(!isEdit)}
      >
        <p>일괄 편집</p>
        <button
          className={`absolute right-6 ${isEdit ? 'rotate-180' : ''} transition-all duration-300 ease-in-out`}
        >
          <svg
            width="14"
            height="7"
            viewBox="0 0 14 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L7 6L13 1"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div
        className={`${isEdit ? 'h-11' : 'h-fit'} flex-center bg-white rounded-lg shadow-edit font-semibold border border-black/5 transition-all duration-300 ease-in-out`}
      >
        {!isEdit && <Edit />}
      </div>
    </div>
  );
}
export default LeftPanel;
