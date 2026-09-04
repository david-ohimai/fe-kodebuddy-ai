'use client';

import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AppConfirmModal from '@/components/ui/AppConfirmModal';
import AddModuleModal from '@/components/course/AddModuleModal';
import LessonModal, { type LessonToEdit } from './LessonModal';
import DescriptionModal from './DescriptionModal';
import CourseHeaderCard from './CourseHeaderCard';
import CourseOverviewCard from './CourseOverviewCard';
import ModulesSection from './ModulesSection';
import { useCourseContent } from '@/lib/courses/useCourseContent';
import { useCourseActions } from '../hooks/useCourseActions';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';
import { DEFAULT_LESSON_CONTENT_TYPE } from '@/lib/api/lessons.api';
import type { Course } from '@/lib/api/courses.api';
import type { CourseModule } from '@/lib/api/modules.api';

interface CourseDetailsViewProps {
  course: Course;
  cohortName: string;
  onBack: () => void;
  onEditCourse: () => void;
  onCourseChanged: (course: Course) => void;
}

const CourseDetailsView: React.FC<CourseDetailsViewProps> = ({
  course,
  cohortName,
  onBack,
  onEditCourse,
  onCourseChanged,
}) => {
  const { showError } = useToast();
  const content = useCourseContent(course.id);
  const courseActions = useCourseActions(course, onCourseChanged);

  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [deletingModule, setDeletingModule] = useState<CourseModule | null>(
    null,
  );

  const [lessonModule, setLessonModule] = useState<CourseModule | null>(null);
  const [editingLesson, setEditingLesson] = useState<{
    moduleId: number;
    lesson: LessonToEdit;
  } | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<{
    moduleId: number;
    lessonId: number;
    lessonTitle: string;
  } | null>(null);

  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
  const [isDeleteCourseConfirmOpen, setIsDeleteCourseConfirmOpen] =
    useState(false);
  const [deletingCourse, setDeletingCourse] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState(
    course.description ?? '',
  );

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        className="b2-m inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
      >
        <ArrowLeft size={16} />
        Back to content &amp; courses
      </button>

      <CourseHeaderCard
        course={course}
        canPublish={content.modules.length > 0}
        onEditCourse={onEditCourse}
        onPublishClick={() => setIsPublishConfirmOpen(true)}
        onDeleteClick={() => setIsDeleteCourseConfirmOpen(true)}
      />

      <CourseOverviewCard
        course={course}
        cohortName={cohortName}
        moduleCount={content.modules.length}
        lessonCount={content.totalLessons}
        onEditDescription={() => {
          setDescriptionDraft(course.description ?? '');
          setIsDescriptionModalOpen(true);
        }}
      />

      <ModulesSection
        modules={content.modules}
        lessonsByModule={content.lessonsByModule}
        loading={content.loading}
        onAddModule={() => setIsAddModuleOpen(true)}
        onEditModule={setEditingModule}
        onDeleteModule={setDeletingModule}
        onAddLesson={setLessonModule}
        onEditLesson={(module, lesson) =>
          setEditingLesson({
            moduleId: module.id,
            lesson: {
              id: String(lesson.id),
              title: lesson.title,
              description: lesson.contentBody ?? undefined,
              contentType: DEFAULT_LESSON_CONTENT_TYPE,
            },
          })
        }
        onDeleteLesson={(module, lesson) =>
          setDeletingLesson({
            moduleId: module.id,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
          })
        }
      />

      <AddModuleModal
        open={isAddModuleOpen}
        onClose={() => setIsAddModuleOpen(false)}
        onSubmit={async (data) => {
          try {
            await content.addModule(data);
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
        onSubmit={async (data) => {
          if (!editingModule) return;
          try {
            await content.editModule(editingModule.id, data);
            setEditingModule(null);
          } catch (err) {
            showError(
              'Could not update module',
              getErrorMessage(err, 'Please try again.'),
            );
          }
        }}
      />

      <LessonModal
        key={editingLesson?.lesson.id ?? lessonModule?.id ?? 'lesson-modal'}
        open={!!lessonModule || !!editingLesson}
        moduleTitle={lessonModule?.title ?? ''}
        lesson={editingLesson?.lesson ?? null}
        onClose={() => {
          setLessonModule(null);
          setEditingLesson(null);
        }}
        onSubmit={async (data) => {
          try {
            if (editingLesson) {
              await content.editLesson(
                editingLesson.moduleId,
                Number(editingLesson.lesson.id),
                data,
              );
              setEditingLesson(null);
            } else if (lessonModule) {
              await content.addLesson(lessonModule.id, data);
              setLessonModule(null);
            }
          } catch (err) {
            showError(
              editingLesson
                ? 'Could not update lesson'
                : 'Could not add lesson',
              getErrorMessage(err, 'Please try again.'),
            );
          }
        }}
      />

      <DescriptionModal
        open={isDescriptionModalOpen}
        value={descriptionDraft}
        onChange={setDescriptionDraft}
        onClose={() => setIsDescriptionModalOpen(false)}
        saving={courseActions.saving}
        onSave={async () => {
          try {
            await courseActions.saveDescription(descriptionDraft);
            setIsDescriptionModalOpen(false);
          } catch (err) {
            showError(
              'Could not save description',
              getErrorMessage(err, 'Please try again.'),
            );
          }
        }}
      />

      <AppConfirmModal
        open={isPublishConfirmOpen}
        onClose={() => setIsPublishConfirmOpen(false)}
        icon={<AlertTriangle size={40} className="text-warning" />}
        title="Publish course?"
        description={
          <>
            Are you sure you want to publish{' '}
            <span className="text-primary">{course.title}</span>?
          </>
        }
        secondaryButton={{
          label: 'Cancel',
          onClick: () => setIsPublishConfirmOpen(false),
        }}
        primaryButton={{
          label: 'Yes publish',
          loading: courseActions.saving,
          onClick: async () => {
            try {
              await courseActions.publish();
              setIsPublishConfirmOpen(false);
            } catch (err) {
              showError(
                'Could not publish course',
                getErrorMessage(err, 'Please try again.'),
              );
            }
          },
        }}
      />

      <AppConfirmModal
        open={isDeleteCourseConfirmOpen}
        onClose={() => setIsDeleteCourseConfirmOpen(false)}
        icon={
          <ReportProblemIcon sx={{ fontSize: 40 }} className="text-error" />
        }
        title="Delete course?"
        description={
          <>
            Are you sure you want to delete{' '}
            <span className="text-error">{course.title}</span>? Its modules,
            lessons, resources, and assignments will all be removed. This action
            cannot be undone.
          </>
        }
        secondaryButton={{
          label: 'Cancel',
          onClick: () => setIsDeleteCourseConfirmOpen(false),
        }}
        primaryButton={{
          label: 'Yes, delete',
          color: 'error',
          loading: deletingCourse,
          onClick: async () => {
            setDeletingCourse(true);
            try {
              await courseActions.deleteCourse();
              setIsDeleteCourseConfirmOpen(false);
              onBack();
            } catch (err) {
              showError(
                'Could not delete course',
                getErrorMessage(err, 'Please try again.'),
              );
            } finally {
              setDeletingCourse(false);
            }
          },
        }}
      />

      <AppConfirmModal
        open={!!deletingModule}
        onClose={() => setDeletingModule(null)}
        icon={
          <ReportProblemIcon sx={{ fontSize: 40 }} className="text-error" />
        }
        title="Delete module?"
        description={
          <>
            Are you sure you want to delete{' '}
            <span className="text-error">{deletingModule?.title}</span>? All
            lessons in this module will be removed. This action cannot be
            undone.
          </>
        }
        secondaryButton={{
          label: 'Cancel',
          onClick: () => setDeletingModule(null),
        }}
        primaryButton={{
          label: 'Yes, delete',
          color: 'error',
          loading: content.saving,
          onClick: async () => {
            if (!deletingModule) return;
            try {
              await content.deleteModule(deletingModule);
              setDeletingModule(null);
            } catch (err) {
              showError(
                'Could not delete module',
                getErrorMessage(err, 'Please try again.'),
              );
            }
          },
        }}
      />

      <AppConfirmModal
        open={!!deletingLesson}
        onClose={() => setDeletingLesson(null)}
        icon={
          <ReportProblemIcon sx={{ fontSize: 40 }} className="text-error" />
        }
        title="Delete lesson?"
        description={
          <>
            Are you sure you want to delete{' '}
            <span className="text-error">{deletingLesson?.lessonTitle}</span>?
            This action cannot be undone.
          </>
        }
        secondaryButton={{
          label: 'Cancel',
          onClick: () => setDeletingLesson(null),
        }}
        primaryButton={{
          label: 'Yes, delete',
          color: 'error',
          loading: content.saving,
          onClick: async () => {
            if (!deletingLesson) return;
            try {
              await content.deleteLesson(
                deletingLesson.moduleId,
                deletingLesson.lessonId,
                deletingLesson.lessonTitle,
              );
              setDeletingLesson(null);
            } catch (err) {
              showError(
                'Could not delete lesson',
                getErrorMessage(err, 'Please try again.'),
              );
            }
          },
        }}
      />
    </div>
  );
};

export default CourseDetailsView;
