// import GoogleLoginButton from './oauthTest/components/GoogleLoginButton';

import Cta from './components/Cta';
import Showcase from './components/Showcase';

export default function Home() {
  return (
    <section className="relative h-full min-h-0 flex justify-center items-end">
      <Cta />
      <Showcase />
    </section>
  );
}
