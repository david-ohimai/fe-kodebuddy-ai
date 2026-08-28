import ProtectedShell from '../components/ProtectedShell';

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell role="learner">{children}</ProtectedShell>;
}
