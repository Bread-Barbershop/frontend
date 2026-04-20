import Flower from '@/shared/assets/icons/flower.svg';
import Hide from '@/shared/assets/icons/hide.svg';
import Remove from '@/shared/assets/icons/remove.svg';
import Show from '@/shared/assets/icons/show.svg';

interface Props {
  type: 'bride' | 'groom';
  index: number;
  member: {
    relation: string;
    name: string;
    flower: boolean;
  };
  onFlowerChange: (
    type: 'bride' | 'groom',
    index: number,
    value: boolean
  ) => void;
  onDelete: (type: 'bride' | 'groom', index: number) => void;
  onToggle: (type: 'bride' | 'groom', index: number) => void;
}

export const EditMenu = ({
  type,
  index,
  member,
  onFlowerChange,
  onDelete,
  onToggle,
}: Props) => {
  return (
    <section className="absolute flex flex-col items-center justify-center gap-2.5 px-2 right-0 top-9 z-10 bg-bg-base w-21.5 h-16.5 rounded-lg shadow-custom">
      <button
        type="button"
        className="w-full flex items-center gap-1 text-[14px]"
        onClick={() => {
          onFlowerChange(type, index, !member.flower);
          onToggle(type, index);
        }}
      >
        {member.flower ? <Hide /> : <Show />}
        <Flower />
        <p>{member.flower ? '삭제' : '표시'}</p>
      </button>
      <button
        type="button"
        className="w-full flex items-center gap-5 text-[14px]"
        onClick={() => {
          onDelete(type, index);
          onToggle(type, index);
        }}
      >
        <Remove />
        <p>삭제</p>
      </button>
    </section>
  );
};
