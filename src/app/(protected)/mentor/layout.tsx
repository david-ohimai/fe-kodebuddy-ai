import ProtectedShell from '../components/ProtectedShell';

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell role="mentor">{children}</ProtectedShell>;
}
