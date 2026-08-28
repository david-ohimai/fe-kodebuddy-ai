'use client';

import { useState } from 'react';
import Link from 'next/link';

import PageHeader from '@/components/ui/AppPageHeader';
import { AppCard } from '@/components/ui/AppCard';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  author: string;
  level: string;
  content: string;
  code?: string;
}

interface ResourceDetailsProps {
  resource: Resource;
}

export default function ResourceDetails({
  resource,
}: ResourceDetailsProps) {
  const [resourceUsed, setResourceUsed] = useState(false);

  const handleUseResource = () => {
    setResourceUsed(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Resource Details"
        subtitle="Explore this resource and continue your learning."
      />

      {/* Success message */}
      {resourceUsed && (
        <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success-light px-4 py-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success text-sm text-white">
            ✓
          </div>

          <div>
            <p className="text-sm font-semibold text-success-dark">
              Resource added successfully
            </p>

            <p className="mt-1 text-xs text-success-dark/80">
              This resource has been added to your learning journey.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* Main resource content */}
        <AppCard padding="lg">
          <div>
            {/* Resource type */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                {resource.type}
              </span>

              <span className="text-xs text-text-secondary">
                {resource.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-5 text-2xl font-semibold leading-tight text-text-primary">
              {resource.title}
            </h1>

            {/* Description */}
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              {resource.description}
            </p>

            <div className="my-7 border-t border-disabled" />

            {/* Content */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary">
                About this resource
              </h2>

              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {resource.content}
              </p>
            </section>

            {/* What you will learn */}
            <section className="mt-7">
              <h2 className="text-base font-semibold text-text-primary">
                What you will learn
              </h2>

              <ul className="mt-3 space-y-3">
                <li className="flex gap-3 text-sm text-text-secondary">
                  <span className="mt-1 text-primary">•</span>
                  Understand the core concepts covered in this resource.
                </li>

                <li className="flex gap-3 text-sm text-text-secondary">
                  <span className="mt-1 text-primary">•</span>
                  Apply the concepts to your own projects.
                </li>

                <li className="flex gap-3 text-sm text-text-secondary">
                  <span className="mt-1 text-primary">•</span>
                  Build a stronger understanding of the topic.
                </li>
              </ul>
            </section>

            {/* Code example */}
            {resource.code && (
              <section className="mt-7">
                <h2 className="text-base font-semibold text-text-primary">
                  Example
                </h2>

                <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-5 text-sm leading-6 text-white">
                  <code>{resource.code}</code>
                </pre>
              </section>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 border-t border-disabled pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/resources"
                className="text-center text-sm font-medium text-text-secondary transition hover:text-primary"
              >
                ← Back to Resources
              </Link>

              <button
                type="button"
                onClick={handleUseResource}
                disabled={resourceUsed}
                className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-default"
              >
                {resourceUsed
                  ? 'Resource Added ✓'
                  : 'Use Resource in Learning →'}
              </button>
            </div>
          </div>
        </AppCard>

        {/* Resource information */}
        <div className="flex flex-col gap-5">
          <AppCard padding="md">
            <h2 className="text-sm font-semibold text-text-primary">
              Resource Information
            </h2>

            <div className="mt-4 divide-y divide-disabled">
              <InfoRow
                label="Type"
                value={resource.type}
              />

              <InfoRow
                label="Level"
                value={resource.level}
              />

              <InfoRow
                label="Topic"
                value={resource.category}
              />

              <InfoRow
                label="Author"
                value={resource.author}
              />
            </div>
          </AppCard>

          {/* Learning journey card */}
          <AppCard
            padding="md"
            className="bg-primary text-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              ✓
            </div>

            <h2 className="mt-4 text-sm font-semibold">
              {resourceUsed
                ? 'Resource added'
                : 'Add to your learning'}
            </h2>

            <p className="mt-2 text-xs leading-5 text-white/75">
              {resourceUsed
                ? 'This resource is now part of your learning journey.'
                : 'Use this resource to support your current learning progress.'}
            </p>

            {resourceUsed && (
              <Link
                href="/learn"
                className="mt-4 flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-primary transition hover:opacity-90"
              >
                Continue Learning →
              </Link>
            )}
          </AppCard>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-xs text-text-secondary">
        {label}
      </span>

      <span className="text-right text-xs font-medium text-text-primary">
        {value}
      </span>
    </div>
  );
}
