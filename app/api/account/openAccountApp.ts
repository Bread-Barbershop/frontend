export function openAccountApp() {
  if (typeof window === 'undefined') return;

  const url = 'kakaotalk://kakaopay/money/to/bank';

  let didBlur = false;
  const handleBlur = () => {
    didBlur = true;
  };
  window.addEventListener('blur', handleBlur, { once: true });

  window.location.href = url;

  setTimeout(() => {
    window.removeEventListener('blur', handleBlur);
    if (!didBlur) {
      alert('카카오페이 앱이 설치되지 않았거나 모바일 환경이 아닙니다.');
    }
  }, 2500);
}
