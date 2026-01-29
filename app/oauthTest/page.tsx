import GoogleLoginButton from './components/GoogleLoginButton';
import LoginStatusListener from './components/LoginStatusListener';
import SaveTestButton from './components/saveTestButton';

export const metadata = {
  title: '로그인 | 모바일 청첩장',
};

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border p-6">
        <h1 className="text-2xl font-semibold">Google로 로그인</h1>

        <p className="mt-2 text-sm text-neutral-600">
          구글 계정에 로그인하여 AccessToken 과 RefreshToken을 받아옵니다.
        </p>

        <div className="mt-6">
          <GoogleLoginButton />
        </div>
        <LoginStatusListener />
        <SaveTestButton />
      </div>
    </main>
  );
}
