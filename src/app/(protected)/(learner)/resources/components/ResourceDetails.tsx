'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, Folder, Sparkles } from 'lucide-react';

import PageHeader from '@/components/ui/AppPageHeader';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppSpinner from '@/components/ui/AppSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import KodeBuddyChatPanel from '@/components/chat/KodeBuddyChatPanel';
import { getLearnerResource } from '@/lib/api/resources.api';
import { getErrorMessage } from '@/lib/api/client';
import type { LearnerResource } from '@/types/resource.types';

const PLACEHOLDER_LEVEL = 'Beginner';

interface ResourceDetailsProps {
  resourceId: number;
}

export default function ResourceDetails({ resourceId }: ResourceDetailsProps) {
  const { showError } = useToast();
  const [resource, setResource] = useState<LearnerResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [resourceUsed, setResourceUsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getLearnerResource(resourceId)
      .then((found) => {
        if (cancelled) return;
        if (!found) setNotFound(true);
        else setResource(found);
      })
      .catch((err) => {
        if (!cancelled) {
          showError(
            'Could not load resource',
            getErrorMessage(err, 'Please try again.'),
          );
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <AppSpinner size={40} />
      </div>
    );
  }

  if (notFound || !resource) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/resources"
          className="b2-b inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
        >
          <Folder size={16} /> Back to Resources
        </Link>
        <AppCard padding="lg" className="text-center">
          <p className="b1-b text-text">Resource not found</p>
          <p className="b2-r mt-1 text-muted">
            This resource may have been removed, or the link is incorrect.
          </p>
        </AppCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Resource Details"
        subtitle="Explore this resource and continue your learning."
      />

      {resourceUsed && (
        <div className="flex items-start gap-3 rounded-card border border-success/20 bg-success-light px-5 py-4">
          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0 text-success-dark"
          />
          <div>
            <p className="b2-b text-success-dark">
              Resource added to your learning
            </p>
            <p className="b2-r mt-0.5 text-success-dark/80">
              This resource is available to support your learning in{' '}
              {resource.moduleTitle}.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* Main content */}
        <div className="min-w-0">
          <div className="flex flex-col gap-4 border-b border-disabled pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="f1-b rounded-full bg-warning/15 px-2.5 py-1 uppercase text-warning">
                  {resource.type}
                </span>
                <span className="f1-m uppercase text-muted">
                  {resource.courseTitle} · {PLACEHOLDER_LEVEL}
                </span>
              </div>

              <h1 className="h5-b mt-3 text-text">{resource.title}</h1>
              <p className="b2-r mt-2 text-text-secondary">
                {resource.description || 'No description added yet.'}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2">
              {resourceUsed ? (
                <AppButton href="/learn" radius="full">
                  Continue Learning →
                </AppButton>
              ) : (
                <AppButton radius="full" onClick={() => setResourceUsed(true)}>
                  Use Resource in Learning →
                </AppButton>
              )}
              <AppButton
                href="/resources"
                variant="outlined"
                color="neutral"
                radius="full"
                startIcon={<Folder size={14} />}
              >
                Back to Resources
              </AppButton>
            </div>
          </div>

          <article className="pt-6">
            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="b2-m mb-6 flex w-fit items-center gap-2 rounded-full bg-primary-light px-4 py-2.5 text-primary transition hover:opacity-90"
              >
                <ExternalLink size={16} />
                Open resource
              </a>
            )}

            <h2 className="b1-b text-text">Overview</h2>
            <p className="b2-r mt-3 max-w-3xl whitespace-pre-wrap text-text-secondary">
              {resource.description ||
                'No further details have been added to this resource yet.'}
            </p>

            {resource.content && (
              <div className="mt-6 rounded-card border border-disabled bg-surface-raised p-5">
                <h3 className="b1-b mb-2 text-text">Content</h3>
                <div className="b2-r whitespace-pre-wrap leading-relaxed text-text-secondary">
                  {resource.content}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4 border-t border-disabled pt-5 sm:flex-row sm:items-center sm:justify-between">
              {resourceUsed ? (
                <>
                  <div>
                    <p className="b2-m text-text">Action successful!</p>
                    <p className="b2-r mt-0.5 text-muted">
                      Return to your learning journey or browse more resources.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <AppButton
                      href="/resources"
                      variant="outlined"
                      color="neutral"
                      radius="full"
                    >
                      Back to Resources
                    </AppButton>
                    <AppButton href="/learn" radius="full">
                      Continue Learning →
                    </AppButton>
                  </div>
                </>
              ) : (
                <>
                  <p className="b2-r text-muted">
                    Ready to apply this to your course?
                  </p>
                  <AppButton
                    radius="full"
                    onClick={() => setResourceUsed(true)}
                  >
                    Use Resource in Learning →
                  </AppButton>
                </>
              )}
            </div>
          </article>
        </div>

        {/* Right sidebar */}
        <aside className="flex flex-col gap-4">
          <AppCard padding="md">
            <p className="f1-m uppercase text-muted">Resources Information</p>

            <div className="mt-4 flex flex-col divide-y divide-disabled">
              <div className="pb-3">
                <p className="f1-m uppercase text-muted">Type</p>
                <p className="b2-m mt-1 text-text">{resource.type}</p>
              </div>

              <div className="py-3">
                <p className="f1-m uppercase text-muted">Level</p>
                <p className="b2-m mt-1 text-text">{PLACEHOLDER_LEVEL}</p>
              </div>

              <div className="py-3">
                <p className="f1-m uppercase text-muted">Topic</p>
                <p className="b2-m mt-1 text-text">{resource.moduleTitle}</p>
              </div>

              <div className="pt-3">
                <p className="f1-m uppercase text-muted">Related Course</p>
                <p className="b2-b mt-1 text-primary">{resource.courseTitle}</p>
              </div>

              <div className="pt-3">
                <p className="f1-m uppercase text-muted">Related Module</p>
                <p className="b2-b mt-1 text-primary">{resource.moduleTitle}</p>
              </div>
            </div>
          </AppCard>

          <div className="rounded-card bg-slate-950 p-4 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-slate-950">
              <Sparkles size={16} />
            </span>
            <h2 className="b2-b mt-4 text-white">Stuck on this?</h2>
            <p className="b2-r mt-2 text-white/60">
              Ask KodeBuddy AI to explain {resource.title.toLowerCase()} in more
              detail.
            </p>
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="b2-m mt-4 w-full rounded-full bg-white/25 px-4 py-2.5 text-white transition hover:bg-white/35"
            >
              Chat with AI
            </button>
          </div>
        </aside>
      </div>

      {chatOpen && (
        <>
          <div
            role="presentation"
            onClick={() => setChatOpen(false)}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <aside className="fixed inset-x-4 top-4 bottom-4 z-50 lg:inset-y-6 lg:right-6 lg:left-auto lg:w-100">
            <KodeBuddyChatPanel
              context={{
                courseId: resource.courseId,
                moduleId: resource.moduleId,
                assignmentId: null,
                label: resource.title,
              }}
              initialQuestion={`Can you explain more about "${resource.title}"?`}
              onClose={() => setChatOpen(false)}
            />
          </aside>
        </>
      )}
    </div>
  );
}
