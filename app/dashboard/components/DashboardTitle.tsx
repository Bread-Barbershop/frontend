function DashboardTitle() {
  return (
    <section className="absolute top-1/2 right-10 z-10 flex -translate-y-1/2">
      <div className="flex w-133.75 flex-col items-end gap-2 rounded-4xl border-x border-white/30 bg-white/6 p-8 text-right shadow-[inset_0_8px_24px_rgba(255,255,255,0.14),inset_0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-xs supports-backdrop-filter:bg-white/6">
        <p className="select-none text-2xl font-medium text-[#121212]">
          Archive
        </p>
        <h1 className="select-none text-[64px] font-black leading-tight text-[#121212]">
          초대장
        </h1>
        <p className="select-none whitespace-nowrap text-2xl font-medium text-[#121212]">
          다양한 초대장을 다시 편집하거나 사용할 수 있어요.
        </p>
      </div>
    </section>
  );
}

export default DashboardTitle;
