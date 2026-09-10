import PageHeader from '@/components/ui/AppPageHeader';
import AskKodeBuddyFab from '@/components/chat/AskKodeBuddyFab';

const PROGRESS_SUGGESTIONS = [
  'How am I doing in this course so far?',
  'What should I focus on to catch up?',
];

// TODO: build out per the Progress section of the Learner Figma.
export default function ProgressPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Progress" subtitle="See how far you've come." />

      <AskKodeBuddyFab suggestions={PROGRESS_SUGGESTIONS} />
    </div>
  );
}
