export async function fetchNavigation(
  slat: number,
  slng: number,
  sname: string,
  dlat: number,
  dlng: number,
  dname: string
) {
  const res = await fetch(
    `nmap://route/car?slat=${slat}&slng=${slng}&sname=${sname}&dlat=${dlat}&dlng=${dlng}&dname=${dname}&appname=mobile-invitation`
  );

  if (!res.ok) {
    throw new Error('네이버 길찾기 연결 실패');
  }

  return res;
}
