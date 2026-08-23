import type { Metadata } from 'next';
import SignUp from './components/SignUp';

export const metadata: Metadata = {
  title: 'Create your account | KodeBuddy AI',
};

export default function SignUpPage() {
  return <SignUp />;
}
