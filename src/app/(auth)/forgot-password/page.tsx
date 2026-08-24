import type { Metadata } from 'next';
import ForgotPassword from './components/ForgotPassword';

export const metadata: Metadata = {
  title: 'Forgot password | KodeBuddy AI',
};

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
