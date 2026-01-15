function LeftPanel() {
  return (
    <div className="w-[375px] h-[872px] ml-15 flex flex-col gap-4">
      <button className="h-11 bg-white rounded-lg shadow-[0_8px_24px_0_rgba(0,0,0,0.06),0_2px_10px_0_rgba(0,0,0,0.08)] font-semibold border border-black/5">
        일괄 편집
      </button>
      <div className="h-full bg-white rounded-lg shadow-[0_8px_24px_0_rgba(0,0,0,0.06),0_2px_10px_0_rgba(0,0,0,0.08)] font-semibold flex justify-center items-center border border-black/5">
        + 페이지 추가
      </div>
    </div>
  );
}
export default LeftPanel;
