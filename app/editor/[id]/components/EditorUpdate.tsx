'use client';

import { useEffect } from 'react';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import LeftPanel from '@/widgets/editor/leftPanel/LeftPanel';
import Preview from '@/widgets/editor/preview/Preview';
import RightPanel from '@/widgets/editor/rightPanel/RightPanel';
import { FabricProvider } from '@/widgets/mainPoster/context/FabricContext';

import { useSavedData } from '../hooks/useSavedData';

interface Props {
  folderId: string;
  uuid: string;
}

function EditorUpdate({ folderId }: Props) {
  const { blocks } = useSavedData(folderId);
  const { setBlock, updateImage, selectedBlock } = useEditorStore(
    useShallow(state => ({
      setBlock: state.setBlock,
      updateImage: state.updateImage,
      selectedBlock: state.selectedBlock,
    }))
  );

  useEffect(() => {
    if (blocks) {
      setBlock(blocks);
      blocks.forEach(block => {
        if ('images' in block.props) {
          updateImage(block.id, block.props.images);
        }
      });
      selectedBlock('mainPoster');
    }
  }, [blocks, setBlock, updateImage, selectedBlock]);
  return (
    <FabricProvider>
      <div className="w-screen h-screen bg-[#E7E9EB] flex flex-col gap-13 justify-center overflow-hidden">
        <div className="flex justify-between items-center">
          <LeftPanel />
          <Preview />
          <RightPanel />
        </div>
      </div>
    </FabricProvider>
  );
}

export default EditorUpdate;
