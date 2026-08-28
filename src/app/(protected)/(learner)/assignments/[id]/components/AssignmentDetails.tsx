'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Info,
  Link2,
  Sparkles,
} from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppPill from '@/components/ui/AppPill';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import AppSpinner from '@/components/ui/AppSpinner';
import AppConfirmModal from '@/components/ui/AppConfirmModal';
import { useToast } from '@/components/ui/ToastProvider';
import KodeBuddyChatPanel from '@/components/chat/KodeBuddyChatPanel';
import { cx } from '@/lib/utils/cx';
import { getLearnerAssignment } from '@/lib/api/assignments.api';
import {
  createSubmission,
  SUBMISSION_CONTENT_MAX_LENGTH,
} from '@/lib/api/submissions.api';
import { getErrorMessage } from '@/lib/api/client';
import {
  ASSIGNMENT_STATUS_COLOR,
  ASSIGNMENT_STATUS_LABEL,
  formatDueDate,
  formatModuleLabel,
  type AssignmentItem,
  type LearnerAssignment,
} from '@/types/assignment.types';

export interface AssignmentDetailsProps {
  assignmentId: number;
}

/**
 * Requirement ticks are a self-assessment aid with no backend field, so they
 * live in the learner's own browser. Keyed per assignment so two assignments
 * never share ticks.
 */
function requirementsStorageKey(assignmentId: number) {
  return `kodebuddy_assignment_${assignmentId}_requirements`;
}

/**
 * Previously-saved ticks for this assignment, sized to its current
 * requirements. Reading storage can throw in a private window, and the
 * requirement list may have changed since the ticks were written, so anything
 * unexpected falls back to all-unticked.
 */
function restoreRequirementTicks(assignment: LearnerAssignment): boolean[] {
  const empty = new Array<boolean>(assignment.requirements.length).fill(false);
  try {
    const raw = window.localStorage.getItem(
      requirementsStorageKey(assignment.id),
    );
    if (!raw) return empty;
    const saved: unknown = JSON.parse(raw);
    if (!Array.isArray(saved)) return empty;
    return empty.map((_, index) => saved[index] === true);
  } catch {
    return empty;
  }
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AppCard padding="lg">
      <h2 className="h6-b text-text">{title}</h2>
      <hr className="mt-4 mb-6 border-disabled" />
      {children}
    </AppCard>
  );
}

