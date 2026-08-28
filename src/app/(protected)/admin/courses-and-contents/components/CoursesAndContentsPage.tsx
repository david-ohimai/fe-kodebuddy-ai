'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import PageHeader from '@/components/ui/AppPageHeader';
import TableHeader from '@/components/ui/AppTableHeader';
import AppTable, { type AppTableColumn } from '@/components/ui/AppTable';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppButton from '@/components/ui/AppButton';
import AppPill from '@/components/ui/AppPill';
import AppSpinner from '@/components/ui/AppSpinner';
import { AppCard } from '@/components/ui/AppCard';
import AddCourseView from './AddCourseView';
import CourseDetailsView from './CourseDetailView';
import { useToast } from '@/components/ui/ToastProvider';
import * as coursesApi from '@/lib/api/courses.api';
import * as cohortsApi from '@/lib/api/cohorts.api';
import { getErrorMessage } from '@/lib/api/client';
import noCourses from '@/assets/images/no-courses.webp';
import type { Course } from '@/lib/api/courses.api';
import type { Cohort } from '@/lib/api/cohorts.api';

const STATUS_OPTIONS = [
  { label: 'All Status', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const CoursesAndContentsView: React.FC = () => {
  const { showError } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const [view, setView] = useState<'list' | 'add' | 'edit' | 'details'>('list');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const loadCourses = () => {
    setLoading(true);
    Promise.all([coursesApi.listCourses(), cohortsApi.listCohorts()])
      .then(([courseList, cohortList]) => {
        setCourses(courseList);
        setCohorts(cohortList);
      })
      .catch((err) => {
        showError(
          'Could not load courses',
          getErrorMessage(err, 'Please try again.'),
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const cohortNameById = useMemo(
    () => new Map(cohorts.map((c) => [c.id, c.name])),
    [cohorts],
  );

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return courses.filter((c) => {
      const matchesSearch = !query || c.title.toLowerCase().includes(query);
      const matchesStatus =
        status === 'all' || (status === 'published' ? c.isActive : !c.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [courses, search, status]);

  const hasCourses = filteredCourses.length > 0;

  const openDetails = (course: Course) => {
    setSelectedCourse(course);
    setView('details');
  };

  if (view === 'add') {
    return (
      <AddCourseView
        onBack={() => setView('list')}
        onSaved={(course) => {
          setCourses((prev) => [course, ...prev]);
          openDetails(course);
        }}
      />
    );
  }

  if (view === 'edit' && selectedCourse) {
    return (
      <AddCourseView
        editCourse={selectedCourse}
        onBack={() => setView('details')}
        onSaved={(course) => {
          setCourses((prev) =>
            prev.map((c) => (c.id === course.id ? course : c)),
          );
          setSelectedCourse(course);
          setView('details');
        }}
      />
    );
  }

  if (view === 'details' && selectedCourse) {
    return (
      <CourseDetailsView
        course={selectedCourse}
        cohortName={cohortNameById.get(selectedCourse.cohortId) ?? 'Cohort'}
        onBack={() => {
          setView('list');
          loadCourses();
        }}
        onEditCourse={() => setView('edit')}
        onCourseChanged={(updated) => {
          setSelectedCourse(updated);
          setCourses((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c)),
          );
        }}
      />
    );
  }

  const columns: AppTableColumn<Course>[] = [
    {
      key: 'title',
      header: 'Course',
      render: (c) => <span className="b2-m text-text">{c.title}</span>,
    },
    {
      key: 'cohort',
      header: 'Cohort',
      render: (c) => (
        <span className="b2-r text-text-secondary">
          {cohortNameById.get(c.cohortId) ?? '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => (
        <AppPill
          label={c.isActive ? 'Published' : 'Draft'}
          color={c.isActive ? 'success' : 'default'}
        />
      ),
    },
    {
      key: 'created',
      header: 'Created',
      render: (c) => (
        <span className="b2-r text-text-secondary">
          {formatDate(c.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (c) => (
        <AppButton
          variant="text"
          color="neutral"
          size="icon"
          ariaLabel={`View ${c.title}`}
          className="!h-8 !w-8 !text-muted hover:!bg-primary-light hover:!text-primary"
          onClick={() => openDetails(c)}
        >
          <ChevronRight size={18} />
        </AppButton>
      ),
    },
  ];

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

        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <AppSpinner size={40} />
          </div>
        ) : hasCourses ? (
          <AppTable
            columns={columns}
            data={filteredCourses}
            getRowKey={(c) => c.id}
            minWidth={720}
          />
        ) : (
          <AppEmptyState
            image={noCourses}
            title={
              courses.length === 0 ? 'No courses yet' : 'No matching courses'
            }
            description={
              courses.length === 0
                ? 'Create your first course to start building content for Kodebuddy.'
                : 'Try adjusting your search or filters.'
            }
          />
        )}
      </AppCard>
    </div>
  );
};

export default CoursesAndContentsView;
