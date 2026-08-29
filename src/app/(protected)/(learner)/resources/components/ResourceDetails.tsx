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
              Resource added to your learning
            </p>

            <p className="mt-1 text-xs text-success-dark/80">
              This resource is now part of your learning journey.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        {/* Main content */}
        <div className="min-w-0">
          {/* Resource header */}
          <div className="border-b border-disabled pb-5">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase">
              <span className="text-primary">
                {resource.type}
              </span>

              <span className="text-text-secondary">
                {resource.category}
              </span>

              <span className="text-text-secondary">
                {resource.level}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-2xl font-semibold leading-tight text-text-primary">
                  {resource.title}
                </h1>

                <p className="mt-2 max-w-xl text-xs leading-5 text-text-secondary">
                  {resource.description}
                </p>
              </div>

              {/* Top actions */}
              <div className="flex shrink-0 flex-col gap-2">
                {resourceUsed ? (
                  <Link
                    href="/learn"
                    className="rounded-full bg-primary px-5 py-2.5 text-center text-[10px] font-medium text-white transition hover:opacity-90"
                  >
                    Continue Learning →
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleUseResource}
                    className="rounded-full bg-primary px-5 py-2.5 text-[10px] font-medium text-white transition hover:opacity-90"
                  >
                    Use Resource in Learning →
                  </button>
                )}

                <Link
                  href="/resources"
                  className="rounded-full border border-disabled px-5 py-2.5 text-center text-[10px] font-medium text-text-secondary transition hover:border-primary hover:text-primary"
                >
                  ← Back to Resources
                </Link>
              </div>
            </div>
          </div>

          {/* Article content */}
          <article className="pt-6">
            <h2 className="text-base font-semibold text-text-primary">
              JavaScript Functions
            </h2>

            <p className="mt-3 max-w-3xl text-xs leading-5 text-text-secondary">
              Functions are reusable blocks of code that perform a
              specific task. They help developers organize code and
              reduce repeated instructions.
            </p>

            {/* What is a function */}
            <section className="mt-6">
              <h3 className="text-sm font-semibold text-text-primary">
                What is a Function?
              </h3>

              <p className="mt-2 max-w-3xl text-xs leading-5 text-text-secondary">
                Think of a function as a &quot;recipe&quot; for a
                specific action. You define the steps once, and then
                you can &quot;call&quot; or &quot;invoke&quot; that
                function whenever you need that action performed.
                This makes your code cleaner, easier to read, and
                much simpler to maintain.
              </p>
            </section>

            {/* Why use functions */}
            <section className="mt-6">
              <h3 className="text-sm font-semibold text-text-primary">
                Why Use Functions?
              </h3>

              <ul className="mt-3 space-y-2">
                <li className="flex gap-2 text-xs leading-5 text-text-secondary">
                  <span className="text-primary">•</span>

                  <span>
                    <strong className="font-medium text-text-primary">
                      Reusability:
                    </strong>{' '}
                    Write code once, use it multiple times across
                    your application.
                  </span>
                </li>

                <li className="flex gap-2 text-xs leading-5 text-text-secondary">
                  <span className="text-primary">•</span>

                  <span>
                    <strong className="font-medium text-text-primary">
                      Organization:
                    </strong>{' '}
                    Break complex programs into smaller,
                    manageable, and logical pieces.
                  </span>
                </li>

                <li className="flex gap-2 text-xs leading-5 text-text-secondary">
                  <span className="text-primary">•</span>

                  <span>
                    <strong className="font-medium text-text-primary">
                      Maintenance:
                    </strong>{' '}
                    If you need to change a logic, you only have to
                    update it in one place.
                  </span>
                </li>
              </ul>
            </section>

            {/* Basic function structure */}
            <section className="mt-6">
              <h3 className="text-sm font-semibold text-text-primary">
                Basic Function Structure
              </h3>

              <p className="mt-2 max-w-3xl text-xs leading-5 text-text-secondary">
                A standard function declaration consists of the
                function keyword, followed by a name, parentheses
                for parameters, and curly braces for the code block.
              </p>

              {resource.code && (
                <pre className="mt-4 max-w-3xl overflow-x-auto rounded-lg bg-slate-950 px-5 py-4 text-[10px] leading-4 text-white">
                  <code>{resource.code}</code>
                </pre>
              )}
            </section>

            {/* Bottom action */}
            <div className="mt-6 flex flex-col gap-4 border-t border-disabled pt-5 sm:flex-row sm:items-center sm:justify-between">
              {resourceUsed ? (
                <>
                  <div>
                    <p className="text-xs font-medium text-text-primary">
                      Action successful!
                    </p>

                    <p className="mt-1 text-[10px] text-text-secondary">
                      This resource is now part of your learning
                      journey.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href="/resources"
                      className="rounded-full border border-disabled px-4 py-2.5 text-[10px] font-medium text-text-secondary transition hover:border-primary hover:text-primary"
                    >
                      Back to Resources
                    </Link>

                    <Link
                      href="/learn"
                      className="rounded-full bg-primary px-5 py-2.5 text-[10px] font-medium text-white transition hover:opacity-90"
                    >
                      Continue Learning →
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[10px] text-text-secondary">
                    Ready to apply this to your course?
                  </p>

                  <button
                    type="button"
                    onClick={handleUseResource}
                    className="rounded-full bg-primary px-5 py-2.5 text-[10px] font-medium text-white transition hover:opacity-90"
                  >
                    Use Resource in Learning →
                  </button>
                </>
              )}
            </div>
          </article>
        </div>

        {/* Right sidebar */}
        <aside className="flex flex-col gap-4">
          {/* Resource information */}
          <AppCard padding="md">
            <p className="text-[9px] font-medium uppercase text-text-secondary">
              Resources Information
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-[8px] uppercase text-text-secondary">
                  Type
                </p>

                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-text-primary">
                  <span className="text-primary">▤</span>
                  {resource.type}
                </p>
              </div>

              <div>
                <p className="text-[8px] uppercase text-text-secondary">
                  Level
                </p>

                <p className="mt-1 text-xs font-medium text-text-primary">
                  {resource.level}
                </p>
              </div>

              <div>
                <p className="text-[8px] uppercase text-text-secondary">
                  Topic
                </p>

                <p className="mt-1 text-xs font-medium text-text-primary">
                  {resource.category}
                </p>
              </div>

              <div className="border-t border-disabled pt-4">
                <p className="text-[8px] uppercase text-text-secondary">
                  Related Course
                </p>

                <p className="mt-1 text-xs font-medium text-primary">
                  Frontend Development
                </p>
              </div>

              <div>
                <p className="text-[8px] uppercase text-text-secondary">
                  Related Module
                </p>

                <p className="mt-1 text-xs font-medium text-primary">
                  JavaScript Fundamentals
                </p>
              </div>
            </div>
          </AppCard>

          {/* AI help card */}
          <div className="rounded-xl bg-slate-950 p-4 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-lime-400 text-xs font-bold text-slate-950">
              ✦
            </div>

            <h2 className="mt-4 text-sm font-semibold">
              Stuck on functions?
            </h2>

            <p className="mt-2 text-[10px] leading-4 text-white/60">
              Ask KodeBuddy AI to explain function scope or arrow
              functions in more detail.
            </p>

            <button
              type="button"
              className="mt-4 w-full rounded-full bg-white/25 px-4 py-2 text-[10px] font-medium text-white transition hover:bg-white/35"
            >
              Chat with AI
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}