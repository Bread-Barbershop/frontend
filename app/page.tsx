import GoogleLoginButton from './oauthTest/components/GoogleLoginButton';

export default function Home() {
  return (
    <>
      <div className="text-red-400">브래드 이발소</div>
      <div className="w-125">
        <GoogleLoginButton />
      </div>
    </>
  );
}
