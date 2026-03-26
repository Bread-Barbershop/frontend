import { JSONContent } from '@tiptap/core';
import { useMemo, useEffect, ChangeEvent, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { debounce } from '@/shared/utils/debounce';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { Information } from './Information';

interface Props {
  blockInfo: EditorBlock<'speakerInformation'>;
  id: string;
}

interface Speaker {
  id: string;
  name: string;
  messageJson: JSONContent | null;
  messageHtml: string | null;
  image: (File | string)[];
}

export const SpeakerInformation = ({ blockInfo, id }: Props) => {
  const { updateBlock, updateImage } = useEditorStore(
    useShallow(state => ({
      updateBlock: state.updateBlock,
      updateImage: state.updateImage,
    }))
  );
  const { speakers } = blockInfo.props;

  const debouncedEditorUpdate = useMemo(
    () =>
      debounce((speakerId: string, json: JSONContent, speakers: Speaker[]) => {
        updateBlock(id, {
          speakers: speakers.map(speaker =>
            speaker.id === speakerId
              ? {
                  ...speaker,
                  messageJson: json,
                  messageHtml: tiptapJsonToHtmlInBrowser(json),
                }
              : speaker
          ),
        });
      }, 300),
    [id, updateBlock]
  );

  useEffect(() => {
    return () => {
      debouncedEditorUpdate.cancel();
    };
  }, [debouncedEditorUpdate]);

  const handleEditorChange = (speakerId: string, json: JSONContent) => {
    debouncedEditorUpdate(speakerId, json, speakers || []);
  };

  const handleStringChange = (
    type: 'title' | 'name',
    e: ChangeEvent<HTMLInputElement>,
    speakerId?: string
  ) => {
    if (type === 'title') {
      updateBlock(id, { title: e.target.value });
    } else {
      const newItems = (speakers || []).map(speaker =>
        speaker.id === speakerId
          ? { ...speaker, name: e.target.value }
          : speaker
      );
      updateBlock(id, { speakers: newItems });
    }
  };

  const handlePictureChange = (speakerId: string, file: (File | string)[]) => {
    const newSpeakers = (speakers || []).map(speaker =>
      speaker.id === speakerId ? { ...speaker, image: file } : speaker
    );
    const allImages = newSpeakers.map(s => s.image[0]);

    updateBlock(id, {
      speakers: newSpeakers,
      images: allImages,
    });
    updateImage(
      id,
      allImages.filter((f): f is File | string => !!f)
    );
  };

  const handleAddSpeaker = useCallback(() => {
    const newSpeaker = {
      id: crypto.randomUUID(),
      name: '',
      messageJson: null,
      messageHtml: null,
      image: [],
    };
    const newSpeakers = [...(speakers || []), newSpeaker];
    updateBlock(id, {
      speakers: newSpeakers,
      images: newSpeakers.map(s => s.image[0]),
    });
  }, [id, updateBlock, speakers]);

  const handleDeleteSpeaker = (speakerId: string) => {
    const newSpeakers = (speakers || []).filter(
      speaker => speaker.id !== speakerId
    );
    updateBlock(id, {
      speakers: newSpeakers,
      images: newSpeakers.map(s => s.image[0]),
    });
  };

  useEffect(() => {
    if (!speakers || speakers.length === 0) {
      handleAddSpeaker();
    }
  }, [handleAddSpeaker, speakers]);

  return (
    <LeftEditorWrapper ariaLabel="연사 정보">
      <NavigationBar
        action={
          <UtilityButton size="md" variant="primary" onClick={handleAddSpeaker}>
            추가
          </UtilityButton>
        }
        direction="right"
      >
        연사정보
      </NavigationBar>

      <TextField
        label="제목"
        inputProps={{
          placeholder: '제목을 입력해주세요.',
          value: blockInfo.props.title,
          onChange: e => handleStringChange('title', e),
        }}
        className="text-center w-full pb-3"
      />
      {speakers?.map((speaker, index) => (
        <section
          key={`${speaker.id}-${index}`}
          className="w-full flex flex-col gap-2"
        >
          {index !== 0 && (
            <div className="flex flex-col items-center gap-1">
              <div className="w-0.5 h-1 rounded-sm bg-text-secondary" />
              <div className="w-0.5 h-1 rounded-sm bg-text-secondary" />
            </div>
          )}
          <Information
            speakerLength={speakers?.length}
            id={speaker.id}
            speaker={speaker}
            onStringChange={(type, e) =>
              handleStringChange(type, e, speaker.id)
            }
            onEditorChange={json => handleEditorChange(speaker.id, json)}
            onPictureChange={file => handlePictureChange(speaker.id, file)}
            onDelete={() => handleDeleteSpeaker(speaker.id)}
          />
        </section>
      ))}
    </LeftEditorWrapper>
  );
};
