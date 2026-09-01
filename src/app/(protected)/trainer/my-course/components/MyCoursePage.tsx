'use client';

import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/AppPageHeader';
import { AppCard } from '@/components/ui/AppCard';
import AppTab from '@/components/ui/AppTab';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import AddModuleModal from '@/components/course/AddModuleModal';
import { useToast } from '@/components/ui/ToastProvider';
import { useCurrentUserContext } from '@/lib/auth/CurrentUserContext';
import { useMyAssignedCourse } from '@/lib/trainer/useMyAssignedCourse';
import { useCourseContent } from '@/lib/courses/useCourseContent';
import { getErrorMessage } from '@/lib/api/client';
import * as assignmentsApi from '@/lib/api/assignments.api';
import AssignedCourseCard from '../../components/AssignedCourseCard';
import OverviewTab from './OverviewTab';
import ModulesTab from './ModulesTab';
import LearningContentList from './LearningContentList';
import LearningContentDetail from './LearningContentDetail';
import LearningContentModal from './LearningContentModal';
import noCourses from '@/assets/images/no-courses.webp';
import noModules from '@/assets/images/no-modules.webp';
import type { CourseModule } from '@/lib/api/modules.api';
import type { Lesson } from '@/lib/api/lessons.api';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'modules', label: 'Modules' },
  { id: 'learning-content', label: 'Learning content' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'resources', label: 'Resources' },
];

function ComingSoonTab({ label }: { label: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-1 p-6 text-center">
      <p className="b2-b text-text">{label}</p>
      <p className="f1-r text-muted">This section is coming soon.</p>
    </div>
  );
}