/** "Part A - Card Component" banner followed by its numbered steps. */
function InstructionPart({
  item,
  steps,
}: {
  item: AssignmentItem;
  steps: string[];
}) {
  return (
    <div>
      <div className="rounded-btn bg-primary-light px-4 py-3">
        <p className="b1-m text-text">{item.title}</p>
      </div>

      {steps.length > 0 && (
        <ol className="mt-4 flex list-decimal flex-col gap-4 pl-8">
          {steps.map((step, index) => (
            <li key={index} className="b1-r text-text">
              {step}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function AssignmentDetails({
  assignmentId,
}: AssignmentDetailsProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [assignment, setAssignment] = useState<LearnerAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const [checked, setChecked] = useState<boolean[]>([]);
  const [submissionLink, setSubmissionLink] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getLearnerAssignment(assignmentId)
      .then((result) => {
        if (cancelled) return;
        setAssignment(result);
        if (!result) {
          setError('This assignment could not be found.');
          return;
        }

        setChecked(restoreRequirementTicks(result));
        setSubmissionLink(result.submissionContent ?? '');
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err, 'Could not load this assignment.'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [assignmentId]);

  const toggleRequirement = useCallback(
    (index: number) => {
      setChecked((prev) => {
        const next = prev.map((value, i) => (i === index ? !value : value));
        if (assignment) {
          try {
            window.localStorage.setItem(
              requirementsStorageKey(assignment.id),
              JSON.stringify(next),
            );
          } catch {
            // Storage unavailable — ticks still work for this session.
          }
        }
        return next;
      });
    },
    [assignment],
  );

  const completion = useMemo(() => {
    if (checked.length === 0) return 0;
    return Math.round(
      (checked.filter(Boolean).length / checked.length) * 100,
    );
  }, [checked]);

  const alreadySubmitted = Boolean(assignment?.submitted);
  const trimmedLink = submissionLink.trim();
  const canSubmit = trimmedLink.length > 0 && !alreadySubmitted && !submitting;

  const handleSubmit = useCallback(async () => {
    if (!assignment) return;

    setSubmitting(true);
    try {
      const submission = await createSubmission(assignment.id, trimmedLink);
      setConfirmOpen(false);
      setSuccessOpen(true);
      setAssignment((prev) =>
        prev
          ? {
              ...prev,
              status: 'submitted',
              submitted: true,
              submittedAt: submission.submittedAt,
              submissionContent: submission.content,
            }
          : prev,
      );
    } catch (err) {
      setConfirmOpen(false);
      showError(
        'Could not submit assignment',
        getErrorMessage(err, 'Please try again in a moment.'),
      );
    } finally {
      setSubmitting(false);
    }
  }, [assignment, trimmedLink, showError]);

  const openConfirm = useCallback(() => {
    if (trimmedLink.length > SUBMISSION_CONTENT_MAX_LENGTH) {
      setLinkError(
        `Keep this under ${SUBMISSION_CONTENT_MAX_LENGTH} characters.`,
      );
      return;
    }
    setLinkError(null);
    setConfirmOpen(true);
  }, [trimmedLink]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <AppSpinner />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/assignments"
          className="inline-flex w-fit items-center gap-2 b2-m text-primary underline underline-offset-4"
        >
          <ArrowLeft size={16} />
          Back to Assignments
        </Link>
        <AppCard padding="lg">
          <p className="b1-b text-text">Assignment unavailable</p>
          <p className="b2-r mt-1 text-text-secondary">{error}</p>
        </AppCard>
      </div>
    );
  }

  const moduleLabel = formatModuleLabel(assignment.moduleOrder);
  const paragraphs = (assignment.description ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  // The first paragraph is the summary on the overview card, so the Description
  // section shows what follows it. A single-paragraph description therefore has
  // no separate body to repeat.
  const summary = paragraphs[0] ?? null;
  const bodyParagraphs = paragraphs.slice(1);

  return (
    <>
      {/* items-start keeps the docked panel from stretching the row, so the
          brief below it flows to its natural length instead of being padded
          out to the panel's height. */}
      <div className="mx-auto flex w-full max-w-7xl items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-6 pb-2">
          <Link
            href="/assignments"
            className="inline-flex w-fit items-center gap-2 b1-m text-primary underline underline-offset-4"
          >
            <ArrowLeft size={18} />
            Back to Assignments
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="h5-b text-text">Assignment Details</h1>
              <p className="b2-r text-text-secondary">
                Review the brief, then submit your work before the due date.
              </p>
            </div>

            {!chatOpen && (
              <button
                type="button"
                onClick={() => setChatOpen(true)}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-linear-to-r from-primary to-secondary px-6 py-3 b2-b text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Sparkles size={18} />
                Ask KodeBuddy
              </button>
            )}
          </div>

          {/* Overview */}
          <AppCard padding="lg">
            <p className="f1-b tracking-widest text-text-secondary">
              {moduleLabel}
            </p>
            <h2 className="h4-b mt-3 text-text">{assignment.title}</h2>

            {summary && (
              <p className="b1-r mt-3 max-w-3xl text-text-secondary">
                {summary}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <AppPill
                label={ASSIGNMENT_STATUS_LABEL[assignment.status]}
                color={ASSIGNMENT_STATUS_COLOR[assignment.status]}
                icon={<Clock size={14} />}
              />
              <AppPill
                label={formatDueDate(assignment.dueDate)}
                color="warning"
                icon={<CalendarDays size={14} />}
              />
              {assignment.graded && assignment.score !== null && (
                <AppPill
                  label={`${assignment.score} / ${assignment.maximumScore}`}
                  color="success"
                />
              )}
            </div>
          </AppCard>

          {/* Description */}
          {bodyParagraphs.length > 0 && (
            <DetailSection title="Description">
              <div className="flex flex-col gap-4">
                {bodyParagraphs.map((paragraph, index) => (
                  <p key={index} className="b1-r text-text">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-btn bg-primary-light px-4 py-3.5">
                <Info size={18} className="mt-0.5 shrink-0 text-primary" />
                <p className="b2-r text-text-secondary">
                  This builds directly on the {assignment.moduleTitle} live
                  session. Missed it? The recording is linked in Resources.
                </p>
              </div>
            </DetailSection>
          )}

          {/* Instructions */}
          {assignment.instructions.length > 0 && (
            <DetailSection title="Instructions">
              <div className="flex flex-col gap-8">
                {assignment.instructions.map((item) => (
                  <InstructionPart
                    key={item.title}
                    item={item}
                    // Steps are newline-separated inside one description on the
                    // backend; a single-line description renders as one step.
                    steps={item.description
                      .split(/\n+/)
                      .map((line) => line.replace(/^\s*\d+[.)]\s*/, '').trim())
                      .filter(Boolean)}
                  />
                ))}
              </div>
            </DetailSection>
          )}

          {/* Requirements */}
          {assignment.requirements.length > 0 && (
            <DetailSection title="Requirements">
              <ul className="flex flex-col gap-4">
                {assignment.requirements.map((item, index) => {
                  const isChecked = checked[index] ?? false;
                  return (
                    <li key={item.title}>
                      <label
                        className={cx(
                          'flex cursor-pointer items-start gap-4 rounded-card border px-5 py-4 transition-colors',
                          isChecked
                            ? 'border-secondary/50'
                            : 'border-disabled hover:border-muted/50',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRequirement(index)}
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={cx(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors',
                            isChecked
                              ? 'border-secondary bg-secondary'
                              : 'border-muted/60',
                            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-1',
                          )}
                        />
                        <span>
                          <span className="block b1-b text-text">
                            {item.title}
                          </span>
                          <span className="mt-0.5 block b2-r text-text-secondary">
                            {item.description}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="b2-m text-text">{completion}% complete</span>
                  <span className="b2-r text-muted">Current progress</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={completion}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Requirements completed"
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary-light"
                >
                  <div
                    className="h-full rounded-full bg-secondary transition-[width] duration-300"
                    style={{ width: `${Math.max(completion, 2)}%` }}
                  />
                </div>
              </div>
            </DetailSection>
          )}

          {/* Submission */}
          <DetailSection title="Submission">
            {alreadySubmitted ? (
              <div className="flex items-start gap-3 rounded-btn bg-secondary-light px-4 py-3.5">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-secondary-dark"
                />
                <div>
                  <p className="b2-m text-text">
                    Submitted
                    {assignment.submittedAt
                      ? ` on ${formatDueDate(assignment.submittedAt)}`
                      : ''}
                    .
                  </p>
                  {assignment.submissionContent && (
                    <p className="b2-r mt-1 break-all text-text-secondary">
                      {assignment.submissionContent}
                    </p>
                  )}
                  {assignment.feedback && (
                    <p className="b2-r mt-2 text-text-secondary">
                      <span className="b2-m text-text">Feedback: </span>
                      {assignment.feedback}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <AppInput
                  label="Drop your Figma link below"
                  icon={Link2}
                  type="url"
                  inputMode="url"
                  placeholder="www.figma.com"
                  value={submissionLink}
                  error={linkError ?? undefined}
                  maxLength={SUBMISSION_CONTENT_MAX_LENGTH}
                  onChange={(e) => {
                    setSubmissionLink(e.target.value);
                    if (linkError) setLinkError(null);
                  }}
                />

                <AppButton
                  className="mt-6 w-full sm:max-w-sm"
                  radius="full"
                  size="large"
                  disabled={!canSubmit}
                  onClick={openConfirm}
                >
                  Submit assignment
                </AppButton>
              </>
            )}
          </DetailSection>
        </div>

        {/* Assistant panel — docked beside the brief so the learner keeps context */}
        {chatOpen && (
          <>
            {/* Below lg the panel takes over the screen instead of vanishing. */}
            <div
              role="presentation"
              onClick={() => setChatOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            {/* From lg the panel is a top-aligned card, not a pinned column:
                it ends with its own content and the brief scrolls on past it,
                which is how the design lays the page out. Below lg it takes
                over the screen instead of being squeezed into a sidebar. */}
            <aside className="fixed inset-x-4 top-4 bottom-4 z-50 lg:relative lg:inset-auto lg:z-auto lg:h-160 lg:w-100 lg:shrink-0">
              <KodeBuddyChatPanel
                context={{
                  courseId: assignment.courseId,
                  moduleId: assignment.moduleId,
                  assignmentId: assignment.id,
                  label: moduleLabel,
                }}
                suggestions={[
                  'Explain Auto-layout in simple terms',
                  "I'm not sure where to start with Part A",
                ]}
                onClose={() => setChatOpen(false)}
              />
            </aside>
          </>
        )}
      </div>

      <AppConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        hideCloseOnBackdrop={submitting}
        icon={<span className="text-5xl">⚠️</span>}
        title="Submit assignment?"
        description={
          <>
            Are you sure you want to submit{' '}
            <span className="text-primary">
              {moduleLabel.replace('MODULE', 'Module')}: {assignment.title}
            </span>{' '}
            assignment?
          </>
        }
        secondaryButton={{
          label: 'Cancel',
          onClick: () => setConfirmOpen(false),
          disabled: submitting,
        }}
        primaryButton={{
          label: 'Yes, Submit',
          onClick: handleSubmit,
          loading: submitting,
        }}
      />

      <AppConfirmModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        hideCloseOnBackdrop
        icon={
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-light">
            <CheckCircle2 size={40} className="text-secondary" />
          </span>
        }
        description="Your assignment has been successfully submitted"
        primaryButton={{
          label: 'Return to Dashboard',
          onClick: () => {
            setSuccessOpen(false);
            showSuccess(
              'Assignment submitted successfully',
              'Your trainer will review it shortly.',
            );
            router.push('/assignments');
          },
        }}
      />
    </>
  );
}
