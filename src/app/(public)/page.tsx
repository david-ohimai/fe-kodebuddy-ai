import type { Metadata } from 'next';
import LandingPage from './components/LandingPage';

export const metadata: Metadata = {
  title: 'KodeBuddy AI — Learn practical skills. Build your future.',
  description:
    'KodeBuddy gives you a structured learning space to learn, practise, complete assignments, access resources, and get support throughout your learning journey.',
};

export default function Home() {
  return <LandingPage />;
}
