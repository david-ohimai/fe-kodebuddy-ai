'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  ClipboardList,
  FileText,
  HelpCircle,
  Library,
  Target,
} from 'lucide-react';
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
import { useCourseAssignments } from '@/lib/trainer/useCourseAssignments';
import { useCourseFaqs } from '@/lib/trainer/useCourseFaqs';
import { useCourseResources } from '@/lib/trainer/useCourseResources';
import { getErrorMessage } from '@/lib/api/client';
import AssignedCourseCard from '../../components/AssignedCourseCard';
import OverviewTab from './OverviewTab';
import ModulesTab from './ModulesTab';
import LearningContentList from './LearningContentList';
import LearningContentDetail from './LearningContentDetail';
import LearningContentModal from './LearningContentModal';
import AssignmentsTab from './AssignmentsTab';
import FaqsTab from './FaqsTab';
import FaqDetailView from './FaqDetailView';
import ResourcesTab from './ResourcesTab';
import ResourceDetailView from './ResourceDetailView';
import noCourses from '@/assets/images/no-courses.webp';
import noModules from '@/assets/images/no-modules.webp';
import type { CourseModule } from '@/lib/api/modules.api';
import type { Lesson } from '@/lib/api/lessons.api';
import type { Faq } from '@/lib/api/faqs.api';
import type { CourseResource } from '@/lib/api/resources.api';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <Target /> },
  { id: 'modules', label: 'Modules', icon: <BookOpen /> },
  { id: 'learning-content', label: 'Learning content', icon: <FileText /> },
  { id: 'assignments', label: 'Assignments', icon: <ClipboardList /> },
  { id: 'faqs', label: 'FAQs', icon: <HelpCircle /> },
  { id: 'resources', label: 'Resources', icon: <Library /> },
];

export default function MyCoursePage() {
  const { user } = useCurrentUserContext();
  const { showError } = useToast();
  const {
    data,
    cohortWithoutCourse,
    loading: loadingCourse,
  } = useMyAssignedCourse(user?.id);
  const content = useCourseContent(data?.course.id);
  const assignmentsState = useCourseAssignments(
    content.modules,
    data?.cohort.endDate,
  );
  const faqsState = useCourseFaqs(content.modules);
  const resourcesState = useCourseResources(content.modules);

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [selectedFaqId, setSelectedFaqId] = useState<number | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(
    null,
  );

  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

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
  const selectedFaq: Faq | null =
    faqsState.faqs.find((f) => f.id === selectedFaqId) ?? null;
  const selectedResource: CourseResource | null =
    resourcesState.resources.find((r) => r.id === selectedResourceId) ?? null;

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
            title={
              cohortWithoutCourse
                ? `${cohortWithoutCourse.name} doesn't have a course yet`
                : 'No course assigned yet'
            }
            description={
              cohortWithoutCourse
                ? "You're assigned to this cohort, but an admin hasn't added its course yet. Check back soon."
                : "Once an admin assigns you a course, it'll show up here."
            }
          />
        </AppCard>
      </div>
    );
  }

  const totalLessons = Object.values(content.lessonsByModule).reduce(
    (sum, list) => sum + list.length,
    0,
  );

  const isBreakout =
    activeTab === 'assignments' ||
    (activeTab === 'learning-content' && !!selectedModule) ||
    (activeTab === 'faqs' && !!selectedFaq) ||
    (activeTab === 'resources' && !!selectedResource);

  if (isBreakout) {
    return (
      <div className="flex flex-col gap-4">
        {activeTab === 'assignments' && (
          <AssignmentsTab
            courseName={data.course.title}
            cohortName={data.cohort.name}
            assignments={assignmentsState.assignments}
            loading={assignmentsState.loading}
            saving={assignmentsState.saving}
            hasModules={assignmentsState.hasModules}
            addAssignment={assignmentsState.addAssignment}
            editAssignment={assignmentsState.editAssignment}
            deleteAssignment={assignmentsState.deleteAssignment}
            onBack={() => setActiveTab('overview')}
          />
        )}

        {activeTab === 'learning-content' &&
          selectedModule &&
          (selectedLesson ? (
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
              onBack={() => {
                setSelectedModuleId(null);
                setActiveTab('modules');
              }}
              onSelectLesson={(lesson) => setSelectedLessonId(lesson.id)}
              onAddContent={() => setIsAddContentOpen(true)}
              onEditModule={() => setEditingModule(selectedModule)}
              onMoveLesson={(lesson, direction) =>
                content.moveLesson(selectedModule.id, lesson.id, direction)
              }
            />
          ))}

        {activeTab === 'faqs' && selectedFaq && (
          <FaqDetailView
            courseName={data.course.title}
            cohortName={data.cohort.name}
            faq={selectedFaq}
            saving={faqsState.saving}
            editFaq={faqsState.editFaq}
            deleteFaq={faqsState.deleteFaq}
            onBack={() => setSelectedFaqId(null)}
          />
        )}

        {activeTab === 'resources' && selectedResource && (
          <ResourceDetailView
            courseName={data.course.title}
            cohortName={data.cohort.name}
            resource={selectedResource}
            saving={resourcesState.saving}
            editResource={resourcesState.editResource}
            deleteResource={resourcesState.deleteResource}
            onBack={() => setSelectedResourceId(null)}
          />
        )}

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
            assignmentCount={assignmentsState.assignments.length}
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
            onMoveModule={(module, direction) =>
              content.moveModule(module.id, direction)
            }
          />
        )}

        {activeTab === 'learning-content' && !selectedModule && (
          <AppEmptyState
            image={noModules}
            title="No module selected"
            description="Select a module from the Modules tab to view its learning content."
          />
        )}

        {activeTab === 'faqs' && (
          <FaqsTab
            faqs={faqsState.faqs}
            loading={faqsState.loading}
            saving={faqsState.saving}
            hasModules={faqsState.hasModules}
            addFaq={faqsState.addFaq}
            onSelectFaq={(faq) => setSelectedFaqId(faq.id)}
          />
        )}

        {activeTab === 'resources' && (
          <ResourcesTab
            resources={resourcesState.resources}
            loading={resourcesState.loading}
            saving={resourcesState.saving}
            hasModules={resourcesState.hasModules}
            addResource={resourcesState.addResource}
            onSelectResource={(resource) => setSelectedResourceId(resource.id)}
          />
        )}
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
    </div>
  );
}
