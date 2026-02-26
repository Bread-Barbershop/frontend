function openApp(
  type: 'naver' | 'kakao' | 'tmap',
  url: string,
  webUrl: string
) {
  if (!isValidProtocol(url) || !isValidProtocol(webUrl)) {
    console.error('Invalid URL protocol detected');
    return;
  }

  // eslint-disable-next-line prefer-const
  let timer: ReturnType<typeof setTimeout>;

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  window.location.href = url;

  timer = setTimeout(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);

    if (document.visibilityState === 'visible') {
      if (type === 'tmap') {
        if (
          confirm(
            'TMap이 설치돼있지 않습니다. 네이버 지도로 길을 찾으시겠습니까?'
          )
        ) {
          window.location.href = webUrl;
        }
      } else {
        window.location.href = webUrl;
      }
    }
  }, 1500);
}

function isValidProtocol(url: string) {
  const allowedProtocols = ['https:', 'nmap:', 'kakaomap:', 'tmap:'];
  try {
    const protocol = new URL(url).protocol;
    return allowedProtocols.includes(protocol);
  } catch {
    return allowedProtocols.some(p => url.startsWith(p));
  }
}

export function openNaverMap(lat: number, lng: number, name: string) {
  const encodeName = encodeURIComponent(name);
  const url = `nmap://place?lat=${lat}&lng=${lng}&name=${encodeName}&appname=mobile-invitation`;
  const webUrl = `https://map.naver.com/v5/search/${encodeName}`;
  const type = 'naver';

  openApp(type, url, webUrl);
}
export function openKakaoMap(lat: number, lng: number, name: string) {
  const encodeName = encodeURIComponent(name);
  const url = `kakaomap://look?p=${lat},${lng}`;
  const webUrl = `https://map.kakao.com/link/to/${encodeName},${lat},${lng}`;
  const type = 'kakao';

  openApp(type, url, webUrl);
}
export function openTMap(lat: number, lng: number, name: string) {
  const encodeName = encodeURIComponent(name);
  const url = `tmap://route?rGoName=${encodeName}&rGoX=${lng}&rGoY=${lat}`;
  const webUrl = `https://map.naver.com/v5/search/${encodeName}`;
  const type = 'tmap';

  openApp(type, url, webUrl);
}
