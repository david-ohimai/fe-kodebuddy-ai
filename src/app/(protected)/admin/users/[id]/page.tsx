import type { Metadata } from 'next';
import UserDetails from './components/UserDetails';

export const metadata: Metadata = {
  title: 'User details | KodeBuddy AI',
};

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserDetails userId={Number(id)} />;
}
