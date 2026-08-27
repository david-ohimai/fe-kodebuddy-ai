'use client';

import React from 'react';
import { Users, Flag, ClipboardCheck } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppEmptyState from '@/components/ui/AppEmptyState';
import activity from '@/assets/images/activity.webp';
import { useCurrentUserContext } from '@/lib/auth/CurrentUserContext';

const STATS = {
  totalLearners: 0,
  needsAttention: 0,
  checkIns: 0,
};

const STAT_CARDS = [
  {
    icon: Users,
    label: 'Total learners',
    value: STATS.totalLearners,
    subtext: 'All learners assigned',
  },
  {
    icon: Flag,
    label: 'Needs attention',
    value: STATS.needsAttention,
    subtext: 'Learners',
  },
  {
    icon: ClipboardCheck,
    label: 'Check ins',
    value: STATS.checkIns,
    subtext: 'Sent this week',
  },
];

export default function MentorDashboard() {
  const { user } = useCurrentUserContext();
  const firstName =
    user?.fullName?.trim().split(' ')[0] ||
    user?.email.split('@')[0] ||
    'there';

  return (
    <div>
      <div className="mb-6">
        <h1 className="h5-b text-text">Welcome back, {firstName}! 👋</h1>
        <p className="b2-r mt-1 text-text-secondary">
          Here&apos;s how the learners assigned to you are doing.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STAT_CARDS.map(({ icon: Icon, label, value, subtext }) => (
          <AppCard key={label} padding="md">
            <AppCard.Icon variant="primary" className="mb-3">
              <Icon />
            </AppCard.Icon>
            <p className="b2-m text-text-secondary">{label}</p>
            <p className="h3-b mt-1 text-text">{value}</p>
            <p className="f1-r mt-1 text-muted">{subtext}</p>
          </AppCard>
        ))}
      </div>

      <AppCard padding="none">
        <div className="border-b border-muted/20 px-6 py-4">
          <h3 className="b1-b text-text">Recent Activity</h3>
        </div>
        <AppEmptyState
          image={activity}
          title="No activity yet"
          description="Activity will appear here as your assigned learners make progress."
          className="!min-h-0 py-14"
        />
      </AppCard>
    </div>
  );
}
