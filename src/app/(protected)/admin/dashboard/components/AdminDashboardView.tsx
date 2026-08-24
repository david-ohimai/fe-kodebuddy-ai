'use client';

import React from 'react';
import Image from 'next/image';
import {
  Users,
  BookOpen,
  GraduationCap,
  UserPlus,
  FileText,
  Lightbulb,
} from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import activity from '@/assets/images/activity.webp';

interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  meta: string;
  timestamp: string;
}

interface DashboardStats {
  totalUsers: number;
  usersBreakdown?: string;
  activeCourses: number;
  coursesSubtext?: string;
  activeCohorts: number;
  cohortsSubtext?: string;
}

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

const firstName = 'Ayomide';

const stats: DashboardStats = {
  totalUsers: 0,
  activeCourses: 0,
  activeCohorts: 0,
};

const activities: ActivityItem[] = [];

const AdminDashboardView: React.FC = () => {
  const hasData = stats.totalUsers > 0;

  const STAT_CARDS = [
    {
      icon: Users,
      label: 'Total users',
      value: stats.totalUsers,
      subtext: hasData
        ? stats.usersBreakdown
        : 'All learners, trainers & mentors',
    },
    {
      icon: BookOpen,
      label: 'Active courses',
      value: stats.activeCourses,
      subtext: hasData ? stats.coursesSubtext : 'Courses published',
    },
    {
      icon: GraduationCap,
      label: hasData ? 'Active cohorts' : 'Active Cohorts',
      value: stats.activeCohorts,
      subtext: hasData ? stats.cohortsSubtext : 'active cohorts',
    },
  ];

  const actionButtons = (
    <div className="mx-auto flex w-full max-w-xs flex-col gap-3 [@media(min-width:470px)]:w-fit [@media(min-width:470px)]:max-w-none [@media(min-width:470px)]:flex-row">
      <AppButton
        startIcon={<UserPlus size={18} />}
        fullWidth
        radius="full"
        className="[@media(min-width:470px)]:w-auto"
      >
        Invite trainer/mentor
      </AppButton>
      <AppButton
        variant="outlined"
        startIcon={<FileText size={18} />}
        fullWidth
        radius="full"
        className="[@media(min-width:470px)]:w-auto"
      >
        Create courses
      </AppButton>
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="h5-b text-text">
            {hasData
              ? `Welcome back, ${firstName}`
              : `Welcome to KodeBuddy ${firstName} !`}
          </h1>
          <p className="b2-r mt-1 text-text-secondary">
            {hasData
              ? "Here's what's happening on KodeBuddy today."
              : 'Your admin workspace is ready. Start by setting up your platform.'}
          </p>
        </div>
        {hasData && actionButtons}
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

      {!hasData && (
        <AppCard
          padding="lg"
          className="mb-6 flex flex-col items-center py-14 text-center"
        >
          <h2 className="h5-b text-text">
            Let&apos;s get your platform ready.
          </h2>
          <p className="b2-r mt-2 max-w-md text-text-secondary">
            Add your team, create your first course and organise learners into
            cohorts to get started.
          </p>
          <div className="mt-6 w-full">{actionButtons}</div>
          <p className="f1-r mt-4 flex items-center gap-1.5 text-muted">
            <Lightbulb size={14} />
            Invite trainers or mentors first, then create courses and add
            content later.
          </p>
        </AppCard>
      )}

      <AppCard padding="none">
        <div className="flex items-center justify-between border-b border-muted/20 px-6 py-4">
          <h3 className="b1-b text-text">Recent Activity</h3>
          {hasData && (
            <button type="button" className="b2-m text-primary hover:underline">
              View all
            </button>
          )}
        </div>

        {hasData ? (
          <ul>
            {activities.map((item, i) => (
              <li
                key={item.id}
                className={cx(
                  'flex items-center justify-between px-6 py-4',
                  i !== activities.length - 1 && 'border-b border-muted/20',
                )}
              >
                <p className="b2-r text-text-secondary">
                  <span className="b2-b text-text">{item.actor}</span>{' '}
                  {item.action} · {item.meta}
                </p>
                <span className="f1-r shrink-0 text-muted">
                  {item.timestamp}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <Image
              src={activity}
              alt=""
              width={154}
              height={100}
              className="mb-4"
            />
            <p className="b1-b text-text">No activity yet</p>
            <p className="b2-r mt-1 max-w-sm text-muted">
              Activity will appear here as you add users, courses and manage the
              platform.
            </p>
          </div>
        )}
      </AppCard>
    </div>
  );
};

export default AdminDashboardView;
