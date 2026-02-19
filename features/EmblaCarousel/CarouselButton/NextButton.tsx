import React from 'react';

function NextButton({ ...rest }) {
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
          d="M1.00032 1L9.16699 8L1.00032 15"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default NextButton;
