function Cta() {
  return (
    <section className="absolute left-10 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-10 border-none">
      <div
        className="
          flex w-185 flex-col gap-2 rounded-4xl p-8
          bg-white/10 backdrop-blur-sm
          border border-white/30 
          shadow-2xl 
          supports-backdrop-filter:bg-white/5
        "
      >
        <p className="text-2xl font-medium text-[#121212] select-none">
          Signature Invitation
        </p>

        <h1 className="text-[64px] font-black leading-tight text-[#121212] select-none">
          우리의 이야기 첫 시작은
          <br />
          초대장으로.
        </h1>

        <p className="text-2xl font-medium text-[#121212] select-none">
          폰트·컬러·레이아웃까지, 우리만의 시그니처로 마무리해요.
        </p>
      </div>

      <button
        className="
          flex h-13.25 w-43.25 items-center justify-center rounded-full 
          bg-[#121212] text-2xl font-medium text-white 
          transition-all hover:opacity-90 active:scale-95 cursor-pointer
        "
      >
        만들러 가기
      </button>
    </section>
  );
}

export default Cta;
