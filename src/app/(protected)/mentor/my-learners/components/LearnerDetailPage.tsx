'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import SendIcon from '@mui/icons-material/Send';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppProgressBar from '@/components/ui/AppProgressBar';
import CheckInModal from './CheckInModal';
import ResourcePickerCard, {
  RecommendableResource,
} from './ResourcePickerCard';
import RecommendResourceModal from './RecommendResourceModal';

export interface LearnerModuleProgress {
  id: string;
  title: string;
  statusLabel: string;
  progress: number;
  barClassName?: string;
}

export interface LearnerActivityItem {
  id: string;
  text: string;
  timestamp?: string;
}

export interface LearnerDetailData {
  id: string;
  name: string;
  role: string;
  status: 'needs-attention' | 'on-track';
  avatarUrl?: string;
  overallProgressPercent: number;
  daysSinceLastActivity: number;
  checkInsSentCount: number;
  modules: LearnerModuleProgress[];
  recentActivity: LearnerActivityItem[];
}

export interface LearnerDetailPageProps {
  learner: LearnerDetailData;
  backHref?: string;
  onViewAllActivity?: () => void;
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function StatusPill({ status }: { status: LearnerDetailData['status'] }) {
  const isNeedsAttention = status === 'needs-attention';
  return (
    <span
      className={cx(
        'f1-b inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1',
        isNeedsAttention
          ? 'bg-warning-light text-warning-dark'
          : 'bg-primary-light text-primary',
      )}
    >
      {isNeedsAttention ? 'Needs attention' : 'On track'}
    </span>
  );
}

function CircularProgress({
  percent,
  size = 56,
  strokeWidth = 5,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="text-disabled"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-secondary"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      <span
        className="b2-b text-text"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {clamped}%
      </span>
    </div>
  );
}

const LearnerDetailPage: React.FC<LearnerDetailPageProps> = ({
  learner,
  backHref = '/mentor/my-learners',
  onViewAllActivity,
}) => {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [sendingCheckIn, setSendingCheckIn] = useState(false);
  const [checkInsCount, setCheckInsCount] = useState(learner.checkInsSentCount);

  const [pickingResource, setPickingResource] = useState(false);
  const [selectedResource, setSelectedResource] =
    useState<RecommendableResource | null>(null);
  const [recommendOpen, setRecommendOpen] = useState(false);
  const [sendingResource, setSendingResource] = useState(false);

  const firstName = learner.name.split(' ')[0];
  const currentModule =
    learner.modules.find((m) => m.progress < 100) ??
    learner.modules[learner.modules.length - 1];

  const handleSendCheckIn = async (message: string) => {
    setSendingCheckIn(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setCheckInsCount((count) => count + 1);
    } finally {
      setSendingCheckIn(false);
    }
  };

  const handleSendResource = async (note: string) => {
    setSendingResource(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
    } finally {
      setSendingResource(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={backHref}
        className="b2-b inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
      >
        <ArrowBackIcon fontSize="small" /> Back to learners
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {learner.avatarUrl ? (
            <div
              aria-label={learner.name}
              className="h-14 w-14 rounded-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${learner.avatarUrl})` }}
            />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light h5-b text-primary">
              {learner.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <h1 className="h5-b text-text">{learner.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <StatusPill status={learner.status} />
              <span className="b2-r text-muted">{learner.role}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AppButton
            variant="outlined"
            color="primary"
            radius="full"
            onClick={() => setPickingResource(true)}
          >
            Recommend a resource
          </AppButton>
          <AppButton
            radius="full"
            startIcon={<SendIcon fontSize="small" />}
            onClick={() => setCheckInOpen(true)}
          >
            Send check in
          </AppButton>
        </div>
      </div>

      {pickingResource ? (
        <ResourcePickerCard
          resources={[]}
          onCancel={() => setPickingResource(false)}
          onNext={(resource) => {
            setSelectedResource(resource);
            setPickingResource(false);
            setRecommendOpen(true);
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AppCard padding="md">
              <p className="b2-m text-text-secondary">Overall Progress</p>
              <div className="mt-3">
                <CircularProgress percent={learner.overallProgressPercent} />
              </div>
              <p className="f1-r mt-2 text-muted">completed</p>
            </AppCard>
            <AppCard padding="md">
              <AppCard.Icon variant="primary" className="mb-3">
                <EventNoteIcon />
              </AppCard.Icon>
              <p className="b2-m text-text-secondary">Last activity</p>
              <p className="h3-b mt-1 text-text">
                {learner.daysSinceLastActivity}
              </p>
              <p className="f1-r mt-1 text-muted">Days since last activity</p>
            </AppCard>
            <AppCard padding="md">
              <AppCard.Icon variant="primary" className="mb-3">
                <CheckCircleOutlinedIcon />
              </AppCard.Icon>
              <p className="b2-m text-text-secondary">Check ins</p>
              <p className="h3-b mt-1 text-text">{checkInsCount}</p>
              <p className="f1-r mt-1 text-muted">Sent so far</p>
            </AppCard>
          </div>

          <AppCard padding="lg">
            <h2 className="b1-b text-text">Progress by module</h2>
            <div className="mt-4 flex flex-col gap-5">
              {learner.modules.map((module) => (
                <div key={module.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="b2-b text-text">{module.title}</p>
                      <p className="f1-r text-muted">{module.statusLabel}</p>
                    </div>
                    <span className="f1-r text-muted">Current progress</span>
                  </div>
                  <AppProgressBar
                    percent={module.progress}
                    barClassName={module.barClassName}
                  />
                </div>
              ))}
            </div>
          </AppCard>

          <AppCard padding="none">
            <div className="flex items-center justify-between border-b border-disabled p-5 sm:p-6">
              <h2 className="b1-b text-text">Recent Activity</h2>
              <button
                type="button"
                onClick={onViewAllActivity}
                className="b2-b text-primary hover:underline"
              >
                View all
              </button>
            </div>
            {learner.recentActivity.length === 0 ? (
              <p className="b2-r p-6 text-muted">No recent activity to show.</p>
            ) : (
              <ul className="divide-y divide-disabled">
                {learner.recentActivity.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 sm:px-6"
                  >
                    <p className="b2-r text-text">{item.text}</p>
                    {item.timestamp && (
                      <p className="f1-r text-muted">{item.timestamp}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </AppCard>
        </>
      )}

      <CheckInModal
        open={checkInOpen}
        learnerName={learner.name}
        learnerFirstName={firstName}
        inactiveDays={learner.daysSinceLastActivity}
        currentModuleTitle={currentModule.title}
        saving={sendingCheckIn}
        onClose={() => setCheckInOpen(false)}
        onSend={handleSendCheckIn}
      />

      <RecommendResourceModal
        open={recommendOpen}
        learnerFirstName={firstName}
        resource={selectedResource}
        saving={sendingResource}
        onClose={() => setRecommendOpen(false)}
        onSend={handleSendResource}
      />
    </div>
  );
};

export default LearnerDetailPage;
