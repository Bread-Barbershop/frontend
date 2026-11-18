export default function NoticeConfirmButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="shrink-0 cursor-pointer rounded-full bg-bg-plain px-8 py-[13.5px] font-pretendard text-[14px] font-semibold leading-5 text-white transition-colors hover:bg-[#202020] active:bg-[#0D0D0D]"
      onClick={onClick}
    >
      알겠어요
    </button>
  );
}
