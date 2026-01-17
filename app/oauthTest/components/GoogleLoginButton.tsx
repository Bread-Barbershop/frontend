'use client';

export default function GoogleLoginButton() {
  const handleClick = () => {
    const width = 480;
    const height = 640;

    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      '/api/auth/login',
      'google-oauth',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white"
    >
      Google 계정으로 계속하기
    </button>
  );
}
