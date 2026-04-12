import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';
interface Props {
  onClick: () => void;
}
export const UndoRedo = ({ onClick }: Props) => {
  const { undo, redo } = useFabricContext();
  return (
    <>
      <button
        type="button"
        className="hover:bg-gray-100 active:bg-gray-200 flex justify-between"
        onClick={() => {
          undo();
          onClick();
        }}
      >
        <p>되돌리기</p>
        <p>Ctrl + Z</p>
      </button>
      <button
        type="button"
        className="hover:bg-gray-100 active:bg-gray-200 flex justify-between"
        onClick={() => {
          redo();
          onClick();
        }}
      >
        <p>다시하기</p>
        <p>Ctrl + Shift + Z</p>
      </button>
    </>
  );
};
