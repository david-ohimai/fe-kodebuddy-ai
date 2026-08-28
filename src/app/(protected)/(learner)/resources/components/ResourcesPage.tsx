'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import Image from 'next/image';

import PageHeader from '@/components/ui/AppPageHeader';
import emptyStateImage from '@/assets/images/empty state res.webp';

type ResourceTab =
  | 'all'
  | 'video'
  | 'articles'
  | 'documents'
  | 'interactive';

export default function ResourcesPage() {
  const [activeTab, setActiveTab] =
    useState<ResourceTab>('all');

  const [search, setSearch] = useState('');

  // Backend will be connected later.
  const resources: unknown[] = [];

  const tabs: {
    label: string;
    value: ResourceTab;
  }[] = [
    {
      label: 'All Resources',
      value: 'all',
    },
    {
      label: 'Video',
      value: 'video',
    },
    {
      label: 'Articles',
      value: 'articles',
    },
    {
      label: 'Documents',
      value: 'documents',
    },
    {
      label: 'Interactive',
      value: 'interactive',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <PageHeader
        title="Resources"
        subtitle="Extra material to support your learning."
      />

      {/* Search + tabs + content */}
      <div className="rounded-xl bg-white">
        {/* Search */}
        <div className="px-4 pt-4">
          <div className="relative max-w-[390px]">
            <Search
              size={16}
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-muted
              "
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Non-existent resource name"
              className="
                h-[34px]
                w-full
                rounded-lg
                border
                border-primary
                bg-white
                pl-9
                pr-3
                text-xs
                text-text
                outline-none
                placeholder:text-muted
                focus:ring-2
                focus:ring-primary/10
              "
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-3 px-4">
          <div className="flex items-center gap-6">
            {tabs.map((tab) => {
              const isActive =
                activeTab === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.value)
                  }
                  className={`
                    relative
                    py-3
                    text-xs
                    font-medium
                    transition-colors
                    ${
                      isActive
                        ? 'text-primary'
                        : 'text-muted hover:text-text'
                    }
                  `}
                >
                  {tab.label}

                  {isActive && (
                    <span
                      className="
                        absolute
                        bottom-0
                        left-0
                        right-0
                        h-[2px]
                        rounded-full
                        bg-primary
                      "
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resources content */}
        {resources.length === 0 ? (
          <div
            className="
              flex
              min-h-[420px]
              flex-col
              items-center
              justify-center
              px-6
              py-14
              text-center
            "
          >
            {/* Empty state illustration */}
            <Image
              src={emptyStateImage}
              alt=""
              width={120}
              height={90}
              className="mb-4 object-contain"
            />

            {/* Title */}
            <h2
              className="
                text-base
                font-semibold
                text-text
              "
            >
              No resources available yet
            </h2>

            {/* Description */}
            <p
              className="
                mt-2
                max-w-sm
                text-xs
                leading-5
                text-muted
              "
            >
              There are no learning resources
              available right now.
              <br />
              Resources will appear here when
              they are added.
            </p>

            {/* Back to dashboard */}
            <Link
              href="/dashboard"
              className="
                mt-6
                inline-flex
                items-center
                justify-center
                rounded-full
                bg-primary
                px-6
                py-2.5
                text-xs
                font-medium
                text-white
                transition-colors
                hover:bg-primary-dark
              "
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div>
            {/* Real resource cards will be added
                when the backend is ready. */}
          </div>
        )}
      </div>
    </div>
  );
}
