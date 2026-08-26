import type { Metadata } from 'next';
import AssignRole from './components/AssignRole';

export const metadata: Metadata = {
  title: 'Assign role | KodeBuddy AI',
};

export default function AssignRolePage() {
  return <AssignRole />;
}
