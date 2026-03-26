'use client';

import { useEffect, useState } from 'react';

import { KakaoShareButton } from '@/components/organisms/kakaotalk-url/KakaoShareButton';

type KakaoShareData = {
  title: string;
  description: string;
  imageFileId?: string;
  showLocationButton: boolean;
  showShareButton: boolean;
};

export default function TestPage() {
  const [shareData, setShareData] = useState<KakaoShareData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 수동 입력용 폼 상태
  const [manualData, setManualData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    buttonText: '',
  });

  // 마운트 시 드라이브 전역에서 최신 kakao-share.json을 자동으로 탐색하여 데이터를 불러옴
  useEffect(() => {
    loadShareData();
  }, []);

  const loadShareData = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/drive/kakaoShare`);
      const result = await res.json();

      if (!result.ok) {
        setError(result.error || '데이터 로드 실패');
        return;
      }

      setShareData(result.data);
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // shareData가 로드되면 manualData에 반영
  useEffect(() => {
    if (shareData) {
      setManualData(prev => ({
        ...prev,
        title: shareData.title || prev.title,
        description: shareData.description || prev.description,
        imageUrl: shareData.imageFileId
          ? `https://lh3.googleusercontent.com/d/${shareData.imageFileId}`
          : prev.imageUrl,
      }));
    }
  }, [shareData]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center gap-10">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          카카오톡 공유 테스트
        </h1>
        <p className="text-gray-600">
          Google Drive에서 저장된 카카오톡 공유 데이터를 자동으로 불러옵니다.
        </p>
      </header>

      {/* Google Drive JSON 로드 섹션 */}
      <section className="max-w-xl w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-2">데이터 연동 상태</h2>
        <p className="text-xs text-gray-500 mb-4 text-center">
          드라이브 전체에서 가장 최근에 저장된 <code>kakao-share.json</code>을
          자동으로 찾아옵니다.
        </p>
        <button
          onClick={loadShareData}
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 w-full sm:w-auto"
        >
          {loading ? '데이터 불러오는 중...' : '최신 데이터 다시 불러오기'}
        </button>
        {error && (
          <p className="mt-3 text-sm text-red-500 font-medium">{error}</p>
        )}
        {shareData && !loading && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-800 w-full text-center">
            ✅ 데이터 자동 로드 완료
          </div>
        )}
        <h2 className="text-xl font-semibold my-10">카카오톡 공유</h2>
        <KakaoShareButton
          title={manualData.title}
          description={manualData.description}
          imageUrl={manualData.imageUrl || undefined}
          linkUrl={manualData.linkUrl}
          buttonText={manualData.buttonText}
        />
      </section>
    </div>
  );
}
