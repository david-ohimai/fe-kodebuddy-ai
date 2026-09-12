'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  FileText,
  Folder,
  Link2,
  Play,
  Sparkles,
} from 'lucide-react';

import AppButton from '@/components/ui/AppButton';
import AppSpinner from '@/components/ui/AppSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import KodeBuddyChatPanel from '@/components/chat/KodeBuddyChatPanel';
import { getLearnerResource } from '@/lib/api/resources.api';
import { getErrorMessage } from '@/lib/api/client';
import type { LearnerResource } from '@/types/resource.types';

const PLACEHOLDER_LEVEL = 'BEGINNER';

interface ResourceDetailsProps {
  resourceId: number;
}

function renderFormattedContent(content: string) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const raw = part.slice(3, -3);
      const lines = raw.split('\n');
      const firstLine = lines[0]?.trim() || '';
      const isLang =
        firstLine &&
        !firstLine.includes(' ') &&
        !firstLine.includes('(') &&
        !firstLine.includes('{') &&
        !firstLine.includes(';') &&
        firstLine.length < 15;
      const code = (isLang ? lines.slice(1) : lines).join('\n').trim();

      return (
        <div
          key={index}
          className="my-5 overflow-hidden rounded-xl bg-[#0B1528] p-5 shadow-sm"
        >
          <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-slate-200 sm:text-sm">
            <code>
              {code.split('\n').map((line, lIdx) => {
                const trimmed = line.trim();
                const isComment =
                  trimmed.startsWith('//') || trimmed.startsWith('/*');

                if (isComment) {
                  return (
                    <span key={lIdx} className="block text-slate-500">
                      {line}
                    </span>
                  );
                }

                return (
                  <span key={lIdx} className="block">
                    {line}
                  </span>
                );
              })}
            </code>
          </pre>
        </div>
      );
    }

    const paragraphs = part
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean);

    return (
      <div key={index} className="flex flex-col gap-4">
        {paragraphs.map((p, pIdx) => {
          const lines = p.split('\n');
          const isHeading =
            p.startsWith('# ') ||
            p.startsWith('## ') ||
            p.startsWith('### ') ||
            (lines.length === 1 &&
              p.length < 60 &&
              !p.endsWith('.') &&
              !p.startsWith('-') &&
              !p.startsWith('•'));

          if (isHeading) {
            const headingText = p.replace(/^#+\s*/, '');
            return (
              <h3
                key={pIdx}
                className="mt-3 text-lg font-bold text-text sm:text-xl"
              >
                {headingText}
              </h3>
            );
          }

          const isBulletList = lines.every(
            (l) =>
              l.trim().startsWith('- ') ||
              l.trim().startsWith('• ') ||
              l.trim().startsWith('* '),
          );

          if (isBulletList) {
            return (
              <ul key={pIdx} className="flex flex-col gap-2 pl-1">
                {lines.map((item, iIdx) => {
                  const itemText = item.replace(/^[-•*]\s*/, '').trim();
                  return (
                    <li
                      key={iIdx}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-text-secondary"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{itemText}</span>
                    </li>
                  );
                })}
              </ul>
            );
          }

          return (
            <p
              key={pIdx}
              className="text-sm leading-relaxed text-text-secondary sm:text-base"
            >
              {p}
            </p>
          );
        })}
      </div>
    );
  });
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
          <ArrowLeft size={16} /> Back to Resources
        </Link>
        <div className="rounded-2xl border border-disabled bg-background p-8 text-center shadow-sm">
          <p className="b1-b text-text">Resource not found</p>
          <p className="b2-r mt-1 text-muted">
            This resource may have been removed, or the link is incorrect.
          </p>
        </div>
      </div>
    );
  }

  const topicName = resource.moduleTitle.includes(' ')
    ? resource.moduleTitle.split(' ')[0]
    : resource.moduleTitle;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner Alert when resource is used */}
      {resourceUsed && (
        <div className="flex items-center gap-3.5 rounded-2xl border border-[#D4F4C1] bg-[#F1FCEF] px-5 py-4 shadow-xs">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#65C426] text-white shadow-xs">
            <Check size={16} strokeWidth={3} />
          </div>
          <div>
            <p className="b2-b text-[#1E293B]">
              Resource added to your learning
            </p>
            <p className="f1-r text-[#475569]">
              This resource is available to support your learning in{' '}
              {resource.moduleTitle}.
            </p>
          </div>
        </div>
      )}

      {/* Header section matching Figma */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#FFF8EC] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-[#E08A00]">
              {resource.type}
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-muted">
              {resource.courseTitle} · {PLACEHOLDER_LEVEL}
            </span>
          </div>

          <h1 className="mt-2.5 text-2xl font-bold tracking-tight text-text sm:text-3xl">
            {resource.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary sm:text-base">
            {resource.description ||
              'A fundamental guide to understanding how to write reusable code and apply it to your projects.'}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2.5 sm:w-56">
          {resourceUsed ? (
            <AppButton
              href="/learn"
              radius="full"
              endIcon={<ArrowRight size={15} />}
              className="w-full justify-center text-sm font-semibold"
            >
              Continue Learning
            </AppButton>
          ) : (
            <AppButton
              radius="full"
              endIcon={<Play size={13} className="ml-1 fill-current" />}
              className="w-full justify-center text-sm font-semibold"
              onClick={() => setResourceUsed(true)}
            >
              Use Resource in Learning
            </AppButton>
          )}

          <AppButton
            href="/resources"
            variant="outlined"
            color="neutral"
            radius="full"
            startIcon={
              resourceUsed ? <Folder size={14} /> : <ArrowLeft size={14} />
            }
            className="w-full justify-center text-sm font-medium"
          >
            Back to Resources
          </AppButton>
        </div>
      </div>

      {/* Full-width Divider */}
      <hr className="border-t border-disabled" />

      {/* Main Content & Sidebar Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Left Column: Resource Article / Content */}
        <div className="min-w-0">
          {resource.url && (
            <div className="mb-6">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/15"
              >
                <ExternalLink size={15} />
                Open external resource
              </a>
            </div>
          )}

          <article className="flex flex-col gap-4">
            {resource.content ? (
              renderFormattedContent(resource.content)
            ) : resource.description ? (
              renderFormattedContent(resource.description)
            ) : (
              <p className="text-sm text-muted">
                No further details have been added to this resource yet.
              </p>
            )}
          </article>

          {/* Bottom Action Section */}
          <hr className="my-8 border-t border-disabled" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {resourceUsed ? (
              <>
                <div>
                  <p className="b1-b text-text">Action successful!</p>
                  <p className="f1-r mt-0.5 text-muted">
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
                  <AppButton
                    href="/learn"
                    radius="full"
                    endIcon={<ArrowRight size={15} />}
                  >
                    Continue Learning
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
                  endIcon={<ArrowRight size={15} />}
                  onClick={() => setResourceUsed(true)}
                >
                  Use Resource in Learning
                </AppButton>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <aside className="flex flex-col gap-6">
          {/* Resources Information Card */}
          <div className="rounded-2xl border border-disabled bg-background p-5 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Resources Information
            </p>

            <div className="mt-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Type
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-text">
                <span className="text-[#E08A00]">
                  {resource.type === 'Link' ? (
                    <Link2 size={16} />
                  ) : (
                    <FileText size={16} />
                  )}
                </span>
                <span>{resource.type}</span>
              </div>
            </div>

            <div className="mt-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Level
              </p>
              <p className="mt-0.5 text-sm font-semibold text-text">Beginner</p>
            </div>

            <div className="mt-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Topic
              </p>
              <p className="mt-0.5 text-sm font-semibold text-text">
                {topicName}
              </p>
            </div>

            <hr className="my-4 border-t border-disabled" />

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Related Course
              </p>
              <Link
                href={`/learn/courses/${resource.courseId}`}
                className="mt-0.5 block text-sm font-semibold text-primary hover:underline"
              >
                {resource.courseTitle}
              </Link>
            </div>

            <div className="mt-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Related Module
              </p>
              <Link
                href={`/learn/modules/${resource.moduleId}`}
                className="mt-0.5 block text-sm font-semibold text-primary hover:underline"
              >
                {resource.moduleTitle}
              </Link>
            </div>
          </div>

          {/* KodeBuddy AI Assistance Card */}
          <div className="rounded-2xl bg-[#09101D] p-5 text-white shadow-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#73DE1C] text-[#09101D]">
              <Sparkles size={18} className="fill-current text-[#09101D]" />
            </div>
            <h3 className="mt-3 text-base font-bold text-white">
              Stuck on {topicName.toLowerCase()}?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Ask KodeBuddy AI to explain {topicName.toLowerCase()} in more
              detail.
            </p>
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="mt-4 w-full rounded-full bg-slate-800 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-700"
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
