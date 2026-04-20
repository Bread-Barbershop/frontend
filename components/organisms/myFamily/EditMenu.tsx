import Flower from '@/shared/assets/icons/flower.svg';
import Hide from '@/shared/assets/icons/hide.svg';
import Remove from '@/shared/assets/icons/remove.svg';
import Show from '@/shared/assets/icons/show.svg';

interface Props {
  onFlowerChange: (value: boolean) => void;
  onDelete: () => void;
  onToggle: () => void;
  member: {
    flower: boolean;
  };
}

export const EditMenu = ({
  onFlowerChange,
  onDelete,
  onToggle,
  member,
}: Props) => {
  return (
    <section className="absolute flex flex-col items-center justify-center gap-2.5 px-2 right-0 top-9 z-10 bg-bg-base w-21.5 h-16.5 rounded-lg shadow-custom">
      <button
        type="button"
        className="w-full flex items-center gap-1 text-[14px]"
        onClick={() => {
          onFlowerChange(!member.flower);
          onToggle();
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
          onDelete();
          onToggle();
        }}
      >
        <Remove />
        <p>삭제</p>
      </button>
    </section>
  );
};
