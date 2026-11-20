import { arrayMove } from '@dnd-kit/sortable';
import { useState, type ChangeEvent } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextField } from '@/components/molecules/text-field';
import SortableWrapper from '@/features/DndKit/Sort/SortableWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { compressImages } from '@/shared/utils/imageCompression';
import { sanitizeEnglishTitleInput } from '@/shared/utils/stringUtils';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import {
  readSponsorEntries,
  serializeSponsorEntries,
  type SponsorEntry,
} from './sponsorEntries';
import { SponsorRow } from './SponsorRow';

interface Props {
  blockInfo: EditorBlock<'sponsorshipInfomation'>;
  id: string;
}

function SponsorshipInfomation({ blockInfo, id }: Props) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const entries = readSponsorEntries(blockInfo.props);
  const [newSponsorId, setNewSponsorId] = useState<string>();

  function addSponsor() {
    const sponsorId = crypto.randomUUID();
    setNewSponsorId(sponsorId);
    changeEntries(current => [
      ...current,
      { id: sponsorId, name: '', logo: null },
    ]);
  }

  function changeEntries(change: (current: SponsorEntry[]) => SponsorEntry[]) {
    const store = useEditorStore.getState();
    const block = store.block.find(
      (item): item is EditorBlock<'sponsorshipInfomation'> =>
        item.id === id && item.component === 'sponsorshipInfomation'
    );
    if (!block) return;
    const current = readSponsorEntries(block.props);
    const next = change(current);
    if (
      next.length === current.length &&
      next.every((entry, index) => entry === current[index])
    )
      return;
    const props = serializeSponsorEntries(next);
    store.updateBlock<'sponsorshipInfomation'>(id, props);
    store.updateImage(id, props.images);
  }

  function editSponsor(
    sponsorId: string,
    patch: Partial<Pick<SponsorEntry, 'name' | 'logo'>>
  ) {
    changeEntries(current =>
      current.map(entry =>
        entry.id === sponsorId ? { ...entry, ...patch } : entry
      )
    );
  }

  async function pickLogos(sponsorId: string, files: File[]) {
    // Register originals immediately so saving while compression runs includes the logos.
    const added = files
      .slice(1)
      .map(logo => ({ id: crypto.randomUUID(), name: '', logo }));
    changeEntries(current =>
      current.flatMap(entry =>
        entry.id === sponsorId
          ? [{ ...entry, logo: files[0] }, ...added]
          : [entry]
      )
    );
    const compressed = await compressImages(files);
    const replacements = new Map(
      files.map((file, index) => [file, compressed[index]])
    );
    if (compressed.some((file, index) => file !== files[index])) {
      changeEntries(current =>
        current.map(entry =>
          entry.logo instanceof File && replacements.has(entry.logo)
            ? { ...entry, logo: replacements.get(entry.logo)! }
            : entry
        )
      );
    }
  }

  const handleOnChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { title: e.target.value });
  };
  const handleOnChangeIsSubTitle = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { isSubTitle: e.target.checked });
  };

  const handleOnchangeEnglishTitle = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, {
      subTitle: sanitizeEnglishTitleInput(e.target),
    });
  };
  return (
    <LeftEditorWrapper ariaLabel="후원 정보">
      <NavigationBar>후원 정보 편집 페이지</NavigationBar>
      <div className="w-full">
        <TextField
          label="제목"
          className="py-1.5 text-center"
          inputProps={{
            placeholder: '후원사',
            value: blockInfo.props.title ?? '',
            onChange: handleOnChangeTitle,
          }}
        />
      </div>
      {blockInfo.props.isSubTitle && (
        <div className="w-full">
          <TextField
            label="영문 제목"
            className="py-1.5 text-center"
            inputProps={{
              placeholder: 'OUR SPONSORS',
              value: blockInfo.props.subTitle ?? '',
              onChange: handleOnchangeEnglishTitle,
            }}
          />
        </div>
      )}
      <div className="w-full">
        <SortableWrapper
          items={entries}
          className="flex-col gap-0"
          onChange={next => changeEntries(() => next)}
        >
          {entry => {
            const index = entries.indexOf(entry);
            return (
              <SponsorRow
                key={entry.id}
                sponsor={entry}
                focusName={entry.id === newSponsorId}
                position={index + 1}
                onNameChange={name => editSponsor(entry.id, { name })}
                onPick={files => void pickLogos(entry.id, files)}
                onClear={() => editSponsor(entry.id, { logo: null })}
                onRemove={() =>
                  changeEntries(current =>
                    current.filter(item => item.id !== entry.id)
                  )
                }
                onMove={offset => {
                  if (index + offset >= 0 && index + offset < entries.length)
                    changeEntries(current =>
                      arrayMove(current, index, index + offset)
                    );
                }}
              />
            );
          }}
        </SortableWrapper>
        <UtilityButton
          className="mt-3 bg-text-primary px-3 text-bg-base enabled:hover:bg-text-secondary"
          onClick={addSponsor}
        >
          ＋ 후원사 추가
        </UtilityButton>
      </div>
      <div className="w-full pb-2 flex gap-2 items-center">
        <Label className="font-semibold shrink-0 text-center">추가기능</Label>

        <Checkbox
          onChange={handleOnChangeIsSubTitle}
          checked={blockInfo.props.isSubTitle}
        >
          <span className="text-[13px]">영문 제목 추가</span>
        </Checkbox>
      </div>
    </LeftEditorWrapper>
  );
}

export default SponsorshipInfomation;
