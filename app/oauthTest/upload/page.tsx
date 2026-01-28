import GoogleLoginButton from '../components/GoogleLoginButton';
import LoginStatusListener from '../components/LoginStatusListener';
import UploadFlowTest from '../components/UploadFlowTest';

export const metadata = {
  title: 'Drive Upload Test',
};

export default function UploadTestPage() {
  return (
    <main className="min-h-dvh px-6 py-12">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header className="rounded-2xl border p-6">
          <h1 className="text-2xl font-semibold">Drive Upload Flow Test</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Log in with Google, then run the upload flow using the form below.
          </p>

          <div className="mt-4">
            <GoogleLoginButton />
          </div>
          <LoginStatusListener />
        </header>

        <UploadFlowTest />
      </div>
    </main>
  );
}
