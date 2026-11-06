export function GuestPageLoading() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="flex min-h-dvh items-center justify-center bg-[#F6F7F9] px-5 py-10"
    >
      <section className="flex w-full max-w-[390px] flex-col items-center rounded-[28px] border border-black/5 bg-white px-7 py-10 text-center shadow-[0_24px_80px_-40px_rgb(17_24_39_/_45%)]">
        <span
          aria-hidden="true"
          className="h-8 w-8 animate-spin rounded-full border-[3px] border-black/10 border-t-[#202020]"
        />
        <h1 className="mt-5 font-pretendard text-[20px] font-bold leading-7 tracking-[-0.02em] text-[#111827]">
          초대장을 불러오고 있어요
        </h1>
        <p className="mt-2 font-pretendard text-[14px] font-medium leading-[140%] text-[#6B7280]">
          잠시만 기다려 주세요.
        </p>
      </section>
    </main>
  );
}
