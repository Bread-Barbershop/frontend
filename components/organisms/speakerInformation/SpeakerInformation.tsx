import { JSONContent } from '@tiptap/core';
import { useMemo, useEffect, ChangeEvent } from 'react';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import { Divider } from '@/components/atoms/divider/Divider';
import { Label } from '@/components/atoms/label/Label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
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
  const { speakers, title, checkedEnglishTitle, englishTitle } =
    blockInfo.props;

  const handleEditorChange = useMemo(
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
      handleEditorChange.cancel();
    };
  }, [handleEditorChange]);

  const handleValueChange = (
    key: 'title' | 'englishTitle',
    e: ChangeEvent<HTMLInputElement>
  ) => {
    updateBlock(id, { [key]: e.target.value });
  };

  const handleCheckedChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { checkedEnglishTitle: e.target.checked });
  };

  const handleSpeakerNameChange = (
    speakerId: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const newItems = (speakers || []).map(speaker =>
      speaker.id === speakerId ? { ...speaker, name: e.target.value } : speaker
    );
    updateBlock(id, { speakers: newItems });
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
  const handlePictureDelete = (speakerId: string) => {
    const newSpeakers = (speakers || []).map(speaker =>
      speaker.id === speakerId ? { ...speaker, image: [] } : speaker
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleAddSpeaker = () => {
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
  };

  const handleDeleteSpeaker = (speakerId: string) => {
    const newSpeakers = (speakers || []).filter(
      speaker => speaker.id !== speakerId
    );
    const newImages = newSpeakers.map(s => s.image[0]);

    updateBlock(id, {
      speakers: newSpeakers,
      images: newImages,
    });
    updateImage(
      id,
      newImages.filter((f): f is File | string => !!f)
    );
  };

  useEffect(() => {
    if (!speakers || speakers.length === 0) {
      handleAddSpeaker();
    }
  }, [handleAddSpeaker, speakers]);

  return (
    <LeftEditorWrapper ariaLabel="연사 정보" className="gap-3">
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
      <div className="flex flex-col w-full -mb-3">
        <TextField
          label="제목"
          inputProps={{
            placeholder: '입력하지 않을 시 기본 문구로 작성됩니다.',
            value: title,
            onChange: e => handleValueChange('title', e),
          }}
          className="text-center w-full pb-3"
        />
        {checkedEnglishTitle && (
          <TextField
            label="영문제목"
            inputProps={{
              placeholder: '입력하지 않을 시 기본 문구로 작성됩니다.',
              value: englishTitle,
              onChange: e => handleValueChange('englishTitle', e),
            }}
            className="text-center w-full mb-3"
          />
        )}
      </div>
      {speakers?.map((speaker, index) => (
        <section
          key={`${speaker.id}-${index}`}
          className="w-full flex flex-col gap-2"
        >
          {index !== 0 && <Divider />}
          <Information
            speakerLength={speakers?.length}
            id={speaker.id}
            speaker={speaker}
            onStringChange={(_type, e) =>
              handleSpeakerNameChange(speaker.id, e)
            }
            onEditorChange={json =>
              handleEditorChange(speaker.id, json, speakers || [])
            }
            onPictureChange={file => handlePictureChange(speaker.id, file)}
            onPictureDelete={() => handlePictureDelete(speaker.id)}
            onDelete={() => handleDeleteSpeaker(speaker.id)}
          />
        </section>
      ))}
      <section className="flex items-center gap-2 w-full">
        <Label className="font-semibold">추가기능</Label>

        <Checkbox
          className="text-[13px]"
          checked={checkedEnglishTitle}
          onChange={handleCheckedChange}
        >
          영문 제목 추가
        </Checkbox>
      </section>
    </LeftEditorWrapper>
  );
};
