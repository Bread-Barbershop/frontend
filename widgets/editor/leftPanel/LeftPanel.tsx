import Edit from './Edit';

function LeftPanel() {
  return (
    <div className="w-[375px] ml-15 flex flex-col gap-4">
      <div className="flex items-center justify-center h-11 relative bg-white rounded-lg shadow-[0_8px_24px_0_rgba(0,0,0,0.06),0_2px_10px_0_rgba(0,0,0,0.08)] font-semibold border border-black/5">
        <p>일괄 편집</p>
        <button className="absolute right-6">
          <svg
            width="14"
            height="7"
            viewBox="0 0 14 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L7 6L13 1"
              stroke="black"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="h-fit bg-white rounded-lg shadow-[0_8px_24px_0_rgba(0,0,0,0.06),0_2px_10px_0_rgba(0,0,0,0.08)] font-semibold flex justify-center items-center border border-black/5">
        <Edit />
      </div>
    </div>
  );
}
export default LeftPanel;
