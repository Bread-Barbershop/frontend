function openApp(
  type: 'naver' | 'kakao' | 'tmap',
  url: string,
  webUrl: string
) {
  if (!isValidProtocol(url) || !isValidProtocol(webUrl)) {
    console.error('Invalid URL protocol detected');
    return;
  }

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
  // const iosStoreURL = 'itms-apps://itunes.apple.com/app/id311867728?mt=8';
  // const androidStoreURL =
  //   'https://play.google.com/store/apps/details?id=com.nhn.android.nmap';

  openApp(type, url, webUrl);
  // openApp(url, webUrl, iosStoreURL, androidStoreURL);
}
export function openKakaoMap(lat: number, lng: number, name: string) {
  const encodeName = encodeURIComponent(name);
  const url = `kakaomap://look?p=${lat},${lng}`;
  const webUrl = `https://map.kakao.com/link/to/${encodeName},${lat},${lng}`;
  const type = 'kakao';
  // const iosStoreURL = 'itms-apps://itunes.apple.com/app/id304608425';
  // const androidStoreURL =
  //   'https://play.google.com/store/apps/details?id=com.kakao.map';

  openApp(type, url, webUrl);
  // openApp(url, webUrl, iosStoreURL, androidStoreURL);
}
export function openTMap(lat: number, lng: number, name: string) {
  const encodeName = encodeURIComponent(name);
  const url = `tmap://route?rGoName=${encodeName}&rGoX=${lng}&rGoY=${lat}`;
  const webUrl = `https://map.naver.com/v5/search/${encodeName}`;
  const type = 'tmap';
  // const iosStoreURL = 'itms-apps://itunes.apple.com/app/id431589174';
  // const androidStoreURL =
  //   'https://play.google.com/store/apps/details?id=com.skt.tmap';

  openApp(type, url, webUrl);
  // openApp(url, webUrl, iosStoreURL, androidStoreURL);
}
