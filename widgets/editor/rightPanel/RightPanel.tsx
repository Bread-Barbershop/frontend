function RightPanel() {
  return (
    <div className="w-[375px] h-[812px] bg-white mr-15 rounded-lg shadow-[0_8px_24px_0_rgba(0,0,0,0.06),0_2px_10px_0_rgba(0,0,0,0.08)] font-semibold flex flex-col gap-3 justify-center items-center border border-black/5 p-5">
      <div className="w-full">
        <button className="border-b w-[166px] h-11 font-semibold">
          포스터
        </button>
        <button className="w-[167px] h-11 text-[#787878] font-semibold">
          타입
        </button>
      </div>
      <div className="flex-1 grid grid-cols-3 gap-[14.5px]">
        <div className="w-[102px] h-[220px] bg-[#787878] rounded-lg"></div>
        <div className="w-[102px] h-[220px] bg-[#787878] rounded-lg"></div>
        <div className="w-[102px] h-[220px] bg-[#787878] rounded-lg"></div>
        <div className="w-[102px] h-[220px] bg-[#787878] rounded-lg"></div>
        <div className="w-[102px] h-[220px] bg-[#787878] rounded-lg"></div>
        <div className="w-[102px] h-[220px] bg-[#787878] rounded-lg"></div>
        <div className="w-[102px] h-[220px] bg-[#787878] rounded-lg"></div>
        <div className="w-[102px] h-[220px] bg-[#787878] rounded-lg"></div>
        <div className="w-[102px] h-[220px] bg-[#787878] rounded-lg"></div>
      </div>
    </div>
  );
}
export default RightPanel;
