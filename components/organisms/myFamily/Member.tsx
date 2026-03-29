import { ChangeEvent } from 'react';

import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Picture } from '@/components/molecules/picture';
import { Selector } from '@/components/molecules/selector';
import Menu from '@/shared/assets/icons/menu.svg';

interface Props {
  index: number;
  member: {
    relation: string;
    name: string;
    image: (File | string)[];
  };
  checkedImage: boolean | undefined;
  onRelationChange: (index: number, value: string) => void;
  onNameChange: (index: number, e: ChangeEvent<HTMLInputElement>) => void;
  onImageChange: (index: number, value: (File | string)[]) => void;
  onDelete: (index: number) => void;
}

export const Member = ({
  index,
  member,
  checkedImage,
  onRelationChange,
  onNameChange,
  onImageChange,
  onDelete,
}: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <Label id={`family${index}`} className="text-center font-semibold">
          소개{index + 1}
        </Label>
        <Selector
          className="w-21.5"
          placeholder="관계"
          options={[
            { value: '부', label: '부' },
            { value: '모', label: '모' },
          ]}
          selected={
            member.relation
              ? {
                  value: member.relation,
                  label: member.relation,
                }
              : null
          }
          onSelect={option => onRelationChange(index, option.value)}
          onInputChange={value => onRelationChange(index, value)}
        />
        <Input
          placeholder="이름"
          value={member.name}
          onChange={e => onNameChange(index, e)}
          className="w-34"
        />
        <button type="button" className="w-8 flex items-center justify-center">
          <Menu />
        </button>
      </div>
      {checkedImage && (
        <Picture
          label="사진"
          className="w-full text-center"
          multiple={false}
          value={member.image}
          onChange={value => onImageChange(index, value)}
          onDelete={() => onDelete(index)}
        />
      )}
    </div>
  );
};
