'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/ui/AppPageHeader';
import TableHeader from '@/components/ui/AppTableHeader';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import AddCourseView from './AddCourseView';
import CourseDetailsView, { type CourseOverview } from './CourseDetailView';
import { useToast } from '@/components/ui/ToastProvider';
import noCourses from '@/assets/images/no-courses.webp';

interface CourseRow {
  id: string;
  title: string;
  status: 'published' | 'draft';
}

const STATUS_OPTIONS = [
  { label: 'All Status', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
];

// TODO: replace with real API data once endpoints are ready.
const courses: CourseRow[] = [];

const CoursesAndContentsView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const { showSuccess } = useToast();
  const [view, setView] = useState<'list' | 'add' | 'details'>('list');
  const [selectedCourse, setSelectedCourse] = useState<CourseOverview | null>(
    null,
  );

  const hasCourses = courses.length > 0;

  if (view === 'add') {
    return (
      <AddCourseView
        onBack={() => setView('list')}
        onSaveDraft={(title) => {
          // TODO: replace with the real create-course API response.
          const createdCourse: CourseOverview = {
            title,
            status: 'draft',
            modules: 0,
            lessons: 0,
            lastUpdated: new Date().toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }),
            createdBy: 'Admin user',
          };
          setSelectedCourse(createdCourse);
          setView('details');
          showSuccess(
            'Course saved as draft successfully.',
            `"${title}" is ready to build on.`,
          );
        }}
      />
    );
  }

  if (view === 'details' && selectedCourse) {
    return (
      <CourseDetailsView
        course={selectedCourse}
        onBack={() => setView('list')}
        onEditCourse={() => setView('add')}
        onAddDescription={() => {
          // TODO: open description editor / modal
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Courses & Contents"
        subtitle="Create and manage courses published on the platform."
        actions={
          <AppButton
            startIcon={<Plus size={18} />}
            radius="full"
            onClick={() => setView('add')}
          >
            Add courses
          </AppButton>
        }
      />

      <AppCard padding="none">
        <div className="p-4">
          <TableHeader
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by courses"
            filters={[
              {
                id: 'status',
                value: status,
                options: STATUS_OPTIONS,
                onChange: setStatus,
                ariaLabel: 'Filter by status',
              },
            ]}
          />
        </div>

        {hasCourses ? (
          <ul>{/* TODO: course rows go here once data is wired up */}</ul>
        ) : (
        
          <AppEmptyState
            image={noCourses}
            title="No courses yet"
            description="Create your first course to start building content for Kodebuddy."
          />
        )}
      </AppCard>
    </div>
  );
};

export default CoursesAndContentsView;