export default function MyCoursePage() {
  const { user } = useCurrentUserContext();
  const { showError } = useToast();
  const { data, loading: loadingCourse } = useMyAssignedCourse(user?.id);
  const content = useCourseContent(data?.course.id ?? 0);

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  const [assignmentCount, setAssignmentCount] = useState(0);

  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (content.modules.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAssignmentCount(0);
      return;
    }
    let cancelled = false;
    Promise.all(
      content.modules.map((m) =>
        assignmentsApi.listModuleAssignments(m.id).catch(() => []),
      ),
    ).then((lists) => {
      if (!cancelled) {
        setAssignmentCount(lists.reduce((sum, l) => sum + l.length, 0));
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.modules.map((m) => m.id).join(',')]);

  const selectedModule =
    content.modules.find((m) => m.id === selectedModuleId) ?? null;
  const selectedModuleIndex = content.modules.findIndex(
    (m) => m.id === selectedModuleId,
  );
  const selectedLesson =
    selectedModuleId != null
      ? ((content.lessonsByModule[selectedModuleId] ?? []).find(
          (l) => l.id === selectedLessonId,
        ) ?? null)
      : null;

  const handleSelectTab = (tab: string) => {
    if (tab === 'learning-content' && !selectedModuleId) {
      if (content.modules[0]) setSelectedModuleId(content.modules[0].id);
    }
    setSelectedLessonId(null);
    setActiveTab(tab);
  };

  const handleSelectModule = (module: CourseModule) => {
    setSelectedModuleId(module.id);
    setSelectedLessonId(null);
    setActiveTab('learning-content');
  };

  if (loadingCourse) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <AppSpinner size={40} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader
          title="My Course"
          subtitle="Manage the content of your assigned course."
        />
        <AppCard padding="lg">
          <AppEmptyState
            image={noCourses}
            title="No course assigned yet"
            description="Once an admin assigns you a course, it'll show up here."
          />
        </AppCard>
      </div>
    );
  }

  const totalLessons = Object.values(content.lessonsByModule).reduce(
    (sum, list) => sum + list.length,
    0,
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="My Course"
        subtitle="Manage the content of your assigned course."
      />

      <AssignedCourseCard
        course={data.course}
        cohortName={data.cohort.name}
        learnerCount={data.learnerCount}
        trainerName={user?.fullName || user?.email}
      />

      <AppCard padding="none">
        <AppTab
          tabs={TABS}
          activeTab={activeTab}
          onChange={handleSelectTab}
          className="px-4 pt-2"
        />

        {activeTab === 'overview' && (
          <OverviewTab
            moduleCount={content.modules.length}
            learningContentCount={totalLessons}
            assignmentCount={assignmentCount}
            learnerCount={data.learnerCount}
            completionPercent={data.completionPercent}
          />
        )}

        {activeTab === 'modules' && (
          <ModulesTab
            modules={content.modules}
            lessonsByModule={content.lessonsByModule}
            loading={content.loading}
            onAddModule={() => setIsAddModuleOpen(true)}
            onSelectModule={handleSelectModule}
          />
        )}

        {activeTab === 'learning-content' &&
          (!selectedModule ? (
            <AppEmptyState
              image={noModules}
              title="No module selected"
              description="Select a module from the Modules tab to view its learning content."
            />
          ) : selectedLesson ? (
            <LearningContentDetail
              module={selectedModule}
              moduleIndex={selectedModuleIndex}
              lesson={selectedLesson}
              onBack={() => setSelectedLessonId(null)}
              onEditContent={() => setEditingLesson(selectedLesson)}
            />
          ) : (
            <LearningContentList
              courseName={data.course.title}
              module={selectedModule}
              moduleIndex={selectedModuleIndex}
              lessons={content.lessonsByModule[selectedModule.id] ?? []}
              loading={content.loading}
              onBack={() => setActiveTab('modules')}
              onSelectLesson={(lesson) => setSelectedLessonId(lesson.id)}
              onAddContent={() => setIsAddContentOpen(true)}
              onEditModule={() => setEditingModule(selectedModule)}
            />
          ))}

        {activeTab === 'assignments' && <ComingSoonTab label="Assignments" />}
        {activeTab === 'faqs' && <ComingSoonTab label="FAQs" />}
        {activeTab === 'resources' && <ComingSoonTab label="Resources" />}
      </AppCard>

      <AddModuleModal
        open={isAddModuleOpen}
        onClose={() => setIsAddModuleOpen(false)}
        onSubmit={async (formData) => {
          try {
            await content.addModule(formData);
            setIsAddModuleOpen(false);
          } catch (err) {
            showError(
              'Could not add module',
              getErrorMessage(err, 'Please try again.'),
            );
          }
        }}
      />

      <AddModuleModal
        key={editingModule?.id ?? 'edit-module-modal'}
        open={!!editingModule}
        initialTitle={editingModule?.title}
        initialDescription={editingModule?.description ?? undefined}
        submitLabel="Save changes"
        onClose={() => setEditingModule(null)}
        onSubmit={async (formData) => {
          if (!editingModule) return;
          try {
            await content.editModule(editingModule.id, formData, {
              title: 'Module updated successfully.',
              message: `"${formData.title}" has been saved.`,
            });
            setEditingModule(null);
          } catch (err) {
            showError(
              'Could not update module',
              getErrorMessage(err, 'Please try again.'),
            );
          }
        }}
      />

      {selectedModule && (
        <LearningContentModal
          open={isAddContentOpen}
          courseName={data.course.title}
          moduleName={selectedModule.title}
          saving={content.saving}
          onClose={() => setIsAddContentOpen(false)}
          onSubmit={async (formData) => {
            try {
              await content.addLesson(
                selectedModule.id,
                {
                  title: formData.title,
                  description: formData.content,
                },
                {
                  title: 'Learning content added successfully.',
                  message: `"${formData.title}" was added to this module.`,
                },
              );
              setIsAddContentOpen(false);
            } catch (err) {
              showError(
                'Could not add learning content',
                getErrorMessage(err, 'Please try again.'),
              );
            }
          }}
        />
      )}

      {selectedModule && editingLesson && (
        <LearningContentModal
          key={editingLesson.id}
          open={!!editingLesson}
          courseName={data.course.title}
          moduleName={selectedModule.title}
          initial={{
            id: editingLesson.id,
            title: editingLesson.title,
            content: editingLesson.contentBody ?? '',
          }}
          onClose={() => setEditingLesson(null)}
          onSubmit={async (formData) => {
            try {
              await content.editLesson(
                selectedModule.id,
                editingLesson.id,
                {
                  title: formData.title,
                  description: formData.content,
                },
                {
                  title: 'Learning content updated successfully.',
                  message: `"${formData.title}" has been saved.`,
                },
              );
              setEditingLesson(null);
            } catch (err) {
              showError(
                'Could not update learning content',
                getErrorMessage(err, 'Please try again.'),
              );
            }
          }}
        />
      )}
    </div>
  );
}
