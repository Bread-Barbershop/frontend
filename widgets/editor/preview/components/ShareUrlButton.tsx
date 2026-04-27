import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/shallow';

import CapacityIcon from '@/shared/assets/icons/capacity.svg';
import CellularConnectionIcon from '@/shared/assets/icons/cellular-connection.svg';
import PlusIcon from '@/shared/assets/icons/plus.svg';
import WifiIcon from '@/shared/assets/icons/wifi.svg';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

export const ShareUrlButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [previewContainer, setPreviewContainer] = useState<HTMLElement | null>(
    null
  );

  const { block, selectedBlock, setIsEdit, addBlock } = useEditorStore(
    useShallow(state => ({
      block: state.block,
      selectedBlock: state.selectedBlock,
      setIsEdit: state.setIsEdit,
      addBlock: state.addBlock,
    }))
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewContainer(document.getElementById('preview-container'));
  }, []);

  const openDialog = () => {
    setIsOpen(true);
    const shareUrlBlock = block.find(b => b.component === 'shareUrl');
    if (shareUrlBlock) {
      selectedBlock(shareUrlBlock.id);
    } else {
      const newId = crypto.randomUUID();
      addBlock('etc', 'shareUrl', newId);
      selectedBlock(newId);
    }
    setIsEdit(false);
  };

  // const closeDialog = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        className="w-full h-11 bg-white rounded-lg shadow-edit flex-center text-sm font-semibold"
        onClick={openDialog}
      >
        공유 썸네일
      </button>

      {isOpen &&
        previewContainer &&
        createPortal(
          <div className="absolute top-0 left-0 w-full h-[812px] bg-[#ABC1D1] flex flex-col justify-between ring-1 ring-black rounded-lg overflow-hidden">
            <div>
              <div className="flex justify-between">
                <div className="h-10 pl-[49px] font-semibold text-[17px] flex items-center">
                  9:41
                </div>
                <div className="pr-[29px] gap-[7px] flex items-center">
                  <CellularConnectionIcon />
                  <WifiIcon />
                  <CapacityIcon />
                </div>
              </div>
              <div className="h-10 w-full flex-center font-semibold text-[13px]">
                미리보기
              </div>
            </div>
            <div className="bg-white pt-2 ">
              <div className="flex items-center gap-[6px] px-2">
                <div className="flex-center size-6 rounded-full bg-[#EFEFEF]">
                  <PlusIcon />
                </div>
                <div className="bg-[#EFEFEF] rounded-3xl leading-[22px] py-[5px] px-2 text-[#A7A7A7] text-[11px] flex-1">
                  카카오 초대장 썸네일 미리보기입니다.
                </div>
              </div>
              <div className="flex justify-center pt-[21px] h-[34px]">
                <div className="bg-black h-[5px] w-[144px] rounded-full" />
              </div>
            </div>
          </div>,
          previewContainer
        )}
    </>
  );
};
