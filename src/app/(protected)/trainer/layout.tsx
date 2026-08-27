import ProtectedShell from '../components/ProtectedShell';

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell role="trainer">{children}</ProtectedShell>;
}
