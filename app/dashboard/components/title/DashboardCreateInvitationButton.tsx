import Link from 'next/link';

function DashboardCreateInvitationButton() {
  return (
    <Link
      href="/editor"
      className="
        pointer-events-auto flex h-13.25 w-fit items-center justify-center rounded-full px-8
        bg-[#121212] font-pretendard text-2xl font-medium text-white
        transition-all hover:bg-[#202020] active:scale-95 active:bg-[#0D0D0D] cursor-pointer
      "
    >
      다른 초대장 제작하기
    </Link>
  );
}

export default DashboardCreateInvitationButton;
