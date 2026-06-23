import { RefObject } from 'react';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import { componentCls } from '@/shared/data/componentsInfo/componentInfo';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { InvitationType } from '@/shared/types/block';
import { BlockType } from '@/shared/types/editor';

const COLORS = {
  wedding: 'bg-[#E96B8A]',
  firstBirthday: 'bg-[#F2A65A]',
  birthday: 'bg-[#7F7BFF]',
  seminar: 'bg-[#3B82F6]',
  etc: 'bg-[#2CB9A8]',
  // event : '',
};

interface Props {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
}

function ContentsArea({ scrollContainerRef, sectionRefs }: Props) {
  const { addBlock, selectedBlock, addAllBlock, setIsEdit } = useEditorStore(
    useShallow(state => ({
      addBlock: state.addBlock,
      selectedBlock: state.selectedBlock,
      addAllBlock: state.addAllBlock,
      setIsEdit: state.setIsEdit,
    }))
  );

  const handleAddComponent = (
    type: InvitationType,
    component: BlockType | null
  ) => {
    if (!component) return;
    const id = crypto.randomUUID();
    addBlock(type, component, id);

    selectedBlock(id);
    setIsEdit(false);
  };
  return (
    <div
      className="overflow-y-auto px-5 flex flex-col gap-5 popup-custom-scrollbar"
      ref={scrollContainerRef}
    >
      {componentCls.map((items, index) => (
        <div
          key={index}
          data-type={items.english}
          ref={el => {
            sectionRefs.current[items.english] = el;
          }}
        >
          <div className="font-semibold flex justify-between items-center h-11">
            <h2 className="text-sm font-semibold">{items.korea}</h2>
            <UtilityButton
              className="text-primary w-fit"
              onClick={() => addAllBlock(items.english)}
            >
              모두 추가하기
            </UtilityButton>
          </div>
          <div>
            <ul className="grid grid-cols-5 gap-x-7 gap-y-0.5 ">
              {items.list.map((item, index) => (
                <li
                  key={index}
                  className="w-25.25 h-11 flex items-center gap-0.5 cursor-pointer"
                  onClick={() =>
                    handleAddComponent(items.english, item.component)
                  }
                >
                  <span
                    className={`shrink-0 text-white rounded-sm w-4.5 h-4.5 flex-center font-normal text-xs ${COLORS[items.english]}`}
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
        </div>
      ))}
    </div>
  );
}
export default ContentsArea;
