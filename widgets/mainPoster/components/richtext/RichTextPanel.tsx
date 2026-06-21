import { Textbox } from 'fabric';
import { useEffect, useState } from 'react';

import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import CharSpacing from './CharSpacing';
import FontColor from './FontColor';
import FontFamily from './FontFamily';
import FontSize from './FontSize';
import ItalicUnderline from './ItalicUnderline';
import LineHeight from './LineHeight';
import TextAlign from './TextAlign';

type activeStyle = {
  fontWeight: string | undefined;
  fontStyle: string | undefined;
  underline: boolean | undefined;
};

export const RichTextPanel = () => {
  const { getRichStyles, canvas } = useFabricContext();
  const activeObject = canvas?.getActiveObject() as Textbox;

  const [activeStyles, setActiveStyles] = useState<activeStyle>({
    fontWeight: '400',
    fontStyle: 'normal',
    underline: false,
  });

  useEffect(() => {
    if (!activeObject) return;

    const handleSync = () => {
      getRichStyles(
        activeObject,
        ['fontWeight', 'fontStyle', 'underline'],
        ([fontWeight, fontStyle, underline]) => {
          setActiveStyles(prev => ({
            ...prev,
            fontWeight,
            fontStyle,
            underline: underline === 'true',
          }));
        }
      );
    };

    activeObject.on('changed', handleSync);
    activeObject.on('selection:changed', handleSync);

    handleSync();

    return () => {
      activeObject.off('changed', handleSync);
      activeObject.off('selection:changed', handleSync);
    };
  }, [activeObject]);

  if (!canvas) return null;

  return (
    <LeftEditorWrapper ariaLabel="폰트 편집" className="w-83.75 px-0 pt-1">
      <div className="w-full">
        <FontFamily />
      </div>
      <div className="flex w-full justify-between items-center">
        <FontSize />
        <FontColor />
        <ItalicUnderline
          activeStyles={activeStyles}
          setActiveStyles={setActiveStyles}
        />
        <TextAlign />
      </div>
      <CharSpacing />
      <LineHeight />
    </LeftEditorWrapper>
  );
};
