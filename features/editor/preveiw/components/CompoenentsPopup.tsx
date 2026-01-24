import { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { Button } from '@/components/atoms/button';
import { componentCls } from '@/shared/samples/componentSample';

import { useEditorStore } from '../../store/useEditorStore';
import { BlockType } from '../../types/editor';

const COLORS = {
  wedding: 'bg-[#E96B8A]',
  firstBirthday: 'bg-[#F2A65A]',
  birthday: 'bg-[#7F7BFF]',
  conference: 'bg-[#3B82F6]',
  etc: 'bg-[#2CB9A8]',
  // event : '',
};

function CompoenentsPopup() {
  const [active, setActive] = useState('wedding');
  const sectionRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { addBlock, selectedBlock } = useEditorStore(
    useShallow(state => ({
      addBlock: state.addBlock,
      selectedBlock: state.selectedBlock,
    }))
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const type = entry.target.getAttribute('data-type');
            console.log('타입', type);
            if (type) setActive(type);
          }
        });
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.3,
      }
    );

    Object.values(sectionRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleAddCompoenent = (component: BlockType | null) => {
    if (!component) return;
    const id = crypto.randomUUID();
    addBlock(component, id);
    selectedBlock(id);
  };

  return (
    <div className="absolute bottom-15 -left-35 w-[656px] h-[398px] shadow-[0_8px_24px_0_rgba(0,0,0,0.06),0_2px_10px_0_rgba(0,0,0,0.08)] bg-white rounded-md flex flex-col gap-3">
      <div>
        <ul className="flex gap-7">
          {componentCls.map((items, index) => (
            <li
              key={index}
              className={`w-[101px] h-11 flex items-center justify-center font-semibold text-sm ${active === items.english ? 'text-text-primary border-b' : 'text-text-secondary border-0'}`}
              onClick={() => {
                setActive(items.english);
                sectionRefs.current[items.english]?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'end',
                });
              }}
            >
              {items.korea}
            </li>
          ))}
        </ul>
      </div>
      <div
        className="overflow-y-auto px-5 mb-[30px] flex flex-col gap-5"
        ref={scrollContainerRef}
      >
        {componentCls.map((items, index) => (
          <div key={index}>
            <div className="font-semibold flex justify-between h-11">
              <h2 className="text-sm font-semibold">{items.korea}</h2>
              <Button className="text-primary w-fit">모두 추가하기</Button>
            </div>
            <ul className="grid grid-cols-5 gap-x-7 gap-y-0.5">
              {items.list.map((item, index) => (
                <li
                  key={index}
                  className="w-[101px] h-11 flex items-center gap-0.5"
                  datatype={items.english}
                  ref={el => {
                    if (!el) return;
                    sectionRefs.current[items.english] = el;
                  }}
                  onClick={() => handleAddCompoenent(item.component)}
                >
                  <span
                    className={`shrink-0 text-white rounded-sm w-[18px] h-[18px] flex items-center justify-center font-normal text-xs ${COLORS[items.english]}`}
                  >
                    {index + 1}
                  </span>
                  <p className="font-normal text-[13px] flex-1 flex flex-wrap justify-center text-center break-keep">
                    {item.contents}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
export default CompoenentsPopup;
