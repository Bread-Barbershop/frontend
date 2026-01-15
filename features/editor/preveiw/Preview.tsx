'use client';

import {
  componentCls,
  weddingComponents,
} from '@/shared/samples/componentSample';
import { useState } from 'react';
import CompoenentsSwiper from './components/CompoenentsSwiper';

function Preview() {
  const [isTab, setIsTab] = useState(false);
  const [isWeddingTab, setIsWeddingTab] = useState(false);
  console.log(componentCls);
  const handleNewPage = () => {
    setIsTab(props => !props);
  };
  const handlecomponent = () => {
    setIsWeddingTab(props => !props);
  };
  return (
    <div className="w-[375px] h-[872px] flex flex-col gap-4">
      <div className="h-full bg-white"></div>
      <div className="w-full relative">
        {isTab && (
          <>
            <ul className="w-[200%] flex gap-3 absolute -left-25 -top-40">
              {componentCls.map((items, index) => (
                <li
                  key={index}
                  onClick={handlecomponent}
                  className="bg-white rounded-md py-2 px-5 flex flex-col items-center gap-1 shadow-[0_8px_24px_0_rgba(0,0,0,0.06),0_2px_10px_0_rgba(0,0,0,0.08)]"
                >
                  <img
                    src={`/icons/${items.english}.png`}
                    alt={`${items.korea} 컴포넌트 아이콘`}
                  />
                  <p className="font-medium">{items.korea}</p>
                </li>
              ))}
            </ul>
            {isWeddingTab && <CompoenentsSwiper />}
          </>
        )}

        <button
          className="w-full h-11 bg-white rounded-lg shadow-[0_8px_24px_0_rgba(0,0,0,0.06),0_2px_10px_0_rgba(0,0,0,0.08)] flex justify-center items-center gap-2 font-semibold"
          onClick={handleNewPage}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.800781 4.7998H8.80078M4.80078 0.799805V8.7998"
              stroke="black"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
          페이지 추가
        </button>
      </div>
    </div>
  );
}
export default Preview;
