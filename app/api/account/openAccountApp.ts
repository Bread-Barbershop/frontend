export function openAccountApp() {
  if (typeof window === 'undefined') return;

  const url = 'kakaotalk://kakaopay/money/to/bank';
  let isExecuted = false;

  window.addEventListener('focus', () => {
    isExecuted = false;
  });

  window.addEventListener('blur', () => {
    isExecuted = true;
  });

  // 앱 실행 시도
  window.location.href = url;

  // 2.5초 뒤에 검사
  setTimeout(() => {
    if (isExecuted === false) {
      // 앱이 설치되어 있지 않은 상태
      alert('카카오페이 앱이 설치되지 않았거나 모바일 환경이 아닙니다.');
    }
  }, 2500);
}
