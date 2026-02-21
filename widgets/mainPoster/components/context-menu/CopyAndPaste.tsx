import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

interface Props {
  onClick: () => void;
}

function CopyAndPaste({ onClick }: Props) {
  const { copy, paste } = useFabricContext();

  return (
    <>
      <button
        type="button"
        className="hover:bg-gray-100 active:bg-gray-200"
        onClick={async () => {
          await copy();
          onClick();
        }}
      >
        복사
      </button>
      <button
        type="button"
        className="hover:bg-gray-100 active:bg-gray-200"
        onClick={async () => {
          await paste();
          onClick();
        }}
      >
        붙여넣기
      </button>
    </>
  );
}

export default CopyAndPaste;
