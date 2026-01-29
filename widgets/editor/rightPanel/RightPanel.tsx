function RightPanel() {
  return (
    <div className="w-93.75 h-203 mr-15 flex flex-col gap-5">
      <div>
        <button className="w-full h-11 bg-white rounded-lg shadow-edit flex-center gap-2 font-semibold">
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.800781 4.7998H8.80078M4.80078 0.799805V8.7998"
              stroke="black"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
          업로드
        </button>
      </div>
      <div className="w-93.75 flex-1 bg-white mr-15 rounded-lg shadow-edit font-semibold flex-center flex-col gap-3  border border-black/5 p-5">
        <div className="w-full">
          <button className="border-b w-41.5 h-11 font-semibold">포스터</button>
          <button className="w-41.75 h-11 text-text-tertiary font-semibold">
            타입
          </button>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-[14.5px]">
          <div className="w-25.5 h-55 bg-text-tertiary rounded-lg"></div>
          <div className="w-25.5 h-55 bg-text-tertiary rounded-lg"></div>
          <div className="w-25.5 h-55 bg-text-tertiary rounded-lg"></div>
          <div className="w-25.5 h-55 bg-text-tertiary rounded-lg"></div>
          <div className="w-25.5 h-55 bg-text-tertiary rounded-lg"></div>
          <div className="w-25.5 h-55 bg-text-tertiary rounded-lg"></div>
          <div className="w-25.5 h-55 bg-text-tertiary rounded-lg"></div>
          <div className="w-25.5 h-55 bg-text-tertiary rounded-lg"></div>
          <div className="w-25.5 h-55 bg-text-tertiary rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
export default RightPanel;
