interface Props {
  onChangeCharSpacing: (value: number) => void;
  onChangeLineHeight: (value: number) => void;
  charSpacing: number;
  lineHeight: number;
}

function CharSpacing({
  charSpacing,
  lineHeight,
  onChangeCharSpacing,
  onChangeLineHeight,
}: Props) {
  return (
    <div className="flex flex-col justify-center w-[365px]">
      {/* 자간 */}
      <div className="bg-bg-base px-4 py-2">
        <div className="mb-2 text-center text-sm font-semibold">자간</div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min={-20}
            max={20}
            step={1}
            value={charSpacing}
            onChange={e => onChangeCharSpacing(Number(e.target.value))}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-gray-200"
          />

          <input
            type="text"
            value={`${charSpacing}%`}
            onChange={e =>
              onChangeCharSpacing(Number(e.target.value.replace('%', '')))
            }
            className="w-16 h-8 text-center text-sm border rounded-lg"
          />
        </div>
      </div>

      {/* 행간 */}
      <div className="bg-bg-base px-4 py-2">
        <div className="mb-2 text-center text-sm font-semibold">행간</div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min={-20}
            max={20}
            step={5}
            value={lineHeight}
            onChange={e => onChangeLineHeight(Number(e.target.value))}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-gray-200"
          />

          <input
            type="text"
            value={`${lineHeight}%`}
            onChange={e =>
              onChangeLineHeight(Number(e.target.value.replace('%', '')))
            }
            className="w-16 h-8 text-center text-sm border rounded-lg"
          />
        </div>
      </div>

      {/* 미리보기 */}
      <div
        className="mt-4 p-4 border"
        style={{
          letterSpacing: `${charSpacing / 100}em`,
          lineHeight: `${lineHeight / 100}`,
        }}
      >
        미리보기 텍스트입니다
      </div>
    </div>
  );
}

export default CharSpacing;
