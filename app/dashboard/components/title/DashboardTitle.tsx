function DashboardTitle() {
  return (
    <div
      className="rounded-4xl border border-white/30 bg-white/15 p-8 text-right backdrop-blur-md"
      style={{
        boxShadow:
          'inset 4px 4px 18px rgba(0, 0, 0, 0.08), inset -4px -4px 18px rgba(255, 255, 255, 0.75)',
      }}
    >
      <p className="font-medium text-2xl">Archive</p>
      <p className="font-black text-[64px]">내 초대장</p>
      <p className="font-medium text-2xl">
        저장한 초대장을 다시 편집하거나 사용할 수 있어요.
      </p>
    </div>
  );
}

export default DashboardTitle;
