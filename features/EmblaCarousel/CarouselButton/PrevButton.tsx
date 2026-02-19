import React from 'react';

function PrevButton({ ...rest }) {
  return (
    <button {...rest} className="flex-center rounded-full bg-black/32 w-8 h-8">
      <svg
        width="11"
        height="16"
        viewBox="0 0 11 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.16667 1L1 8L9.16667 15"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default PrevButton;
