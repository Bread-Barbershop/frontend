// import GoogleLoginButton from './oauthTest/components/GoogleLoginButton';

import { getAuthSession } from '@/app/api/auth/_lib/getAuthSession';

import HomeHeroClient from './components/HomeHeroClient';

export default async function Home() {
  const session = await getAuthSession();

  return <HomeHeroClient initialIsLoggedIn={session.isLoggedIn} />;
}
