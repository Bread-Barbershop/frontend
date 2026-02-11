import LoadInvitationTest from '@/app/dashboard/components/LoadInvitationTest';
import GoogleLoginButton from '@/app/oauthTest/components/GoogleLoginButton';
import LoginStatusListener from '@/app/oauthTest/components/LoginStatusListener';

export const metadata = {
  title: '대시보드',
};

export default function DashboardPage() {
  return (
    <main className="min-h-dvh px-6 py-12">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header className="rounded-2xl border p-6">
          <h1 className="text-2xl font-semibold">대시보드 로드 테스트</h1>
          <p className="mt-2 text-sm text-neutral-600">
            로그인 후 대시보드 로드 API를 호출해 초대장 목록을 표시합니다.
          </p>

          <div className="mt-4">
            <GoogleLoginButton />
          </div>
          <LoginStatusListener />
        </header>

        <LoadInvitationTest />
      </div>
    </main>
  );
}
