import { JSONContent } from '@tiptap/core';
import { useCallback, useEffect, ChangeEvent } from 'react';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import { Divider } from '@/components/atoms/divider/Divider';
import { Label } from '@/components/atoms/label/Label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { EditorNoticeList } from '@/components/molecules/editor-notice';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { sanitizeEnglishTitleInput } from '@/shared/utils/stringUtils';

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

  const handleEditorChange = useCallback(
    (speakerId: string, json: JSONContent, speakers: Speaker[]) => {
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
    },
    [id, updateBlock]
  );

  const handleValueChange = (
    key: 'title' | 'englishTitle',
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const fallback = key === 'title' ? '연사정보' : 'SPEAKER INFORMATION';
    const value =
      key === 'englishTitle'
        ? sanitizeEnglishTitleInput(e.target)
        : e.target.value;

    updateBlock(id, { [key]: value || fallback });
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

    updateBlock(id, {
      speakers: newSpeakers,
    });
    updateImage(speakerId, file);
  };
  const handlePictureDelete = (speakerId: string) => {
    const newSpeakers = (speakers || []).map(speaker =>
      speaker.id === speakerId ? { ...speaker, image: [] } : speaker
    );

    updateBlock(id, {
      speakers: newSpeakers,
    });
    updateImage(speakerId, []);
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
    updateImage(speakerId, []);
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
        연사정보 편집 페이지
      </NavigationBar>
      <div className="flex flex-col gap-1 w-full">
        <TextField
          label="제목"
          inputProps={{
            placeholder: '연사정보',
            value: title === '연사정보' ? '' : title,
            onChange: e => handleValueChange('title', e),
          }}
          className="w-full py-1.5 text-center"
        />
        {checkedEnglishTitle && (
          <TextField
            label="영문제목"
            inputProps={{
              placeholder: 'SPEAKER INFORMATION',
              value:
                englishTitle === 'SPEAKER INFORMATION' ? '' : englishTitle,
              onChange: e => handleValueChange('englishTitle', e),
            }}
            className="w-full py-1.5 text-center"
          />
        )}
      </div>
      {speakers?.map((speaker, index) => (
        <section
          key={`${speaker.id}-${index}`}
          className="w-full flex flex-col gap-1"
        >
          {index !== 0 && <Divider className="w-full" />}
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
      <section className="flex items-center gap-2 w-full py-1.5">
        <Label className="font-semibold">추가기능</Label>

        <Checkbox
          className="text-[13px]"
          checked={checkedEnglishTitle}
          onChange={handleCheckedChange}
        >
          영문 제목 추가
        </Checkbox>
      </section>
      <EditorNoticeList
        notices={[
          {
            id: 'speaker-animation',
            text: '항목이 2개 이상일 경우, 애니메이션 효과가 적용됩니다.',
          },
        ]}
      />
    </LeftEditorWrapper>
  );
};
