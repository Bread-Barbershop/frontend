// import GoogleLoginButton from './oauthTest/components/GoogleLoginButton';

import { getAuthSession } from '@/app/api/auth/_lib/getAuthSession';

import Cta from './components/Cta';
import Showcase from './components/Showcase';

export default async function Home() {
  const session = await getAuthSession();

  return (
    <section className="relative h-full min-h-0 flex justify-center items-end">
      <Cta initialIsLoggedIn={session.isLoggedIn} />
      <Showcase />
    </section>
  );
}
